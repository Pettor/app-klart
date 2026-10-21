//! Small native helpers: the computer's name, system notifications and opening links.

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

/// Opens an `http(s)://` URL in the default browser. The webview can't open new windows itself.
#[tauri::command]
pub fn open_url(url: String) -> Result<(), String> {
    let lower = url.to_ascii_lowercase();
    if !(lower.starts_with("https://") || lower.starts_with("http://")) {
        return Err(format!("Not a web link: {url}"));
    }
    let mut command = if cfg!(target_os = "macos") {
        Command::new("open")
    } else if cfg!(windows) {
        // Not `cmd /c start`: that would interpret `&` in the URL.
        let mut command = Command::new("rundll32");
        command.arg("url.dll,FileProtocolHandler");
        command
    } else {
        Command::new("xdg-open")
    };
    command
        .arg(&url)
        .spawn()
        .map(|_| ())
        .map_err(|error| error.to_string())
}
