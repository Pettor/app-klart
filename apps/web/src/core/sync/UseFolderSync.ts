import { useAtom, useAtomValue, useSetAtom, useStore } from "jotai";
import { isFolderAccessSupported, pickFolder, requestFolderPermission } from "./FileSystemAccess";
import { clearFolderHandle, saveFolderHandle } from "./FolderHandleStore";
import type { AgentFileOptions, DeviceInfo } from "./FolderSync";
import { GitHubBackend, parseRepository } from "./GitHubBackend";
import type { SyncSettings } from "./SyncAtoms";
import {
  folderHandlesAtom,
  folderPermissionsAtom,
  gitAvailableAtom,
  syncDevicesAtom,
  syncDevicesByTargetAtom,
  syncRequestAtom,
  syncSettingsAtom,
  syncSetupAtom,
  syncStatusesAtom,
} from "./SyncAtoms";
import type { StoredSyncConnection, SyncOverview } from "./SyncTargets";
import {
  buildSyncOverview,
  createSyncTargetId,
  DEVICE_ONLY,
  getContextTargetId,
  makePrimarySyncTarget,
  placeNewContext,
  removeSyncTarget,
  withoutKey,
} from "./SyncTargets";
import { desktop, isDesktop } from "~/core/platform/Desktop";
import { klartDataAtom } from "~/core/tasks/KlartAtoms";

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
  /** Every sync, its state and its contexts. */
  overview: SyncOverview;
  /** Where each context syncs: a sync id, or {@link DEVICE_ONLY}. */
  contextTargets: Record<string, string>;
  settings: SyncSettings;
  devices: DeviceInfo[];
  /**
   * The connect actions add a new sync, or with `targetId` point that sync somewhere else.
   * Opens the folder picker and syncs with the chosen folder. Resolves `false` when cancelled.
   */
  connect: (targetId?: string) => Promise<boolean>;
  /** Picks an existing Git clone and syncs through it. */
  connectGit: (targetId?: string) => Promise<GitConnectResult>;
  /** Picks a parent folder, clones `url` into it and syncs through the clone. */
  cloneGit: (url: string, targetId?: string) => Promise<GitConnectResult>;
  /** Checks the token and repository, then syncs through GitHub's API. Only private repositories are accepted. */
  connectGitHub: (credentials: GitHubCredentials, targetId?: string) => Promise<GitHubConnectResult>;
  /** Re-grants access to a remembered folder after a browser restart; without `targetId`, the first that needs it. */
  reconnect: (targetId?: string) => Promise<void>;
  /** Stops syncing with one sync. Its contexts stay on this device. */
  remove: (targetId: string) => Promise<void>;
  /** Stops syncing altogether. */
  disconnect: () => Promise<void>;
  rename: (targetId: string, name: string) => void;
  makePrimary: (targetId: string) => void;
  /** Puts a just-created context in a sync. Contexts live where they were created and can't be moved. */
  placeNewContext: (contextId: string, targetId: string) => void;
  syncNow: () => void;
  setDeviceName: (name: string) => void;
  setAgentOption: (key: keyof AgentFileOptions, value: boolean) => void;
}

function baseName(path: string): string {
  return path.split(/[\\/]/).filter(Boolean).at(-1) ?? path;
}

