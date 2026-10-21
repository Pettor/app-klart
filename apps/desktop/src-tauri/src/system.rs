//! Small native helpers: the computer's name and system notifications.

use std::process::Command;
use tauri::AppHandle;
use tauri_plugin_notification::NotificationExt;

fn run(program: &str, args: &[&str]) -> Option<String> {
    let output = Command::new(program).args(args).output().ok()?;
    let text = String::from_utf8_lossy(&output.stdout).trim().to_string();
    (output.status.success() && !text.is_empty()).then_some(text)
}

/// The name the user gave this computer, e.g. "Petter's MacBook Air". Used as the default device name.
#[tauri::command]
pub async fn device_name() -> Option<String> {
    if cfg!(target_os = "macos") {
        run("scutil", &["--get", "ComputerName"])
    } else if cfg!(windows) {
        std::env::var("COMPUTERNAME").ok()
    } else {
        run("hostname", &[])
    }
}

/// Shows a system notification. Desktop apps don't need to ask permission first.
#[tauri::command]
pub fn show_notification(app: AppHandle, title: String, body: String) -> Result<(), String> {
    app.notification()
        .builder()
        .title(title)
        .body(body)
        .show()
        .map_err(|error| error.to_string())
}
