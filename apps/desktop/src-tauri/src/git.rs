//! Git sync for the data folder, using the `git` installed on the computer so
//! the user's own SSH keys and credential helpers apply.
//!
//! One sync = commit local changes, fetch, merge (each task is its own file, so
//! merges are usually clean; a conflicting file keeps the side with the newer
//! `updatedAt` and stores the other in `.conflicts/`), then push.

use serde::Serialize;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::{Mutex, OnceLock};

/// Serialises syncs so a timer and a "Sync now" never run git at the same time.
#[derive(Default)]
pub struct GitLock(Mutex<()>);

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GitInfo {
    available: bool,
    version: Option<String>,
    is_repo: bool,
    remote_url: Option<String>,
    branch: Option<String>,
}

#[derive(Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct GitSyncResult {
    committed: bool,
    pulled: bool,
    pushed: bool,
    conflicts: u32,
}

/// GUI apps on macOS don't inherit the shell's PATH, so look in the usual places too.
fn git_binary() -> Option<&'static PathBuf> {
    static GIT: OnceLock<Option<PathBuf>> = OnceLock::new();
    GIT.get_or_init(|| {
        [
            "git",
            "/opt/homebrew/bin/git",
            "/usr/local/bin/git",
            "/usr/bin/git",
        ]
        .iter()
        .map(PathBuf::from)
        .find(|candidate| {
            command(candidate)
                .arg("--version")
                .output()
                .map(|output| output.status.success())
                .unwrap_or(false)
        })
    })
    .as_ref()
}

fn command(binary: &Path) -> Command {
    let mut command = Command::new(binary);
    // Never block on an interactive password prompt; fail and report instead.
    command.env("GIT_TERMINAL_PROMPT", "0");
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x0800_0000;
        command.creation_flags(CREATE_NO_WINDOW);
    }
    command
}

struct Repo {
    root: PathBuf,
    git: PathBuf,
}

impl Repo {
    fn open(root: &str) -> Result<Self, String> {
        let git = git_binary().ok_or("Git is not installed")?.clone();
        Ok(Self {
            root: PathBuf::from(root),
            git,
        })
    }

    /// Runs git and returns trimmed stdout, or stderr as the error.
    fn run(&self, args: &[&str]) -> Result<String, String> {
        let output = command(&self.git)
            .args(args)
            .current_dir(&self.root)
            .output()
            .map_err(|error| error.to_string())?;
        if output.status.success() {
            Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
        } else {
            let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
            Err(if stderr.is_empty() {
                format!("git {} failed", args.join(" "))
            } else {
                stderr
            })
        }
    }

    fn try_run(&self, args: &[&str]) -> Option<String> {
        self.run(args).ok().filter(|out| !out.is_empty())
    }

    /// Commits with a fallback identity when the user hasn't configured one.
    fn commit(&self, extra: &[&str]) -> Result<(), String> {
        let mut args: Vec<&str> = Vec::new();
        if self.try_run(&["config", "user.email"]).is_none() {
            args.extend(["-c", "user.name=Klart", "-c", "user.email=klart@localhost"]);
        }
        args.push("commit");
        args.extend(extra);
        self.run(&args).map(|_| ())
    }

    fn head(&self) -> Option<String> {
        self.try_run(&["rev-parse", "HEAD"])
    }
}

fn updated_at(json: &str) -> Option<String> {
    serde_json::from_str::<serde_json::Value>(json)
        .ok()?
        .get("updatedAt")?
        .as_str()
        .map(str::to_owned)
}

