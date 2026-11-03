import { isNewerDataVersion } from "./DataVersion";
import type { SyncScope } from "./FolderSync";
import type { GitHubConnection, SyncMethod, SyncState, SyncStatus } from "./SyncAtoms";
import type { ContextColor, KlartContext } from "~/core/contexts/KlartContext";
import type { KlartData } from "~/core/tasks/KlartData";

/** A context assigned here stays on this device and isn't written to any sync. */
export const DEVICE_ONLY = "device";

/**
 * How a sync reaches its data, as remembered between sessions. A browser
 * folder's handle can't be stored here; it lives in IndexedDB under the sync's id.
 */
export type StoredSyncConnection =
  | { kind: "browser-folder" }
  | { kind: "desktop-folder"; path: string }
  | { kind: "desktop-git"; path: string }
  | GitHubConnection;

/** One named place data syncs with, e.g. "Personal repo" or "Work OneDrive". */
export interface SyncTarget {
  id: string;
  name: string;
  connection: StoredSyncConnection;
  /**
   * The device's first sync, not read yet: on its first read it takes this
   * device's contexts that the folder doesn't have (see {@link adoptLocalContexts}).
   */
  adoptLocalData?: boolean;
}

/**
 * This device's syncs. Most people have one, and every context syncs with it.
 * With several, each context syncs with the one it's assigned to.
 */
export interface SyncSetup {
  /** The first one is the primary: it gets contexts nobody assigned. */
  targets: SyncTarget[];
  /** Context id to sync id, or {@link DEVICE_ONLY}. Contexts not listed sync with the primary. */
  contextTargets: Record<string, string>;
  /**
   * Contexts created on this device that no folder lists yet. Only these may be
   * written to a folder that doesn't list them; any other context no folder
   * lists is out of date here (removed, or moved to a sync this device doesn't have).
   */
  pendingContexts?: string[];
}

export const EMPTY_SYNC_SETUP: SyncSetup = { targets: [], contextTargets: {} };

/** A copy of `record` without `key`, for the per-sync records kept by id. */
export function withoutKey<T>(record: Record<string, T>, key: string): Record<string, T> {
  const copy = { ...record };
  delete copy[key];
  return copy;
}

export function createSyncTargetId(): string {
  return `sync-${Math.random().toString(36).slice(2, 8)}`;
}

export function methodOfConnection(connection: StoredSyncConnection): SyncMethod {
  if (connection.kind === "desktop-git") {
    return "git";
  }
  return connection.kind === "github" ? "github" : "folder";
}

/** The sync a context's data goes to, or `null` when it stays on this device. */
export function getContextTargetId(setup: SyncSetup, contextId: string): string | null {
  const assigned = setup.contextTargets[contextId];
  if (assigned === DEVICE_ONLY) {
    return null;
  }
  if (assigned && setup.targets.some((target) => target.id === assigned)) {
    return assigned;
  }
  return setup.targets[0]?.id ?? null;
}

/**
 * The context ids in each sync's `klart.json`, as this device last read or wrote
 * it. A sync that hasn't been read since the app started is missing.
 */
export type SyncListings = Record<string, string[]>;

/** Whether every sync on this device has read its folder since the app started. */
export function hasReadEverySync(setup: SyncSetup, listings: SyncListings): boolean {
  return setup.targets.every((target) => listings[target.id] !== undefined);
}

/**
 * What a sync's folder holds. The folder's own `klart.json` decides: a context
 * listed there is kept there, whatever this device's setup says, so devices
 * whose setups disagree never take contexts out of each other's folders. A
 * context listed in no folder goes to the sync it's assigned to only when it
 * was created on this device ({@link SyncSetup.pendingContexts}), and only once
 * every sync has been read, so it's never copied into a second folder. Any other
 * context no folder lists is out of date here and is never written back.
 */
export function getSyncScope(setup: SyncSetup, targetId: string, listings: SyncListings): SyncScope {
  const listed = new Set(listings[targetId] ?? []);
  const allRead = hasReadEverySync(setup, listings);
  const listedAnywhere = new Set(setup.targets.flatMap((target) => listings[target.id] ?? []));
  const pending = new Set(setup.pendingContexts ?? []);
  return {
    ownsContext: (contextId) =>
      listed.has(contextId) ||
      (allRead &&
        pending.has(contextId) &&
        !listedAnywhere.has(contextId) &&
        getContextTargetId(setup, contextId) === targetId),
    isPrimary: setup.targets[0]?.id === targetId,
  };
}

