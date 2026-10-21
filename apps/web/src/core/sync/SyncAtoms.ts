import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { FolderPermission } from "./FileSystemAccess";
import type { AgentFileOptions, DeviceInfo } from "./FolderSync";

export interface SyncSettings {
  /** Shown to other devices in `devices/<name>/`. */
  deviceName: string;
  agentFiles: AgentFileOptions;
}

export type SyncMethod = "local" | "folder" | "git";

export type SyncState = "local" | "syncing" | "synced" | "error" | "needs-permission";

export interface GitSyncStatus {
  remoteUrl?: string;
  branch?: string;
  lastSyncedAt?: string;
  error?: string;
  /** Conflicts resolved in the last sync; the losing versions are in `.conflicts/`. */
  conflicts?: number;
}

export interface SyncStatus {
  state: SyncState;
  method: SyncMethod;
  folderName?: string;
  /** Full path of the folder (desktop app only). */
  location?: string;
  lastSyncedAt?: string;
  error?: string;
  git?: GitSyncStatus;
}

/**
 * Where the data lives:
 * - `browser-folder`: a folder opened with the File System Access API (Chrome, Edge)
 * - `desktop-folder`: a folder on disk, through the desktop app (e.g. inside OneDrive)
 * - `desktop-git`: a local Git clone, through the desktop app; committed, pulled and pushed automatically
 */
export type SyncConnection =
  | { kind: "browser-folder"; handle: FileSystemDirectoryHandle }
  | { kind: "desktop-folder"; path: string }
  | { kind: "desktop-git"; path: string };

/** The desktop app remembers its folder by path; the browser keeps a handle in IndexedDB instead. */
export type StoredDesktopConnection = Extract<SyncConnection, { kind: "desktop-folder" | "desktop-git" }>;

export const PLATFORM_DEVICE_NAMES = ["Mac", "Windows PC", "Linux PC", "This device"];

function defaultDeviceName(): string {
  const platform = typeof navigator === "undefined" ? "" : navigator.platform;
  if (/mac/i.test(platform)) {
    return "Mac";
  }
  if (/win/i.test(platform)) {
    return "Windows PC";
  }
  if (/linux/i.test(platform)) {
    return "Linux PC";
  }
  return "This device";
}

export const syncSettingsAtom = atomWithStorage<SyncSettings>(
  "klart-sync",
  {
    deviceName: defaultDeviceName(),
    agentFiles: { writeViews: true, acceptInbox: true, keepLlmsTxt: true },
  },
  undefined,
  { getOnInit: true }
);

export const desktopConnectionAtom = atomWithStorage<StoredDesktopConnection | null>(
  "klart-desktop-connection",
  null,
  undefined,
  { getOnInit: true }
);

/** The connected data folder, restored on start. */
export const syncConnectionAtom = atom<SyncConnection | null>(null);

/** Browser folders only: whether the browser still lets us open the folder. */
export const folderPermissionAtom = atom<FolderPermission | null>(null);

export const syncStatusAtom = atom<SyncStatus>({ state: "local", method: "local" });

export const syncDevicesAtom = atom<DeviceInfo[]>([]);

/** Desktop app only: whether `git` is installed. `null` until checked. */
export const gitAvailableAtom = atom<boolean | null>(null);

/** Bumped to ask the sync lifecycle for an immediate pull and push (and Git sync). */
export const syncRequestAtom = atom<number>(0);