/// Resolves one conflicted file: newest `updatedAt` wins, the other version goes to `.conflicts/`.
fn resolve_conflict(repo: &Repo, path: &str) -> Result<(), String> {
    let ours = repo.run(&["show", &format!(":2:{path}")]).ok();
    let theirs = repo.run(&["show", &format!(":3:{path}")]).ok();
    let (winner, loser) = match (ours, theirs) {
        (Some(ours), Some(theirs)) => {
            if updated_at(&theirs) > updated_at(&ours) {
                (theirs, Some(ours))
            } else {
                (ours, Some(theirs))
            }
        }
        (Some(only), None) | (None, Some(only)) => (only, None),
        (None, None) => return Err(format!("Can't resolve conflict in {path}")),
    };

    std::fs::write(repo.root.join(path), format!("{winner}\n"))
        .map_err(|error| error.to_string())?;
    repo.run(&["add", "--", path])?;

    if let Some(loser) = loser {
        let stem = Path::new(path)
            .file_stem()
            .map(|s| s.to_string_lossy().into_owned())
            .unwrap_or_default();
        let stamp = updated_at(&loser)
            .unwrap_or_else(|| "unknown".into())
            .replace(':', "");
        let conflict = format!(".conflicts/{stem}-{stamp}.json");
        let conflict_path = repo.root.join(&conflict);
        if let Some(parent) = conflict_path.parent() {
            std::fs::create_dir_all(parent).map_err(|error| error.to_string())?;
        }
        std::fs::write(&conflict_path, format!("{loser}\n")).map_err(|error| error.to_string())?;
        repo.run(&["add", "--", &conflict])?;
    }
    Ok(())
}

fn commit_message(repo: &Repo) -> Result<Option<String>, String> {
    let status = repo.run(&["status", "--porcelain"])?;
    if status.is_empty() {
        return Ok(None);
    }
    let tasks = status
        .lines()
        .filter(|line| line.get(3..).is_some_and(|p| p.starts_with("tasks/")))
        .count();
    Ok(Some(match tasks {
        0 => "klart: update".to_string(),
        1 => "klart: 1 task updated".to_string(),
        n => format!("klart: {n} tasks updated"),
    }))
}

/// Git availability and what the folder is: used by Settings before connecting.
#[tauri::command]
pub async fn git_info(root: Option<String>) -> GitInfo {
    let Some(git) = git_binary() else {
        return GitInfo {
            available: false,
            version: None,
            is_repo: false,
            remote_url: None,
            branch: None,
        };
    };
    let version = command(git)
        .arg("--version")
        .output()
        .ok()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string());
    let repo = root.map(|root| Repo {
        root: PathBuf::from(root),
        git: git.clone(),
    });
    let is_repo = repo
        .as_ref()
        .and_then(|r| r.try_run(&["rev-parse", "--is-inside-work-tree"]))
        .as_deref()
        == Some("true");
    GitInfo {
        available: true,
        version,
        is_repo,
        remote_url: if is_repo {
            repo.as_ref()
                .and_then(|r| r.try_run(&["remote", "get-url", "origin"]))
        } else {
            None
        },
        branch: if is_repo {
            repo.as_ref()
                .and_then(|r| r.try_run(&["symbolic-ref", "--short", "HEAD"]))
        } else {
            None
        },
    }
}

/// Clones `url` into a new folder inside `parent`. Returns the clone's path.
#[tauri::command]
pub async fn git_clone(url: String, parent: String) -> Result<String, String> {
    let name = url
        .trim_end_matches('/')
        .rsplit(['/', ':'])
        .next()
        .map(|name| name.trim_end_matches(".git"))
        .filter(|name| !name.is_empty())
        .ok_or("Can't tell the repository name from the URL")?
        .to_string();
    let target = Path::new(&parent).join(&name);
    if target.exists()
        && target
            .read_dir()
            .map(|mut dir| dir.next().is_some())
            .unwrap_or(true)
    {
        return Err(format!(
            "{} already exists and isn't empty",
            target.display()
        ));
    }
    let repo = Repo::open(&parent)?;
    repo.run(&["clone", "--", &url, &name])?;
    Ok(target.to_string_lossy().into_owned())
}

/// Commits local changes, merges the remote and pushes.
#[tauri::command]
pub async fn git_sync(
    root: String,
    lock: tauri::State<'_, GitLock>,
) -> Result<GitSyncResult, String> {
    let _guard = lock.0.lock().map_err(|_| "Git sync is unavailable")?;
    sync_repo(&root)
}

