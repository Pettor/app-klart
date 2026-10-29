import { isNewerDataVersion } from "./DataVersion";
import type { SyncScope } from "./FolderSync";
import type { GitHubConnection, SyncMethod, SyncState, SyncStatus } from "./SyncAtoms";
import type { ContextColor, KlartContext } from "~/core/contexts/KlartContext";

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

export function getSyncScope(setup: SyncSetup, targetId: string): SyncScope {
  return {
    ownsContext: (contextId) => getContextTargetId(setup, contextId) === targetId,
    isPrimary: setup.targets[0]?.id === targetId,
  };
}

/**
 * Contexts found in a sync's `klart.json` live in that sync, which is how a
 * device learns where every context lives. One kept on this device (e.g. after
 * its sync was removed) is picked up again; one that already lives in another
 * sync stays there.
 */
export function assignFoundContexts(setup: SyncSetup, targetId: string, contextIds: string[]): SyncSetup {
  const isPrimary = setup.targets[0]?.id === targetId;
  const found = contextIds.filter((id) => {
    const current = getContextTargetId(setup, id);
    if (current === targetId) {
      return false;
    }
    // Unassigned contexts (or ones assigned to a removed sync) fall back to the primary, so another sync can claim them.
    return current === null || (!isPrimary && setup.contextTargets[id] !== current);
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
  return { ...setup, contextTargets: { ...setup.contextTargets, [contextId]: targetId } };
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
  return { targets, contextTargets };
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
  return { targets: [target, ...setup.targets.filter((candidate) => candidate.id !== targetId)], contextTargets };
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