export function useFolderSync(): UseFolderSyncResult {
  const store = useStore();
  const data = useAtomValue(klartDataAtom);
  const statuses = useAtomValue(syncStatusesAtom);
  const devices = useAtomValue(syncDevicesAtom);
  const gitAvailable = useAtomValue(gitAvailableAtom);
  const [settings, setSettings] = useAtom(syncSettingsAtom);
  const [setup, setSetup] = useAtom(syncSetupAtom);
  const setHandles = useSetAtom(folderHandlesAtom);
  const setPermissions = useSetAtom(folderPermissionsAtom);
  const setSyncRequest = useSetAtom(syncRequestAtom);
  const setDevicesByTarget = useSetAtom(syncDevicesByTargetAtom);
  const onDesktop = isDesktop();

  /** Adds a sync, or points `targetId` at a new place. Returns the sync's id. */
  function save(targetId: string | undefined, connection: StoredSyncConnection, name: string): string {
    const id = targetId ?? createSyncTargetId();
    setSetup((current) => {
      if (current.targets.some((target) => target.id === id)) {
        return {
          ...current,
          targets: current.targets.map((target) => (target.id === id ? { ...target, connection } : target)),
        };
      }
      return { ...current, targets: [...current.targets, { id, name, connection }] };
    });
    setDevicesByTarget((all) => withoutKey(all, id));
    return id;
  }

  async function connect(targetId?: string): Promise<boolean> {
    if (onDesktop) {
      const path = await desktop.pickFolder();
      if (!path) {
        return false;
      }
      save(targetId, { kind: "desktop-folder", path }, baseName(path));
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
    const id = targetId ?? createSyncTargetId();
    await saveFolderHandle(id, picked);
    setHandles((all) => ({ ...all, [id]: picked }));
    setPermissions((all) => ({ ...all, [id]: "granted" }));
    save(id, { kind: "browser-folder" }, picked.name);
    return true;
  }

  async function connectGit(targetId?: string): Promise<GitConnectResult> {
    const path = await desktop.pickFolder();
    if (!path) {
      return "cancelled";
    }
    const info = await desktop.gitInfo(path);
    if (!info.isRepo) {
      return "not-a-repo";
    }
    save(targetId, { kind: "desktop-git", path }, baseName(path));
    return "connected";
  }

  async function cloneGit(url: string, targetId?: string): Promise<GitConnectResult> {
    const parent = await desktop.pickFolder();
    if (!parent) {
      return "cancelled";
    }
    const path = await desktop.gitClone(url.trim(), parent);
    save(targetId, { kind: "desktop-git", path }, baseName(path));
    return "connected";
  }

  async function connectGitHub(
    { owner, repository, token }: GitHubCredentials,
    targetId?: string
  ): Promise<GitHubConnectResult> {
    const next = { kind: "github" as const, ...parseRepository(owner, repository), token: token.trim() };
    const info = await new GitHubBackend(next).info();
    if (!info.isPrivate) {
      return "public";
    }
    if (!info.canPush) {
      return "read-only";
    }
    save(targetId, next, next.repo);
    return "connected";
  }

  async function reconnect(targetId?: string): Promise<void> {
    const permissions = store.get(folderPermissionsAtom);
    const handles = store.get(folderHandlesAtom);
    const id =
      targetId ??
      setup.targets.find(
        (target) => target.connection.kind === "browser-folder" && permissions[target.id] !== "granted"
      )?.id;
    const handle = id ? handles[id] : undefined;
    if (id && handle) {
      const granted = await requestFolderPermission(handle);
      setPermissions((all) => ({ ...all, [id]: granted }));
    }
  }

  async function forgetFolder(targetId: string): Promise<void> {
    if (!onDesktop) {
      await clearFolderHandle(targetId);
    }
    setHandles((all) => withoutKey(all, targetId));
    setPermissions((all) => withoutKey(all, targetId));
  }

  async function remove(targetId: string): Promise<void> {
    setSetup((current) => removeSyncTarget(current, targetId, data.contexts));
    await forgetFolder(targetId);
  }

  async function disconnect(): Promise<void> {
    const ids = setup.targets.map((target) => target.id);
    setSetup({ targets: [], contextTargets: {} });
    await Promise.all(ids.map(forgetFolder));
  }

  const contextTargets: Record<string, string> = {};
  for (const context of data.contexts) {
    contextTargets[context.id] = getContextTargetId(setup, context.id) ?? DEVICE_ONLY;
  }

  return {
    isSupported: onDesktop || isFolderAccessSupported(),
    isGitSupported: onDesktop ? gitAvailable : false,
    isDesktop: onDesktop,
    overview: buildSyncOverview(setup, statuses, data.contexts),
    contextTargets,
    settings,
    devices,
    connect,
    connectGit,
    cloneGit,
    connectGitHub,
    reconnect,
    remove,
    disconnect,
    rename: (targetId, name) =>
      setSetup((current) => ({
        ...current,
        targets: current.targets.map((target) => (target.id === targetId ? { ...target, name } : target)),
      })),
    makePrimary: (targetId) => setSetup((current) => makePrimarySyncTarget(current, targetId, data.contexts)),
    placeNewContext: (contextId, targetId) => setSetup((current) => placeNewContext(current, contextId, targetId)),
    syncNow: () => setSyncRequest((count) => count + 1),
    setDeviceName: (deviceName) => setSettings((current) => ({ ...current, deviceName })),
    setAgentOption: (key, value) =>
      setSettings((current) => ({ ...current, agentFiles: { ...current.agentFiles, [key]: value } })),
  };
}