fn sync_repo(root: &str) -> Result<GitSyncResult, String> {
    let repo = Repo::open(root)?;
    let mut result = GitSyncResult::default();

    if let Some(message) = commit_message(&repo)? {
        repo.run(&["add", "-A"])?;
        repo.commit(&["-m", &message])?;
        result.committed = true;
    }

    if repo.try_run(&["remote", "get-url", "origin"]).is_none() {
        return Ok(result);
    }
    // symbolic-ref also works on a fresh clone of an empty repo, where HEAD has no commit yet.
    let branch = repo.run(&["symbolic-ref", "--short", "HEAD"])?;
    repo.run(&["fetch", "origin"])?;
    let upstream = format!("origin/{branch}");
    let has_upstream = repo
        .try_run(&["rev-parse", "--verify", "--quiet", &upstream])
        .is_some();

    if has_upstream {
        let before = repo.head();
        if repo
            .run(&["merge", "--no-edit", "--autostash", &upstream])
            .is_err()
        {
            let conflicted = repo.run(&["diff", "--name-only", "--diff-filter=U"])?;
            if conflicted.is_empty() {
                let _ = repo.run(&["merge", "--abort"]);
                return Err("Merging the remote changes failed".into());
            }
            for path in conflicted.lines() {
                if let Err(error) = resolve_conflict(&repo, path) {
                    let _ = repo.run(&["merge", "--abort"]);
                    return Err(error);
                }
                result.conflicts += 1;
            }
            repo.commit(&["--no-edit"])?;
        }
        result.pulled = repo.head() != before;
    }

    let ahead = if has_upstream {
        repo.run(&["rev-list", "--count", &format!("{upstream}..HEAD")])?
            .parse::<u32>()
            .unwrap_or(0)
            > 0
    } else {
        repo.head().is_some()
    };
    if ahead {
        repo.run(&["push", "-u", "origin", &branch])?;
        result.pushed = true;
    }

    Ok(result)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    fn git(dir: &Path, args: &[&str]) {
        let repo = Repo {
            root: dir.to_path_buf(),
            git: git_binary().expect("git").clone(),
        };
        repo.run(args).expect("git command");
    }

    fn task(updated_at: &str, title: &str) -> String {
        format!("{{\n  \"id\": \"T1\",\n  \"title\": \"{title}\",\n  \"updatedAt\": \"{updated_at}\"\n}}\n")
    }

    fn clone(base: &Path, name: &str) -> PathBuf {
        git(base, &["clone", "remote.git", name]);
        let dir = base.join(name);
        git(&dir, &["config", "user.email", "test@example.com"]);
        git(&dir, &["config", "user.name", "Test"]);
        dir
    }

    fn sync(dir: &Path) -> GitSyncResult {
        sync_repo(dir.to_str().unwrap()).expect("sync")
    }

    #[test]
    fn syncs_two_clones_and_resolves_conflicts_by_updated_at() {
        if git_binary().is_none() {
            return;
        }
        let base = std::env::temp_dir().join(format!("klart-git-test-{}", std::process::id()));
        let _ = fs::remove_dir_all(&base);
        fs::create_dir_all(&base).unwrap();
        git(
            &base,
            &["init", "--bare", "--initial-branch=main", "remote.git"],
        );
        let a = clone(&base, "a");
        let b = clone(&base, "b");

        fs::create_dir_all(a.join("tasks/work")).unwrap();
        fs::write(
            a.join("tasks/work/T1.json"),
            task("2026-10-21T08:00:00Z", "first"),
        )
        .unwrap();
        let first = sync(&a);
        assert!(first.committed && first.pushed);

        let pulled = sync(&b);
        assert!(pulled.pulled);
        assert!(b.join("tasks/work/T1.json").exists());

        // Both edit the same task; B's edit is newer and must win on both sides.
        fs::write(
            a.join("tasks/work/T1.json"),
            task("2026-10-21T09:00:00Z", "from a"),
        )
        .unwrap();
        sync(&a);
        fs::write(
            b.join("tasks/work/T1.json"),
            task("2026-10-21T10:00:00Z", "from b"),
        )
        .unwrap();
        let merged = sync(&b);
        assert_eq!(merged.conflicts, 1);
        assert!(merged.pushed);
        assert!(fs::read_to_string(b.join("tasks/work/T1.json"))
            .unwrap()
            .contains("from b"));
        assert!(b.join(".conflicts/T1-2026-10-21T090000Z.json").exists());

        sync(&a);
        assert!(fs::read_to_string(a.join("tasks/work/T1.json"))
            .unwrap()
            .contains("from b"));

        let _ = fs::remove_dir_all(&base);
    }
}
