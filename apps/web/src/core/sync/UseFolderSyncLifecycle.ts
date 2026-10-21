import { useEffect, useEffectEvent, useRef } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { queryFolderPermission } from "./FileSystemAccess";
import { loadFolderHandle } from "./FolderHandleStore";
import { FolderSync } from "./FolderSync";
import {
  folderHandleAtom,
  folderPermissionAtom,
  syncDevicesAtom,
  syncRequestAtom,
  syncSettingsAtom,
  syncStatusAtom,
} from "./SyncAtoms";
import { klartDataAtom, todayAtom } from "~/core/tasks/KlartAtoms";
import type { KlartData } from "~/core/tasks/KlartData";
import { toUtcTimestamp } from "~/core/tasks/LocalDate";

const PULL_INTERVAL_MS = 4_000;
const PUSH_DEBOUNCE_MS = 400;
const DEVICE_TOUCH_INTERVAL_MS = 60_000;

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

/** Keeps the connected data folder and the app in sync. Mount once, near the app root. */
export function useFolderSyncLifecycle(): void {
  const [data, setData] = useAtom(klartDataAtom);
  const today = useAtomValue(todayAtom);
  const settings = useAtomValue(syncSettingsAtom);
  const { deviceName } = settings;
  const [handle, setHandle] = useAtom(folderHandleAtom);
  const [permission, setPermission] = useAtom(folderPermissionAtom);
  const setStatus = useSetAtom(syncStatusAtom);
  const setDevices = useSetAtom(syncDevicesAtom);
  const syncRequest = useAtomValue(syncRequestAtom);

  const engineRef = useRef<FolderSync | null>(null);
  const queueRef = useRef<Promise<void>>(Promise.resolve());
  const lastTouchRef = useRef(0);
  // Queued jobs run later; they read the latest values from here rather than what was current when queued.
  const latestRef = useRef({ data, today, settings });

  useEffect(() => {
    latestRef.current = { data, today, settings };
  }, [data, today, settings]);

  // Restore the folder chosen in an earlier session.
  useEffect(() => {
    let cancelled = false;
    loadFolderHandle()
      .then(async (stored) => {
        if (!stored || cancelled) {
          return;
        }
        setHandle(stored);
        setPermission(await queryFolderPermission(stored));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [setHandle, setPermission]);

  function enqueue(job: (engine: FolderSync) => Promise<void>): void {
    queueRef.current = queueRef.current.then(async () => {
      const engine = engineRef.current;
      if (!engine) {
        return;
      }
      try {
        await job(engine);
      } catch (error) {
        setStatus({ state: "error", folderName: engine.folderName, error: describe(error) });
      }
    });
  }

  const pull = useEffectEvent((): void => {
    enqueue(async (engine) => {
      const { data: base, today: date, settings: current } = latestRef.current;
      const result = await engine.pull(base, { today: date, acceptInbox: current.agentFiles.acceptInbox });
      if (result.changed) {
        setData((latest) => rebase(base, result.data, latest));
      }
      if (Date.now() - lastTouchRef.current > DEVICE_TOUCH_INTERVAL_MS && document.hasFocus()) {
        lastTouchRef.current = Date.now();
        await engine.touchDevice(toUtcTimestamp(new Date()));
        setDevices(await engine.listDevices());
      }
      setStatus({ state: "synced", folderName: engine.folderName, lastSyncedAt: toUtcTimestamp(new Date()) });
    });
  });

  const push = useEffectEvent((): void => {
    enqueue(async (engine) => {
      const { data: current, today: date, settings: options } = latestRef.current;
      await engine.push(current, { today: date, options: options.agentFiles });
      setStatus({ state: "synced", folderName: engine.folderName, lastSyncedAt: toUtcTimestamp(new Date()) });
    });
  });

  // Start or stop the engine when the folder, its permission or the device name changes.
  useEffect(() => {
    if (!handle) {
      engineRef.current = null;
      setStatus({ state: "local" });
      return;
    }
    if (permission !== "granted") {
      engineRef.current = null;
      setStatus({ state: "needs-permission", folderName: handle.name });
      return;
    }
    engineRef.current = new FolderSync(handle, deviceName);
    lastTouchRef.current = 0;
    setStatus({ state: "syncing", folderName: handle.name });
    pull();
    push();

    function pullWhenVisible(): void {
      if (document.visibilityState === "visible") {
        pull();
      }
    }

    const timer = window.setInterval(pullWhenVisible, PULL_INTERVAL_MS);
    window.addEventListener("focus", pullWhenVisible);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", pullWhenVisible);
      engineRef.current = null;
    };
  }, [handle, permission, deviceName, setStatus]);

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
    }
  }, [syncRequest]);
}
