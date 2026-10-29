import { DEMO_CONTEXTS } from "./KlartDemoData";
import type { SyncStatus } from "~/core/sync/SyncAtoms";
import type { StoredSyncConnection, SyncOverview, SyncSetup } from "~/core/sync/SyncTargets";
import { buildSyncOverview, DEVICE_ONLY } from "~/core/sync/SyncTargets";

function connectionFor(status: SyncStatus): StoredSyncConnection {
  switch (status.method) {
    case "github":
      return { kind: "github", owner: "you", repo: "klart-data", token: "" };
    case "git":
      return { kind: "desktop-git", path: status.location ?? "/Users/you/klart-data" };
    default:
      return { kind: "browser-folder" };
  }
}

/** One sync holding every demo context, in `status`; no sync at all when `status` is local. */
export function demoSyncOverview(status: SyncStatus): SyncOverview {
  const setup: SyncSetup =
    status.method === "local"
      ? { targets: [], contextTargets: {} }
      : {
          targets: [{ id: "main", name: status.folderName ?? "Klart", connection: connectionFor(status) }],
          contextTargets: {},
        };
  return buildSyncOverview(setup, { main: status }, DEMO_CONTEXTS);
}

export const DEMO_MULTI_SYNC_SETUP: SyncSetup = {
  targets: [
    {
      id: "personal",
      name: "Personal repo",
      connection: { kind: "github", owner: "you", repo: "klart-data", token: "" },
    },
    { id: "work", name: "Work OneDrive", connection: { kind: "browser-folder" } },
  ],
  contextTargets: { work: "work" },
};

const SYNCED_PERSONAL: SyncStatus = {
  state: "synced",
  method: "github",
  folderName: "you/klart-data",
  lastSyncedAt: "2026-10-21T09:59:00Z",
  git: { remoteUrl: "github.com/you/klart-data", branch: "main", lastSyncedAt: "2026-10-21T09:58:00Z" },
};

const SYNCED_WORK: SyncStatus = {
  state: "synced",
  method: "folder",
  folderName: "Klart",
  lastSyncedAt: "2026-10-21T09:57:00Z",
};

/** Personal and Football club in a GitHub repo, Work in a OneDrive folder; both up to date. */
export const DEMO_MULTI_SYNC_OVERVIEW = buildSyncOverview(
  DEMO_MULTI_SYNC_SETUP,
  { personal: SYNCED_PERSONAL, work: SYNCED_WORK },
  DEMO_CONTEXTS
);

/** As {@link DEMO_MULTI_SYNC_OVERVIEW}, but the work folder failed. */
export const DEMO_MULTI_SYNC_ERROR_OVERVIEW = buildSyncOverview(
  DEMO_MULTI_SYNC_SETUP,
  { personal: SYNCED_PERSONAL, work: { ...SYNCED_WORK, state: "error", error: "The folder was moved" } },
  DEMO_CONTEXTS
);

/** One sync, with Football club kept on this device. */
export const DEMO_PARTIAL_SYNC_OVERVIEW = buildSyncOverview(
  { targets: [DEMO_MULTI_SYNC_SETUP.targets[0]!], contextTargets: { club: DEVICE_ONLY } },
  { personal: SYNCED_PERSONAL },
  DEMO_CONTEXTS
);
