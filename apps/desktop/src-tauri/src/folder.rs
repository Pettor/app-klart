//! File access for the data folder. The web app's sync engine calls these
//! through `invoke`; every path is relative to the folder the user picked.

use serde::Serialize;
use std::fs;
use std::io::ErrorKind;
use std::path::{Component, Path, PathBuf};
use std::time::UNIX_EPOCH;
use tauri::AppHandle;
use tauri_plugin_dialog::DialogExt;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FileInfo {
    path: String,
    last_modified: u64,
}

fn to_message(error: impl std::fmt::Display) -> String {
    error.to_string()
}

/// Joins `relative` onto `root`, refusing absolute paths and `..` so nothing outside the folder is touched.
fn resolve(root: &str, relative: &str) -> Result<PathBuf, String> {
    let root = PathBuf::from(root);
    if !root.is_absolute() {
        return Err(format!(
            "Data folder must be an absolute path: {}",
            root.display()
        ));
    }
    let relative = Path::new(relative);
    for component in relative.components() {
        match component {
            Component::Normal(_) | Component::CurDir => {}
            _ => {
                return Err(format!(
                    "Invalid path in data folder: {}",
                    relative.display()
                ))
            }
        }
    }
    Ok(root.join(relative))
}

/// Milliseconds since the epoch, matching `File.lastModified` in the browser.
fn modified_ms(path: &Path) -> Result<u64, String> {
    let modified = fs::metadata(path)
        .and_then(|meta| meta.modified())
        .map_err(to_message)?;
    Ok(modified
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0))
}

fn collect(root: &Path, dir: &Path, depth: u32, files: &mut Vec<FileInfo>) -> Result<(), String> {
    let entries = match fs::read_dir(dir) {
        Ok(entries) => entries,
        Err(error) if error.kind() == ErrorKind::NotFound => return Ok(()),
        Err(error) => return Err(to_message(error)),
    };
    for entry in entries {
        let entry = entry.map_err(to_message)?;
        let name = entry.file_name();
        if name.to_string_lossy().starts_with('.') {
            continue;
        }
        let path = entry.path();
        let file_type = entry.file_type().map_err(to_message)?;
        if file_type.is_file() {
            let relative = path.strip_prefix(root).map_err(to_message)?;
            let relative = relative
                .components()
                .map(|part| part.as_os_str().to_string_lossy())
                .collect::<Vec<_>>()
                .join("/");
            files.push(FileInfo {
                path: relative,
                last_modified: modified_ms(&path)?,
            });
        } else if file_type.is_dir() && depth > 0 {
            collect(root, &path, depth - 1, files)?;
        }
    }
    Ok(())
}

/// Lists files under `dir`, descending at most `depth` folder levels. Hidden entries are skipped.
#[tauri::command]
pub async fn folder_list(root: String, dir: String, depth: u32) -> Result<Vec<FileInfo>, String> {
    let start = resolve(&root, &dir)?;
    let mut files = Vec::new();
    collect(Path::new(&root), &start, depth, &mut files)?;
    Ok(files)
}

/// The file's last-modified time, or `None` when it doesn't exist.
#[tauri::command]
pub async fn folder_stat(root: String, path: String) -> Result<Option<u64>, String> {
    let path = resolve(&root, &path)?;
    if path.is_file() {
        modified_ms(&path).map(Some)
    } else {
        Ok(None)
    }
}

#[tauri::command]
pub async fn folder_read(root: String, path: String) -> Result<String, String> {
    fs::read_to_string(resolve(&root, &path)?).map_err(to_message)
}

/// Writes atomically (temp file + rename) so sync clients never see half a file. Returns the new last-modified time.
#[tauri::command]
pub async fn folder_write(root: String, path: String, contents: String) -> Result<u64, String> {
    let target = resolve(&root, &path)?;
    let parent = target.parent().ok_or("Invalid path")?;
    fs::create_dir_all(parent).map_err(to_message)?;
    let file_name = target.file_name().ok_or("Invalid path")?.to_string_lossy();
    let temp = parent.join(format!(".{file_name}.klart-tmp"));
    fs::write(&temp, contents).map_err(to_message)?;
    fs::rename(&temp, &target).map_err(to_message)?;
    modified_ms(&target)
}

#[tauri::command]
pub async fn folder_remove(root: String, path: String) -> Result<(), String> {
    match fs::remove_file(resolve(&root, &path)?) {
        Err(error) if error.kind() != ErrorKind::NotFound => Err(to_message(error)),
        _ => Ok(()),
    }
}

#[tauri::command]
pub async fn folder_exists(root: String) -> bool {
    Path::new(&root).is_dir()
}

/// Opens the system folder picker. Resolves `None` when cancelled.
#[tauri::command]
pub async fn pick_folder(app: AppHandle) -> Option<String> {
    app.dialog()
        .file()
        .blocking_pick_folder()
        .and_then(|picked| picked.into_path().ok())
        .map(|path| path.to_string_lossy().into_owned())
}

#[cfg(test)]
mod tests {
    use super::resolve;

    #[test]
    fn resolve_rejects_paths_outside_the_folder() {
        assert!(resolve("/data", "tasks/work/1.json").is_ok());
        assert!(resolve("/data", "../etc/passwd").is_err());
        assert!(resolve("/data", "/etc/passwd").is_err());
        assert!(resolve("relative", "tasks").is_err());
    }

    #[test]
    fn writes_lists_reads_and_removes_files() {
        use super::{folder_list, folder_read, folder_remove, folder_stat, folder_write};
        use tauri::async_runtime::block_on;

        let root = std::env::temp_dir().join(format!("klart-folder-test-{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&root);
        std::fs::create_dir_all(root.join(".conflicts")).unwrap();
        let root_str = root.to_string_lossy().into_owned();
        let r = || root_str.clone();

        let modified =
            block_on(folder_write(r(), "tasks/work/T1.json".into(), "{}".into())).unwrap();
        assert!(modified > 0);
        block_on(folder_write(r(), "klart.json".into(), "{}".into())).unwrap();
        std::fs::write(root.join(".conflicts/hidden.json"), "{}").unwrap();

        let mut tasks: Vec<String> = block_on(folder_list(r(), "tasks".into(), 1))
            .unwrap()
            .into_iter()
            .map(|file| file.path)
            .collect();
        tasks.sort();
        assert_eq!(tasks, vec!["tasks/work/T1.json"]);
        assert!(block_on(folder_list(r(), "".into(), 0))
            .unwrap()
            .iter()
            .all(|f| f.path == "klart.json"));
        assert!(block_on(folder_list(r(), "missing".into(), 1))
            .unwrap()
            .is_empty());

        assert_eq!(
            block_on(folder_stat(r(), "tasks/work/T1.json".into())).unwrap(),
            Some(modified)
        );
        assert_eq!(
            block_on(folder_stat(r(), "nope.json".into())).unwrap(),
            None
        );
        assert_eq!(
            block_on(folder_read(r(), "tasks/work/T1.json".into())).unwrap(),
            "{}"
        );

        block_on(folder_remove(r(), "tasks/work/T1.json".into())).unwrap();
        block_on(folder_remove(r(), "tasks/work/T1.json".into())).unwrap();
        assert_eq!(
            block_on(folder_stat(r(), "tasks/work/T1.json".into())).unwrap(),
            None
        );
        assert!(block_on(folder_write(r(), "../escape.json".into(), "{}".into())).is_err());

        let _ = std::fs::remove_dir_all(&root);
    }
}
