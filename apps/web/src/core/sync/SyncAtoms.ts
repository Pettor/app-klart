import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { FolderPermission } from "./FileSystemAccess";
import type { AgentFileOptions, DeviceInfo } from "./FolderSync";
import type { GitHubErrorKind } from "./GitHubBackend";
import type { SyncSetup, SyncTarget } from "./SyncTargets";
import { EMPTY_SYNC_SETUP } from "./SyncTargets";

export interface SyncSettings {
  /** Shown to other devices in `devices/<name>/`. */
  deviceName: string;
  agentFiles: AgentFileOptions;
}

export type SyncMethod = "local" | "folder" | "git" | "github";

/**
 * `missing`: the desktop app can't find the sync's folder any more.
 * `outdated`: a newer version of Klart wrote to the sync; this app must be updated before it syncs again.
 */
export type SyncState = "local" | "syncing" | "synced" | "error" | "needs-permission" | "missing" | "outdated";

export interface GitSyncStatus {
  remoteUrl?: string;
  branch?: string;
  lastSyncedAt?: string;
  error?: string;
  /** GitHub sync only: what kind of problem `error` is. */
  errorKind?: GitHubErrorKind;
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
  /** `outdated` only: the sync's data version, e.g. "0.8". */
  folderVersion?: string;
  git?: GitSyncStatus;
}

/**
 * Where the data lives:
 * - `browser-folder`: a folder opened with the File System Access API (Chrome, Edge)
 * - `desktop-folder`: a folder on disk, through the desktop app (e.g. inside OneDrive)
 * - `desktop-git`: a local Git clone, through the desktop app; committed, pulled and pushed automatically
 * - `github`: a GitHub repository through its REST API; works in any browser, including on phones
 */
export type SyncConnection =
  | { kind: "browser-folder"; handle: FileSystemDirectoryHandle }
  | { kind: "desktop-folder"; path: string }
  | { kind: "desktop-git"; path: string }
  | GitHubConnection;

/** Signs in with a personal access token; GitHub's API doesn't accept account passwords. */
export interface GitHubConnection {
  kind: "github";
  owner: string;
  repo: string;
  token: string;
}

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

export const SYNC_SETUP_KEY = "klart-sync-targets";

/**
 * Before several syncs, the desktop app kept its one folder in
 * `klart-desktop-connection` and GitHub sync in `klart-github-connection`.
 * They become the first sync. (A browser folder only lived in IndexedDB; the
 * lifecycle moves it over.)
 */
function migrateLegacySetup(): SyncSetup {
  if (typeof localStorage === "undefined") {
    return EMPTY_SYNC_SETUP;
  }
  function read(key: string): SyncTarget["connection"] | null {
    try {
      return JSON.parse(localStorage.getItem(key) ?? "null") as SyncTarget["connection"] | null;
    } catch {
      return null;
    }
  }
  const connection = read("klart-github-connection") ?? read("klart-desktop-connection");
  if (!connection) {
    return EMPTY_SYNC_SETUP;
  }
  const name =
    connection.kind === "github"
      ? connection.repo
      : connection.kind === "browser-folder"
        ? "Klart"
        : (connection.path.split(/[\\/]/).filter(Boolean).at(-1) ?? connection.path);
  return { targets: [{ id: "data-folder", name, connection }], contextTargets: {} };
}

/** This device's syncs and which context goes where. GitHub tokens are kept here, on this device only. */
export const syncSetupAtom = atomWithStorage<SyncSetup>(SYNC_SETUP_KEY, migrateLegacySetup(), undefined, {
  getOnInit: true,
});

/** Browser folders by sync id, restored from IndexedDB. */
export const folderHandlesAtom = atom<Record<string, FileSystemDirectoryHandle>>({});

/** Browser folders only: whether the browser still lets us open each sync's folder. */
export const folderPermissionsAtom = atom<Record<string, FolderPermission>>({});

/** Each sync's state, by sync id. */
export const syncStatusesAtom = atom<Record<string, SyncStatus>>({});

/** The devices each sync has seen, by sync id. */
export const syncDevicesByTargetAtom = atom<Record<string, DeviceInfo[]>>({});

/** Every device across all syncs, most recently active first. */
export const syncDevicesAtom = atom<DeviceInfo[]>((get) => {
  const latest = new Map<string, DeviceInfo>();
  for (const devices of Object.values(get(syncDevicesByTargetAtom))) {
    for (const device of devices) {
      const known = latest.get(device.id);
      if (!known || device.lastActiveAt > known.lastActiveAt) {
        latest.set(device.id, device);
      }
    }
  }
  return [...latest.values()].sort((a, b) => b.lastActiveAt.localeCompare(a.lastActiveAt));
});

/** Desktop app only: whether `git` is installed. `null` until checked. */
export const gitAvailableAtom = atom<boolean | null>(null);

/** Bumped to ask the sync lifecycle for an immediate pull and push (and Git sync). */
export const syncRequestAtom = atom<number>(0);
