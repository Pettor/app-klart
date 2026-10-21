import { useCallback } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { isFolderAccessSupported, pickFolder, requestFolderPermission } from "./FileSystemAccess";
import { clearFolderHandle, saveFolderHandle } from "./FolderHandleStore";
import type { AgentFileOptions, DeviceInfo } from "./FolderSync";
import type { StoredDesktopConnection, SyncSettings, SyncStatus } from "./SyncAtoms";
import {
  desktopConnectionAtom,
  folderPermissionAtom,
  gitAvailableAtom,
  syncConnectionAtom,
  syncDevicesAtom,
  syncRequestAtom,
  syncSettingsAtom,
  syncStatusAtom,
} from "./SyncAtoms";
import { desktop, isDesktop } from "~/core/platform/Desktop";

/** Outcome of connecting a Git clone; anything but `connected` leaves sync as it was. */
export type GitConnectResult = "connected" | "cancelled" | "not-a-repo";

export interface UseFolderSyncResult {
  /** Folder sync works here: the desktop app, or Chrome/Edge on a computer. */
  isSupported: boolean;
  /** Git sync works here: the desktop app with git installed. `null` while checking. */
  isGitSupported: boolean | null;
  isDesktop: boolean;
  status: SyncStatus;
  settings: SyncSettings;
  devices: DeviceInfo[];
  /** Opens the folder picker and starts syncing with the chosen folder. Resolves `false` when cancelled. */
  connect: () => Promise<boolean>;
  /** Picks an existing Git clone and syncs through it. */
  connectGit: () => Promise<GitConnectResult>;
  /** Picks a parent folder, clones `url` into it and syncs through the clone. */
  cloneGit: (url: string) => Promise<GitConnectResult>;
  /** Re-grants access to the remembered folder after a browser restart. */
  reconnect: () => Promise<void>;
  disconnect: () => Promise<void>;
  syncNow: () => void;
  setDeviceName: (name: string) => void;
  setAgentOption: (key: keyof AgentFileOptions, value: boolean) => void;
}

export function useFolderSync(): UseFolderSyncResult {
  const status = useAtomValue(syncStatusAtom);
  const devices = useAtomValue(syncDevicesAtom);
  const gitAvailable = useAtomValue(gitAvailableAtom);
  const [settings, setSettings] = useAtom(syncSettingsAtom);
  const [connection, setConnection] = useAtom(syncConnectionAtom);
  const setDesktopConnection = useSetAtom(desktopConnectionAtom);
  const setPermission = useSetAtom(folderPermissionAtom);
  const setSyncRequest = useSetAtom(syncRequestAtom);
  const setDevices = useSetAtom(syncDevicesAtom);
  const onDesktop = isDesktop();

  const useDesktopConnection = useCallback(
    (next: StoredDesktopConnection) => {
      setDesktopConnection(next);
      setConnection(next);
      setDevices([]);
    },
    [setConnection, setDesktopConnection, setDevices]
  );

  const connect = useCallback(async (): Promise<boolean> => {
    if (onDesktop) {
      const path = await desktop.pickFolder();
      if (!path) {
        return false;
      }
      useDesktopConnection({ kind: "desktop-folder", path });
      return true;
    }
    let picked: FileSystemDirectoryHandle;
    try {
      picked = await pickFolder();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return false;
      }
      throw error;
    }
    await saveFolderHandle(picked);
    setConnection({ kind: "browser-folder", handle: picked });
    setPermission("granted");
    return true;
  }, [onDesktop, setConnection, setPermission, useDesktopConnection]);

  const connectGit = useCallback(async (): Promise<GitConnectResult> => {
    const path = await desktop.pickFolder();
    if (!path) {
      return "cancelled";
    }
    const info = await desktop.gitInfo(path);
    if (!info.isRepo) {
      return "not-a-repo";
    }
    useDesktopConnection({ kind: "desktop-git", path });
    return "connected";
  }, [useDesktopConnection]);

  const cloneGit = useCallback(
    async (url: string): Promise<GitConnectResult> => {
      const parent = await desktop.pickFolder();
      if (!parent) {
        return "cancelled";
      }
      const path = await desktop.gitClone(url.trim(), parent);
      useDesktopConnection({ kind: "desktop-git", path });
      return "connected";
    },
    [useDesktopConnection]
  );

  const reconnect = useCallback(async () => {
    if (connection?.kind === "browser-folder") {
      setPermission(await requestFolderPermission(connection.handle));
    }
  }, [connection, setPermission]);

  const disconnect = useCallback(async () => {
    if (onDesktop) {
      setDesktopConnection(null);
    } else {
      await clearFolderHandle();
    }
    setConnection(null);
    setPermission(null);
    setDevices([]);
  }, [onDesktop, setConnection, setDesktopConnection, setDevices, setPermission]);

  return {
    isSupported: onDesktop || isFolderAccessSupported(),
    isGitSupported: onDesktop ? gitAvailable : false,
    isDesktop: onDesktop,
    status,
    settings,
    devices,
    connect,
    connectGit,
    cloneGit,
    reconnect,
    disconnect,
    syncNow: () => setSyncRequest((count) => count + 1),
    setDeviceName: (deviceName) => setSettings((current) => ({ ...current, deviceName })),
    setAgentOption: (key, value) =>
      setSettings((current) => ({ ...current, agentFiles: { ...current.agentFiles, [key]: value } })),
  };
}
