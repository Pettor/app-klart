mod folder;
mod git;
mod system;

/// Starts the Klart desktop app: one window showing the bundled web build, plus
/// native commands for the data folder, Git sync and notifications.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .manage(git::GitLock::default())
        .invoke_handler(tauri::generate_handler![
            folder::folder_list,
            folder::folder_stat,
            folder::folder_read,
            folder::folder_write,
            folder::folder_remove,
            folder::folder_exists,
            folder::pick_folder,
            git::git_info,
            git::git_clone,
            git::git_sync,
            system::device_name,
            system::show_notification,
            system::open_url,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Klart");
}
