import { useCallback } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { isFolderAccessSupported, pickFolder, requestFolderPermission } from "./FileSystemAccess";
import { clearFolderHandle, saveFolderHandle } from "./FolderHandleStore";
import type { AgentFileOptions, DeviceInfo } from "./FolderSync";
import { GitHubBackend, parseRepository } from "./GitHubBackend";
import type { StoredDesktopConnection, SyncSettings, SyncStatus } from "./SyncAtoms";
import {
  desktopConnectionAtom,
  folderPermissionAtom,
  gitAvailableAtom,
  githubConnectionAtom,
  syncConnectionAtom,
  syncDevicesAtom,
  syncRequestAtom,
  syncSettingsAtom,
  syncStatusAtom,
} from "./SyncAtoms";
import { desktop, isDesktop } from "~/core/platform/Desktop";

/** Outcome of connecting a Git clone; anything but `connected` leaves sync as it was. */
export type GitConnectResult = "connected" | "cancelled" | "not-a-repo";

/**
 * Outcome of connecting a GitHub repository; anything but `connected` leaves
 * sync as it was. Other problems (wrong token, no such repository) throw a
 * {@link GitHubError}.
 */
export type GitHubConnectResult = "connected" | "public" | "read-only";

export interface GitHubCredentials {
  /** GitHub username or organization that owns the repository. */
  owner: string;
  /** Repository name, `owner/name` or its URL. */
  repository: string;
  /** Personal access token with read and write access to the repository's contents. */
  token: string;
}

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
  /** Checks the token and repository, then syncs through GitHub's API. Only private repositories are accepted. */
  connectGitHub: (credentials: GitHubCredentials) => Promise<GitHubConnectResult>;
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
  const setGitHubConnection = useSetAtom(githubConnectionAtom);
  const setPermission = useSetAtom(folderPermissionAtom);
  const setSyncRequest = useSetAtom(syncRequestAtom);
  const setDevices = useSetAtom(syncDevicesAtom);
  const onDesktop = isDesktop();

  const useDesktopConnection = useCallback(
    (next: StoredDesktopConnection) => {
      setGitHubConnection(null);
      setDesktopConnection(next);
      setConnection(next);
      setDevices([]);
    },
    [setConnection, setDesktopConnection, setDevices, setGitHubConnection]
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
    setGitHubConnection(null);
    setConnection({ kind: "browser-folder", handle: picked });
    setPermission("granted");
    return true;
  }, [onDesktop, setConnection, setGitHubConnection, setPermission, useDesktopConnection]);

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

  const connectGitHub = useCallback(
    async ({ owner, repository, token }: GitHubCredentials): Promise<GitHubConnectResult> => {
      const next = { kind: "github" as const, ...parseRepository(owner, repository), token: token.trim() };
      const info = await new GitHubBackend(next).info();
      if (!info.isPrivate) {
        return "public";
      }
      if (!info.canPush) {
        return "read-only";
      }
      if (onDesktop) {
        setDesktopConnection(null);
      } else {
        await clearFolderHandle();
      }
      setGitHubConnection(next);
      setConnection(next);
      setPermission(null);
      setDevices([]);
      return "connected";
    },
    [onDesktop, setConnection, setDesktopConnection, setDevices, setGitHubConnection, setPermission]
  );

  const reconnect = useCallback(async () => {
    if (connection?.kind === "browser-folder") {
      setPermission(await requestFolderPermission(connection.handle));
    }
  }, [connection, setPermission]);

  const disconnect = useCallback(async () => {
    setGitHubConnection(null);
    if (onDesktop) {
      setDesktopConnection(null);
    } else {
      await clearFolderHandle();
    }
    setConnection(null);
    setPermission(null);
    setDevices([]);
  }, [onDesktop, setConnection, setDesktopConnection, setDevices, setGitHubConnection, setPermission]);

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
    connectGitHub,
    reconnect,
    disconnect,
    syncNow: () => setSyncRequest((count) => count + 1),
    setDeviceName: (deviceName) => setSettings((current) => ({ ...current, deviceName })),
    setAgentOption: (key, value) =>
      setSettings((current) => ({ ...current, agentFiles: { ...current.agentFiles, [key]: value } })),
  };
}
