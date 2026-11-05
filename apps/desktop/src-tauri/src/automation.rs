//! Runs a user's automation command (e.g. `claude -p "/daily-todo"`) from the My Day "Run" button.
//! Commands come only from this device's own settings, never from the synced folder.

use serde::Serialize;
use std::process::Command;

/// Keep the tail of long output; the app only shows the last lines.
const MAX_OUTPUT: usize = 4096;

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct CommandOutput {
    code: Option<i32>,
    stdout: String,
    stderr: String,
}

fn tail(bytes: &[u8]) -> String {
    let text = String::from_utf8_lossy(bytes);
    let text = text.trim();
    let mut start = text.len().saturating_sub(MAX_OUTPUT);
    while !text.is_char_boundary(start) {
        start += 1;
    }
    text[start..].to_string()
}

/// GUI apps don't inherit the shell's PATH, so run through a login shell to get the user's tools.
fn shell(command: &str) -> Command {
    if cfg!(windows) {
        let mut shell = Command::new("cmd");
        shell.args(["/C", command]);
        #[cfg(windows)]
        {
            use std::os::windows::process::CommandExt;
            const CREATE_NO_WINDOW: u32 = 0x0800_0000;
            shell.creation_flags(CREATE_NO_WINDOW);
        }
        shell
    } else {
        let program = std::env::var("SHELL").unwrap_or_else(|_| "/bin/sh".into());
        let mut shell = Command::new(program);
        shell.args(["-lc", command]);
        shell
    }
}

// ponytail: no timeout; add a kill after N minutes if scripts hang.
#[tauri::command]
pub async fn run_command(command: String, cwd: Option<String>) -> Result<CommandOutput, String> {
    let mut shell = shell(&command);
    if let Some(cwd) = cwd.filter(|dir| !dir.is_empty()) {
        shell.current_dir(cwd);
    }
    let output = shell.output().map_err(|error| error.to_string())?;
    Ok(CommandOutput {
        code: output.status.code(),
        stdout: tail(&output.stdout),
        stderr: tail(&output.stderr),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn runs_a_command_in_the_shell() {
        let output = tauri::async_runtime::block_on(run_command("echo hi".into(), None)).unwrap();
        assert_eq!(output.code, Some(0));
        assert_eq!(output.stdout, "hi");
    }

    #[test]
    fn keeps_the_tail_of_long_output() {
        let long = "a".repeat(MAX_OUTPUT + 10) + "end";
        let kept = tail(long.as_bytes());
        assert_eq!(kept.len(), MAX_OUTPUT);
        assert!(kept.ends_with("end"));
    }
}
