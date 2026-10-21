import { useCallback } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { isFolderAccessSupported, pickFolder, requestFolderPermission } from "./FileSystemAccess";
import { clearFolderHandle, saveFolderHandle } from "./FolderHandleStore";
import type { AgentFileOptions, DeviceInfo } from "./FolderSync";
import type { SyncSettings, SyncStatus } from "./SyncAtoms";
import {
  folderHandleAtom,
  folderPermissionAtom,
  syncDevicesAtom,
  syncRequestAtom,
  syncSettingsAtom,
  syncStatusAtom,
} from "./SyncAtoms";

export interface UseFolderSyncResult {
  isSupported: boolean;
  status: SyncStatus;
  settings: SyncSettings;
  devices: DeviceInfo[];
  /** Opens the folder picker and starts syncing with the chosen folder. Resolves `false` when cancelled. */
  connect: () => Promise<boolean>;
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
  const [settings, setSettings] = useAtom(syncSettingsAtom);
  const [handle, setHandle] = useAtom(folderHandleAtom);
  const setPermission = useSetAtom(folderPermissionAtom);
  const setSyncRequest = useSetAtom(syncRequestAtom);
  const setDevices = useSetAtom(syncDevicesAtom);

  const connect = useCallback(async (): Promise<boolean> => {
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
    setHandle(picked);
    setPermission("granted");
    return true;
  }, [setHandle, setPermission]);

  const reconnect = useCallback(async () => {
    if (handle) {
      setPermission(await requestFolderPermission(handle));
    }
  }, [handle, setPermission]);

  const disconnect = useCallback(async () => {
    await clearFolderHandle();
    setHandle(null);
    setPermission(null);
    setDevices([]);
  }, [setDevices, setHandle, setPermission]);

  return {
    isSupported: isFolderAccessSupported(),
    status,
    settings,
    devices,
    connect,
    reconnect,
    disconnect,
    syncNow: () => setSyncRequest((count) => count + 1),
    setDeviceName: (deviceName) => setSettings((current) => ({ ...current, deviceName })),
    setAgentOption: (key, value) =>
      setSettings((current) => ({ ...current, agentFiles: { ...current.agentFiles, [key]: value } })),
  };
}
