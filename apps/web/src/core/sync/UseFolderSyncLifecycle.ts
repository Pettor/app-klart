import { useEffect, useEffectEvent, useRef } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { BrowserFolderBackend } from "./BrowserFolderBackend";
import { DesktopFolderBackend } from "./DesktopFolderBackend";
import { queryFolderPermission } from "./FileSystemAccess";
import type { FolderBackend } from "./FolderBackend";
import { loadFolderHandle } from "./FolderHandleStore";
import { FolderSync } from "./FolderSync";
import { GitHubBackend, GitHubError } from "./GitHubBackend";
import type { SyncConnection, SyncStatus } from "./SyncAtoms";
import {
  desktopConnectionAtom,
  folderPermissionAtom,
  gitAvailableAtom,
  githubConnectionAtom,
  PLATFORM_DEVICE_NAMES,
  syncConnectionAtom,
  syncDevicesAtom,
  syncRequestAtom,
  syncSettingsAtom,
  syncStatusAtom,
} from "./SyncAtoms";
import { desktop, isDesktop } from "~/core/platform/Desktop";
import { klartDataAtom, todayAtom } from "~/core/tasks/KlartAtoms";
import type { KlartData } from "~/core/tasks/KlartData";
import { toUtcTimestamp } from "~/core/tasks/LocalDate";

