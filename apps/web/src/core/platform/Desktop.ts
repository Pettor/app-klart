import { invoke } from "@tauri-apps/api/core";

/** True inside the Klart desktop app (Tauri), false in a browser. */
export function isDesktop(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export interface DesktopFileInfo {
  /** Relative to the data folder, `/`-separated. */
  path: string;
  lastModified: number;
}

export interface DesktopGitInfo {
  available: boolean;
  version: string | null;
  isRepo: boolean;
  remoteUrl: string | null;
  branch: string | null;
}

export interface DesktopGitSyncResult {
  committed: boolean;
  pulled: boolean;
  pushed: boolean;
  conflicts: number;
}

/** Typed wrappers for the native commands in `apps/desktop/src-tauri`. Only call these when {@link isDesktop}. */
export const desktop = {
  folderList: (root: string, dir: string, depth: number): Promise<DesktopFileInfo[]> =>
    invoke("folder_list", { root, dir, depth }),
  folderStat: (root: string, path: string): Promise<number | null> => invoke("folder_stat", { root, path }),
  folderRead: (root: string, path: string): Promise<string> => invoke("folder_read", { root, path }),
  folderWrite: (root: string, path: string, contents: string): Promise<number> =>
    invoke("folder_write", { root, path, contents }),
  folderRemove: (root: string, path: string): Promise<void> => invoke("folder_remove", { root, path }),
  folderExists: (root: string): Promise<boolean> => invoke("folder_exists", { root }),
  pickFolder: (): Promise<string | null> => invoke("pick_folder"),
  gitInfo: (root: string | null): Promise<DesktopGitInfo> => invoke("git_info", { root }),
  gitClone: (url: string, parent: string): Promise<string> => invoke("git_clone", { url, parent }),
  gitSync: (root: string): Promise<DesktopGitSyncResult> => invoke("git_sync", { root }),
  deviceName: (): Promise<string | null> => invoke("device_name"),
  showNotification: (title: string, body: string): Promise<void> => invoke("show_notification", { title, body }),
};

/** Last path segment, e.g. `Klart` for `/Users/me/OneDrive/Klart`. */
export function folderNameOf(path: string): string {
  return path.split(/[\\/]/).filter(Boolean).pop() ?? path;
}
