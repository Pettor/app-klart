import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { FolderPermission } from "./FileSystemAccess";
import type { AgentFileOptions, DeviceInfo } from "./FolderSync";

export interface SyncSettings {
  /** Shown to other devices in `devices/<name>/`. */
  deviceName: string;
  agentFiles: AgentFileOptions;
}

export type SyncState = "local" | "syncing" | "synced" | "error" | "needs-permission";

export interface SyncStatus {
  state: SyncState;
  folderName?: string;
  lastSyncedAt?: string;
  error?: string;
}

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

/** The connected data folder, restored from IndexedDB on start. */
export const folderHandleAtom = atom<FileSystemDirectoryHandle | null>(null);

export const folderPermissionAtom = atom<FolderPermission | null>(null);

export const syncStatusAtom = atom<SyncStatus>({ state: "local" });

export const syncDevicesAtom = atom<DeviceInfo[]>([]);

/** Bumped to ask the sync lifecycle for an immediate pull and push. */
export const syncRequestAtom = atom<number>(0);