const PULL_INTERVAL_MS = 4_000;
const PUSH_DEBOUNCE_MS = 400;
const DEVICE_TOUCH_INTERVAL_MS = 60_000;
/** Git: pull this often, and commit and push this long after the last change. */
const GIT_PULL_INTERVAL_MS = 5 * 60_000;
const GIT_COMMIT_DELAY_MS = 30_000;
/**
 * GitHub: check for new commits this often while the app is visible (an
 * unchanged branch costs one request that doesn't count against the rate
 * limit), and push this long after the last change. Device check-ins are
 * rarer so they don't add a commit every minute.
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
  const contexts = pulled.contexts !== base.contexts ? pulled.contexts : current.contexts;
  return { contexts, tasks, days };
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

function methodOf(connection: SyncConnection): SyncStatus["method"] {
  if (connection.kind === "desktop-git") {
    return "git";
  }
  return connection.kind === "github" ? "github" : "folder";
}

/** Keeps the connected data folder (and its Git remote) and the app in sync. Mount once, near the app root. */
export function useFolderSyncLifecycle(): void {
  const [data, setData] = useAtom(klartDataAtom);
  const today = useAtomValue(todayAtom);
  const [settings, setSettings] = useAtom(syncSettingsAtom);
  const { deviceName } = settings;
  const [connection, setConnection] = useAtom(syncConnectionAtom);
  const storedDesktopConnection = useAtomValue(desktopConnectionAtom);
  const storedGitHubConnection = useAtomValue(githubConnectionAtom);
  const [permission, setPermission] = useAtom(folderPermissionAtom);
  const setStatus = useSetAtom(syncStatusAtom);
  const setDevices = useSetAtom(syncDevicesAtom);
  const setGitAvailable = useSetAtom(gitAvailableAtom);
  const syncRequest = useAtomValue(syncRequestAtom);

  const engineRef = useRef<FolderSync | null>(null);
  const remoteRef = useRef<Remote | null>(null);
  const gitTimerRef = useRef<number | undefined>(undefined);
  const lastRemoteSyncRef = useRef(0);
  const queueRef = useRef<Promise<void>>(Promise.resolve());
  const lastTouchRef = useRef(0);
  // Queued jobs run later; they read the latest values from here rather than what was current when queued.
  const latestRef = useRef({ data, today, settings });

  useEffect(() => {
    latestRef.current = { data, today, settings };
  }, [data, today, settings]);

  // Restore the folder chosen in an earlier session.
  const restore = useEffectEvent((isCancelled: () => boolean): void => {
    if (storedGitHubConnection) {
      setConnection(storedGitHubConnection);
      return;
    }
    if (isDesktop()) {
      if (storedDesktopConnection) {
        desktop
          .folderExists(storedDesktopConnection.path)
          .then((exists) => !isCancelled() && setConnection(exists ? storedDesktopConnection : null))
          .catch(() => undefined);
      }
      return;
    }
    loadFolderHandle()
      .then(async (stored) => {
        if (!stored || isCancelled()) {
          return;
        }
        setConnection({ kind: "browser-folder", handle: stored });
        setPermission(await queryFolderPermission(stored));
      })
      .catch(() => undefined);
  });

  useEffect(() => {
    let cancelled = false;
    restore(() => cancelled);
    return () => {
      cancelled = true;
    };
  }, []);

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

  function updateStatus(change: (current: SyncStatus) => Partial<SyncStatus>): void {
    setStatus((current) => ({ ...current, ...change(current) }));
  }

  function enqueue(job: (engine: FolderSync) => Promise<void>): void {
    queueRef.current = queueRef.current.then(async () => {
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
    const { data: base, today: date, settings: current } = latestRef.current;
    const result = await engine.pull(base, { today: date, acceptInbox: current.agentFiles.acceptInbox });
    if (result.changed) {
      setData((latest) => rebase(base, result.data, latest));
      latestRef.current = { ...latestRef.current, data: rebase(base, result.data, latestRef.current.data) };
    }
    const touchInterval =
      remoteRef.current?.kind === "github" ? GITHUB_DEVICE_TOUCH_INTERVAL_MS : DEVICE_TOUCH_INTERVAL_MS;
    if (Date.now() - lastTouchRef.current > touchInterval && document.hasFocus()) {
      lastTouchRef.current = Date.now();
      await engine.touchDevice(toUtcTimestamp(new Date()));
      setDevices(await engine.listDevices());
    }
    updateStatus(() => ({ state: "synced", error: undefined, lastSyncedAt: toUtcTimestamp(new Date()) }));
  }

  async function pushNow(engine: FolderSync): Promise<number> {
    const { data: current, today: date, settings: options } = latestRef.current;
    const written = await engine.push(current, { today: date, options: options.agentFiles });
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
        await backend.commit(`klart: update from ${latestRef.current.settings.deviceName}`);
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
        window.clearTimeout(gitTimerRef.current);
        const delay = remote.kind === "github" ? GITHUB_COMMIT_DELAY_MS : GIT_COMMIT_DELAY_MS;
        gitTimerRef.current = window.setTimeout(gitSync, delay);
      }
    });
  });

  // Start or stop the engine when the folder, its permission or the device name changes.
  useEffect(() => {
    remoteRef.current = null;
    if (!connection) {
      engineRef.current = null;
      setStatus({ state: "local", method: "local" });
      return;
    }
    const method = methodOf(connection);
    const backend = createBackend(connection);
    const location = connection.kind === "browser-folder" || connection.kind === "github" ? undefined : connection.path;
    if (connection.kind === "browser-folder" && permission !== "granted") {
      engineRef.current = null;
      setStatus({ state: "needs-permission", method, folderName: backend.name });
      return;
    }

    engineRef.current = new FolderSync(backend, deviceName);
    lastTouchRef.current = 0;
    setStatus({ state: "syncing", method, folderName: backend.name, location });

    let gitTimer: number | undefined;
    if (connection.kind === "github" && backend instanceof GitHubBackend) {
      remoteRef.current = { kind: "github", backend };
      setStatus((current) => ({
        ...current,
        git: { remoteUrl: `github.com/${connection.owner}/${connection.repo}` },
      }));
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
          setStatus((current) => ({
            ...current,
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
  }, [connection, permission, deviceName, setStatus]);

  // Write local changes shortly after they happen.
  useEffect(() => {
    const timer = window.setTimeout(push, PUSH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [data, today, settings.agentFiles]);

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