/** Drops pending contexts a folder now lists: they've been placed. */
export function settlePendingContexts(setup: SyncSetup, listings: SyncListings): SyncSetup {
  const pending = setup.pendingContexts ?? [];
  const listed = new Set(Object.values(listings).flat());
  const left = pending.filter((id) => !listed.has(id));
  return left.length === pending.length ? setup : { ...setup, pendingContexts: left };
}

/**
 * The first read of a device's first sync: the folder gets this device's
 * contexts it doesn't list, so data made before connecting isn't lost. An empty
 * folder gets every context; an existing one only those with tasks or shopping
 * lists, so the starter contexts of a new device stay out of it.
 */
export function adoptLocalContexts(
  setup: SyncSetup,
  targetId: string,
  data: Pick<KlartData, "contexts" | "tasks" | "lists">,
  listed: string[]
): SyncSetup {
  const target = setup.targets.find((candidate) => candidate.id === targetId);
  if (!target?.adoptLocalData) {
    return setup;
  }
  const inFolder = new Set(listed);
  const used = new Set([
    ...Object.values(data.tasks).map((task) => task.context),
    ...Object.values(data.lists).map((list) => list.context),
  ]);
  const adopted = data.contexts
    .map((context) => context.id)
    .filter((id) => !inFolder.has(id) && (listed.length === 0 || used.has(id)));
  const pending = setup.pendingContexts ?? [];
  return {
    ...setup,
    targets: setup.targets.map((candidate) =>
      candidate.id === targetId ? { ...candidate, adoptLocalData: undefined } : candidate
    ),
    pendingContexts: [...pending, ...adopted.filter((id) => !pending.includes(id))],
  };
}

/**
 * Contexts this device holds that no sync lists, once every sync has been read:
 * another device removed them, or moved them to a sync this device doesn't
 * have. They're dropped here instead of being written back. Contexts created on
 * this device and not placed yet, and ones kept on this device on purpose, stay.
 * Never every context, so a device whose folders all look empty keeps its data.
 */
export function findStaleContexts(setup: SyncSetup, listings: SyncListings, contexts: KlartContext[]): string[] {
  if (setup.targets.length === 0 || !hasReadEverySync(setup, listings)) {
    return [];
  }
  const listed = new Set(setup.targets.flatMap((target) => listings[target.id] ?? []));
  const pending = new Set(setup.pendingContexts ?? []);
  const stale = contexts
    .map((context) => context.id)
    .filter((id) => !listed.has(id) && !pending.has(id) && setup.contextTargets[id] !== DEVICE_ONLY);
  return stale.length < contexts.length ? stale : [];
}

/**
 * Contexts found in a sync's `klart.json` live in that sync, which is how a
 * device learns where every context lives. One kept on this device (e.g. after
 * its sync was removed) is picked up again. One assigned to another sync stays
 * there while that sync lists it too (or hasn't been read yet); an assignment
 * its own folder doesn't back up is out of date and moves here.
 */
export function assignFoundContexts(
  setup: SyncSetup,
  targetId: string,
  contextIds: string[],
  listings: SyncListings
): SyncSetup {
  const found = contextIds.filter((id) => {
    const current = getContextTargetId(setup, id);
    if (current === targetId) {
      return false;
    }
    if (current === null) {
      return true;
    }
    const listedThere = listings[current];
    return listedThere !== undefined && !listedThere.includes(id);
  });
  if (found.length === 0) {
    return setup;
  }
  const contextTargets = { ...setup.contextTargets };
  for (const id of found) {
    contextTargets[id] = targetId;
  }
  return { ...setup, contextTargets };
}

/**
 * Puts a new context in the sync it was created in. It lives there from then on;
 * contexts can't be moved between syncs.
 */
export function placeNewContext(setup: SyncSetup, contextId: string, targetId: string): SyncSetup {
  if (!setup.targets.some((target) => target.id === targetId)) {
    return setup;
  }
  const pending = (setup.pendingContexts ?? []).filter((id) => id !== contextId);
  return {
    ...setup,
    contextTargets: { ...setup.contextTargets, [contextId]: targetId },
    pendingContexts: [...pending, contextId],
  };
}

/**
 * Stops syncing `targetId`. Its contexts stay on this device rather than
 * quietly moving into another sync; with no syncs left everything starts over.
 */
export function removeSyncTarget(setup: SyncSetup, targetId: string, contexts: KlartContext[]): SyncSetup {
  const targets = setup.targets.filter((target) => target.id !== targetId);
  if (targets.length === 0) {
    return EMPTY_SYNC_SETUP;
  }
  const contextTargets = { ...setup.contextTargets };
  for (const context of contexts) {
    if (getContextTargetId(setup, context.id) === targetId) {
      contextTargets[context.id] = DEVICE_ONLY;
    }
  }
  for (const [id, assigned] of Object.entries(contextTargets)) {
    if (assigned === targetId) {
      delete contextTargets[id];
    }
  }
  return { ...setup, targets, contextTargets };
}

