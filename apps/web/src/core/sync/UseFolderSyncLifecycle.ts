import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { useAtomValue, useSetAtom, useStore } from "jotai";
import { BrowserFolderBackend } from "./BrowserFolderBackend";
import { DesktopFolderBackend } from "./DesktopFolderBackend";
import { queryFolderPermission } from "./FileSystemAccess";
import type { FolderBackend } from "./FolderBackend";
import { LEGACY_FOLDER_KEY, loadFolderHandle } from "./FolderHandleStore";
import { FolderSync } from "./FolderSync";
import { GitHubBackend, GitHubError } from "./GitHubBackend";
import type { SyncConnection, SyncStatus } from "./SyncAtoms";
import {
  folderHandlesAtom,
  folderPermissionsAtom,
  gitAvailableAtom,
  PLATFORM_DEVICE_NAMES,
  SYNC_SETUP_KEY,
  syncDevicesByTargetAtom,
  syncRequestAtom,
  syncSettingsAtom,
  syncSetupAtom,
  syncStatusesAtom,
} from "./SyncAtoms";
import type { StoredSyncConnection, SyncTarget } from "./SyncTargets";
import { assignFoundContexts, getSyncScope, methodOfConnection, withoutKey } from "./SyncTargets";
import { desktop, isDesktop } from "~/core/platform/Desktop";
import { klartDataAtom, todayAtom } from "~/core/tasks/KlartAtoms";
import type { KlartData } from "~/core/tasks/KlartData";
import { toUtcTimestamp } from "~/core/tasks/LocalDate";
import { hasSampleData, withoutSampleData } from "~/core/tasks/SampleData";

const PULL_INTERVAL_MS = 4_000;
const PUSH_DEBOUNCE_MS = 400;
const DEVICE_TOUCH_INTERVAL_MS = 60_000;
/** Git: pull this often, and commit and push this long after the last change. */
const GIT_PULL_INTERVAL_MS = 5 * 60_000;
const GIT_COMMIT_DELAY_MS = 30_000;
/**
 * GitHub: check for new commits this often while the app is visible (an
 * unchanged branch costs one request that doesn't count against the rate
 * limit), and push this long after the last change. The device list is
 * re-read less often.
 */
const GITHUB_PULL_INTERVAL_MS = 60_000;
const GITHUB_COMMIT_DELAY_MS = 5_000;
const GITHUB_DEVICE_TOUCH_INTERVAL_MS = 30 * 60_000;
const GITHUB_SYNC_ATTEMPTS = 3;

/** Where local commits go: the desktop app's Git clone, or GitHub's API. */
type Remote = { kind: "git"; root: string } | { kind: "github"; backend: GitHubBackend };

/**
 * Applies what a pull changed (`pulled` vs `base`) on top of `current`, so
 * edits made while the pull was running are kept.
 */