/** Makes `targetId` the primary. Contexts on the old primary stay there. */
export function makePrimarySyncTarget(setup: SyncSetup, targetId: string, contexts: KlartContext[]): SyncSetup {
  const target = setup.targets.find((candidate) => candidate.id === targetId);
  const primary = setup.targets[0];
  if (!target || !primary || primary.id === targetId) {
    return setup;
  }
  const contextTargets = { ...setup.contextTargets };
  for (const context of contexts) {
    if (!(context.id in contextTargets)) {
      contextTargets[context.id] = primary.id;
    }
  }
  return {
    ...setup,
    targets: [target, ...setup.targets.filter((candidate) => candidate.id !== targetId)],
    contextTargets,
  };
}

export interface SyncOverviewContext {
  id: string;
  name: string;
  color: ContextColor;
}

export interface SyncOverviewTarget {
  id: string;
  name: string;
  method: SyncMethod;
  isPrimary: boolean;
  status: SyncStatus;
  /** The contexts this sync holds. */
  contexts: SyncOverviewContext[];
  /** Something needs attention: an error, a missing folder, or a failed Git/GitHub sync. */
  hasProblem: boolean;
}

/** Every sync at a glance, for the sidebar card and settings. */
export interface SyncOverview {
  /** The worst state among the syncs; `local` when there are none. */
  state: SyncState;
  targets: SyncOverviewTarget[];
  /** Contexts kept on this device only (only when there are syncs). */
  localContexts: SyncOverviewContext[];
  /** When the least recently synced target last synced. */
  lastSyncedAt?: string;
  /** The first problem, prefixed by its sync's name when there are several. */
  error?: string;
  /** `outdated` only: the newest data version among the syncs this app is too old for, e.g. "0.8". */
  folderVersion?: string;
}

export const LOCAL_SYNC_OVERVIEW: SyncOverview = { state: "local", targets: [], localContexts: [] };

function toOverviewContext({ id, name, color }: KlartContext): SyncOverviewContext {
  return { id, name, color };
}

function hasProblem(status: SyncStatus): boolean {
  return status.state === "error" || status.state === "missing" || !!status.git?.error;
}

function newestFolderVersion(targets: SyncOverviewTarget[]): string | undefined {
  let newest: string | undefined;
  for (const { status } of targets) {
    if (status.folderVersion && (!newest || isNewerDataVersion(status.folderVersion, newest))) {
      newest = status.folderVersion;
    }
  }
  return newest;
}

export function buildSyncOverview(
  setup: SyncSetup,
  statuses: Record<string, SyncStatus>,
  contexts: KlartContext[]
): SyncOverview {
  if (setup.targets.length === 0) {
    return LOCAL_SYNC_OVERVIEW;
  }
  const targets = setup.targets.map((target, index): SyncOverviewTarget => {
    const method = methodOfConnection(target.connection);
    const status = statuses[target.id] ?? { state: "syncing", method };
    return {
      id: target.id,
      name: target.name,
      method,
      isPrimary: index === 0,
      status,
      contexts: contexts
        .filter((context) => getContextTargetId(setup, context.id) === target.id)
        .map(toOverviewContext),
      hasProblem: hasProblem(status),
    };
  });

  const states = targets.map((target) => target.status.state);
  const outdated = targets.filter((target) => target.status.state === "outdated");
  let state: SyncState = "synced";
  // Updating the app is the one fix, so it goes before any other problem.
  if (outdated.length > 0) {
    state = "outdated";
  } else if (targets.some((target) => target.hasProblem)) {
    state = "error";
  } else if (states.includes("needs-permission")) {
    state = "needs-permission";
  } else if (targets.some((target) => !target.status.lastSyncedAt)) {
    state = "syncing";
  }

  const troubled = targets.find((target) => target.hasProblem);
  const problem = troubled && (troubled.status.git?.error ?? troubled.status.error);
  const synced = targets.map((target) => target.status.lastSyncedAt).filter((value) => value !== undefined);

  return {
    state,
    targets,
    localContexts: contexts.filter((context) => getContextTargetId(setup, context.id) === null).map(toOverviewContext),
    lastSyncedAt: synced.length === targets.length ? synced.sort()[0] : undefined,
    error: troubled && problem && targets.length > 1 ? `${troubled.name}: ${problem}` : problem,
    folderVersion: newestFolderVersion(outdated),
  };
}