function rebase(base: KlartData, pulled: KlartData, current: KlartData): KlartData {
  if (base === current) {
    return pulled;
  }
  const tasks = { ...current.tasks };
  for (const [id, task] of Object.entries(pulled.tasks)) {
    if (task !== base.tasks[id]) {
      tasks[id] = task;
    }
  }
  const days = { ...current.days };
  for (const [date, day] of Object.entries(pulled.days)) {
    if (day !== base.days[date]) {
      days[date] = day;
    }
  }
  const lists = { ...current.lists };
  for (const [id, list] of Object.entries(pulled.lists)) {
    if (list !== base.lists[id]) {
      lists[id] = list;
    }
  }
  const contexts = pulled.contexts !== base.contexts ? pulled.contexts : current.contexts;
  return { contexts, tasks, days, lists };
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function createBackend(connection: SyncConnection): FolderBackend {
  switch (connection.kind) {
    case "browser-folder":
      return new BrowserFolderBackend(connection.handle);
    case "github":
      return new GitHubBackend(connection);
    default:
      return new DesktopFolderBackend(connection.path);
  }
}

/** Whether the sync's folder is there: a browser folder's handle is restored, a desktop folder exists. */
type FolderState = "checking" | "ok" | "missing";

/** One queue for every sync, so two syncs never pull over the same data at once. */
let syncQueue: Promise<void> = Promise.resolve();

/**
 * Moves a browser folder connected before several syncs (kept only in
 * IndexedDB) into the sync setup, checks for git and names this device. Mount once.
 */
export function useFolderSyncLifecycle(): void {
  const store = useStore();
  const setSettings = useSetAtom(syncSettingsAtom);
  const setGitAvailable = useSetAtom(gitAvailableAtom);

  useEffect(() => {
    if (isDesktop() || localStorage.getItem(SYNC_SETUP_KEY) !== null || store.get(syncSetupAtom).targets.length) {
      return;
    }
    loadFolderHandle(LEGACY_FOLDER_KEY)
      .then((handle) => {
        if (handle) {
          store.set(syncSetupAtom, (current) =>
            current.targets.length
              ? current
              : {
                  targets: [{ id: LEGACY_FOLDER_KEY, name: handle.name, connection: { kind: "browser-folder" } }],
                  contextTargets: {},
                }
          );
        }
      })
      .catch(() => undefined);
  }, [store]);

  // Desktop: check for git, and name this device after the computer unless the user renamed it.
  useEffect(() => {
    if (!isDesktop()) {
      return;
    }
    desktop
      .gitInfo(null)
      .then((info) => setGitAvailable(info.available))
      .catch(() => setGitAvailable(false));
    desktop
      .deviceName()
      .then((name) => {
        if (name) {
          setSettings((current) =>
            PLATFORM_DEVICE_NAMES.includes(current.deviceName) ? { ...current, deviceName: name } : current
          );
        }
      })
      .catch(() => undefined);
  }, [setGitAvailable, setSettings]);
}

/** Keeps one sync's folder (and its Git remote) and its contexts in the app in sync. */
export function useSyncTargetLifecycle(target: SyncTarget): void {
  const store = useStore();
  const data = useAtomValue(klartDataAtom);
  const today = useAtomValue(todayAtom);
  const settings = useAtomValue(syncSettingsAtom);
  const setup = useAtomValue(syncSetupAtom);
  const { deviceName } = settings;
  const handles = useAtomValue(folderHandlesAtom);
  const permissions = useAtomValue(folderPermissionsAtom);
  const setStatuses = useSetAtom(syncStatusesAtom);
  const setDevicesByTarget = useSetAtom(syncDevicesByTargetAtom);
  const syncRequest = useAtomValue(syncRequestAtom);

  const targetId = target.id;
  // The connection is compared by value, so renaming the sync or reassigning contexts doesn't restart it.
  const connectionKey = JSON.stringify(target.connection);
  const handle = handles[targetId];
  const permission = permissions[targetId] ?? null;
  const [checked, setChecked] = useState<{ key: string; state: FolderState }>({ key: "", state: "checking" });
  const folderState: FolderState =
    target.connection.kind === "github" ? "ok" : checked.key === connectionKey ? checked.state : "checking";

  const connection = useMemo((): SyncConnection | null => {
    const stored = JSON.parse(connectionKey) as StoredSyncConnection;
    if (stored.kind === "browser-folder") {
      return handle ? { kind: "browser-folder", handle } : null;
    }
    return stored;
  }, [connectionKey, handle]);

  const engineRef = useRef<FolderSync | null>(null);
  const remoteRef = useRef<Remote | null>(null);
  const gitTimerRef = useRef<number | undefined>(undefined);
  const lastRemoteSyncRef = useRef(0);
  const lastTouchRef = useRef(0);

  function setStatus(status: SyncStatus): void {
    setStatuses((all) => ({ ...all, [targetId]: status }));
  }

  function updateStatus(change: (current: SyncStatus) => Partial<SyncStatus>): void {
    setStatuses((all) => {
      const current = all[targetId] ?? { state: "syncing", method: methodOfConnection(target.connection) };
      return { ...all, [targetId]: { ...current, ...change(current) } };
    });
  }

  // Find the folder chosen in an earlier session: a browser folder's handle, or a desktop folder on disk.
  useEffect(() => {
    let cancelled = false;
    const stored = JSON.parse(connectionKey) as StoredSyncConnection;
    function settle(state: FolderState): void {
      if (!cancelled) {
        setChecked({ key: connectionKey, state });
      }
    }
    if (stored.kind === "browser-folder") {
      const picked = store.get(folderHandlesAtom)[targetId];
      if (picked) {
        settle("ok");
        return;
      }
      loadFolderHandle(targetId)
        .then(async (loaded) => {
          if (!loaded || cancelled) {
            settle("missing");
            return;
          }
          store.set(folderHandlesAtom, (all) => ({ ...all, [targetId]: loaded }));
          const granted = await queryFolderPermission(loaded);
          store.set(folderPermissionsAtom, (all) => ({ ...all, [targetId]: granted }));
          settle("ok");
        })
        .catch(() => settle("missing"));
    } else if (stored.kind !== "github") {
      desktop
        .folderExists(stored.path)
        .then((exists) => settle(exists ? "ok" : "missing"))
        .catch(() => settle("missing"));
    }
    return () => {
      cancelled = true;
    };
  }, [connectionKey, targetId, store]);

  // Forget this sync's state when it's removed.
  useEffect(
    () => () => {
      setStatuses((all) => withoutKey(all, targetId));
      setDevicesByTarget((all) => withoutKey(all, targetId));
    },
    [targetId, setStatuses, setDevicesByTarget]
  );

  function enqueue(job: (engine: FolderSync) => Promise<void>): void {
    syncQueue = syncQueue.then(async () => {
      const engine = engineRef.current;
      if (!engine) {
        return;
      }
      try {
        await job(engine);
      } catch (error) {
        updateStatus(() => ({ state: "error", error: describe(error) }));
      }
    });
  }

  async function pullNow(engine: FolderSync): Promise<void> {
    // Read everything when the job runs, not when it was queued: another sync may have pulled in between.
    const base = store.get(klartDataAtom);
    const scope = getSyncScope(store.get(syncSetupAtom), targetId);
    const result = await engine.pull(base, {
      today: store.get(todayAtom),
      acceptInbox: store.get(syncSettingsAtom).agentFiles.acceptInbox,
      scope,
    });
    if (result.changed) {
      store.set(klartDataAtom, (latest) => rebase(base, result.data, latest));
    }
    if (result.contextIds) {
      const current = store.get(syncSetupAtom);
      const next = assignFoundContexts(current, targetId, result.contextIds);
      if (next !== current) {
        store.set(syncSetupAtom, next);
      }
    }
    const touchInterval =
      remoteRef.current?.kind === "github" ? GITHUB_DEVICE_TOUCH_INTERVAL_MS : DEVICE_TOUCH_INTERVAL_MS;
    if (Date.now() - lastTouchRef.current > touchInterval && document.hasFocus()) {
      lastTouchRef.current = Date.now();
      // With a Git remote a check-in alone would be a commit; it rides along with the next real change instead (see push).
      if (!remoteRef.current) {
        await engine.touchDevice(toUtcTimestamp(new Date()));
      }
      const devices = await engine.listDevices();
      setDevicesByTarget((all) => ({ ...all, [targetId]: devices }));
    }
    updateStatus(() => ({ state: "synced", error: undefined, lastSyncedAt: toUtcTimestamp(new Date()) }));
  }

  async function pushNow(engine: FolderSync): Promise<number> {
    const written = await engine.push(store.get(klartDataAtom), {
      today: store.get(todayAtom),
      options: store.get(syncSettingsAtom).agentFiles,
      scope: getSyncScope(store.get(syncSetupAtom), targetId),
    });
    updateStatus(() => ({ state: "synced", error: undefined, lastSyncedAt: toUtcTimestamp(new Date()) }));
    return written;
  }

  /** Brings in GitHub's newest commit, merges it, and pushes local changes as one commit; retries when beaten to it. */
  async function githubSyncNow(engine: FolderSync, backend: GitHubBackend): Promise<void> {
    for (let attempt = 1; ; attempt += 1) {
      await backend.refresh();
      await pullNow(engine);
      await pushNow(engine);
      try {
        await backend.commit(`klart: update from ${store.get(syncSettingsAtom).deviceName}`);
        return;
      } catch (error) {
        if (!(error instanceof GitHubError && error.kind === "conflict") || attempt >= GITHUB_SYNC_ATTEMPTS) {
          throw error;
        }
      }
    }
  }

  const pull = useEffectEvent((): void => {
    enqueue(pullNow);
  });

  const gitSync = useEffectEvent((): void => {
    window.clearTimeout(gitTimerRef.current);
    enqueue(async (engine) => {
      const remote = remoteRef.current;
      if (!remote) {
        return;
      }
      lastRemoteSyncRef.current = Date.now();
      if (remote.kind === "github") {
        try {
          await githubSyncNow(engine, remote.backend);
          updateStatus((current) => ({
            git: {
              ...current.git,
              branch: remote.backend.currentBranch ?? undefined,
              lastSyncedAt: toUtcTimestamp(new Date()),
              error: undefined,
              errorKind: undefined,
            },
          }));
        } catch (error) {
          const errorKind = error instanceof GitHubError ? error.kind : undefined;
          updateStatus((current) => ({ git: { ...current.git, error: describe(error), errorKind } }));
        }
        return;
      }
      try {
        const result = await desktop.gitSync(remote.root);
        updateStatus((current) => ({
          git: {
            ...current.git,
            lastSyncedAt: toUtcTimestamp(new Date()),
            error: undefined,
            conflicts: result.conflicts,
          },
        }));
        if (result.pulled) {
          await pullNow(engine);
        }
      } catch (error) {
        updateStatus((current) => ({ git: { ...current.git, error: describe(error) } }));
      }
    });
  });

  const push = useEffectEvent((): void => {
    enqueue(async (engine) => {
      const written = await pushNow(engine);
      const remote = remoteRef.current;
      if (written > 0 && remote) {
        await engine.touchDevice(toUtcTimestamp(new Date()));
        window.clearTimeout(gitTimerRef.current);
        const delay = remote.kind === "github" ? GITHUB_COMMIT_DELAY_MS : GIT_COMMIT_DELAY_MS;
        gitTimerRef.current = window.setTimeout(gitSync, delay);
      }
    });
  });

  // Start or stop the engine when the folder, its permission or the device name changes.
  const start = useEffectEvent((): (() => void) | undefined => {
    remoteRef.current = null;
    const method = methodOfConnection(JSON.parse(connectionKey) as StoredSyncConnection);
    if (folderState === "missing") {
      engineRef.current = null;
      setStatus({ state: "missing", method });
      return undefined;
    }
    if (!connection || folderState === "checking") {
      engineRef.current = null;
      setStatus({ state: "syncing", method });
      return undefined;
    }
    const backend = createBackend(connection);
    const location = connection.kind === "browser-folder" || connection.kind === "github" ? undefined : connection.path;
    if (connection.kind === "browser-folder" && permission !== "granted") {
      engineRef.current = null;
      setStatus({ state: "needs-permission", method, folderName: backend.name });
      return undefined;
    }

    // Dev sample data stays on this device: drop it before the first sync so it never reaches a real folder.
    if (hasSampleData(store.get(klartDataAtom))) {
      store.set(klartDataAtom, withoutSampleData);
    }

    engineRef.current = new FolderSync(backend, deviceName);
    lastTouchRef.current = 0;
    setStatus({
      state: "syncing",
      method,
      folderName: backend.name,
      location,
      git:
        connection.kind === "github" ? { remoteUrl: `github.com/${connection.owner}/${connection.repo}` } : undefined,
    });

    let gitTimer: number | undefined;
    if (connection.kind === "github" && backend instanceof GitHubBackend) {
      remoteRef.current = { kind: "github", backend };
      // Pull GitHub's newest commit before reading the snapshot.
      gitSync();
      gitTimer = window.setInterval(() => {
        if (document.visibilityState === "visible") {
          gitSync();
        }
      }, GITHUB_PULL_INTERVAL_MS);
    } else if (connection.kind === "desktop-git") {
      remoteRef.current = { kind: "git", root: connection.path };
      desktop
        .gitInfo(connection.path)
        .then((info) =>
          updateStatus((current) => ({
            git: { ...current.git, remoteUrl: info.remoteUrl ?? undefined, branch: info.branch ?? undefined },
          }))
        )
        .catch(() => undefined);
      // Bring in other devices' changes before reading the folder.
      gitSync();
      gitTimer = window.setInterval(gitSync, GIT_PULL_INTERVAL_MS);
    }
    pull();
    push();

    function pullWhenVisible(): void {
      if (document.visibilityState === "visible") {
        pull();
      }
    }

    // GitHub on a phone: sync when the app comes back, and push pending changes before it's put away.
    function syncGitHubOnVisibility(): void {
      const remote = remoteRef.current;
      if (remote?.kind !== "github") {
        return;
      }
      if (document.visibilityState === "hidden") {
        if (remote.backend.hasChanges) {
          gitSync();
        }
      } else if (Date.now() - lastRemoteSyncRef.current > GITHUB_COMMIT_DELAY_MS) {
        gitSync();
      }
    }

    const timer = window.setInterval(pullWhenVisible, PULL_INTERVAL_MS);
    window.addEventListener("focus", pullWhenVisible);
    document.addEventListener("visibilitychange", syncGitHubOnVisibility);
    return () => {
      window.clearInterval(timer);
      window.clearInterval(gitTimer);
      window.removeEventListener("focus", pullWhenVisible);
      document.removeEventListener("visibilitychange", syncGitHubOnVisibility);
      engineRef.current = null;
      remoteRef.current = null;
    };
  });

  useEffect(() => start(), [connection, folderState, permission, deviceName]);

  // Write local changes shortly after they happen, and when contexts move between syncs.
  useEffect(() => {
    const timer = window.setTimeout(push, PUSH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [data, today, settings.agentFiles, setup]);

  // "Sync now" from settings.
  useEffect(() => {
    if (syncRequest > 0) {
      pull();
      push();
      if (remoteRef.current) {
        gitSync();
      }
    }
  }, [syncRequest]);
}
