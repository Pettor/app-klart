import { describe, expect, it } from "vitest";
import type { SyncStatus } from "./SyncAtoms";
import type { SyncSetup } from "./SyncTargets";
import {
  adoptLocalContexts,
  assignFoundContexts,
  buildSyncOverview,
  DEVICE_ONLY,
  findStaleContexts,
  getContextTargetId,
  getSyncScope,
  makePrimarySyncTarget,
  placeNewContext,
  removeSyncTarget,
  settlePendingContexts,
} from "./SyncTargets";
import type { KlartContext } from "~/core/contexts/KlartContext";
import type { Task } from "~/core/tasks/Task";

const CONTEXTS: KlartContext[] = [
  { id: "personal", name: "Personal", color: "blue", tag: "personal" },
  { id: "work", name: "Work", color: "orange", tag: "work" },
  { id: "club", name: "Club", color: "green", tag: "club" },
];

const SETUP: SyncSetup = {
  targets: [
    { id: "home", name: "Home repo", connection: { kind: "github", owner: "you", repo: "home", token: "t" } },
    { id: "office", name: "Work OneDrive", connection: { kind: "desktop-folder", path: "/OneDrive/Klart" } },
  ],
  contextTargets: { work: "office" },
};

const SYNCED: SyncStatus = { state: "synced", method: "github", lastSyncedAt: "2026-10-21T09:58:00Z" };

describe("SyncTargets", () => {
  it("sends contexts nobody assigned to the primary sync", () => {
    expect(getContextTargetId(SETUP, "personal")).toBe("home");
    expect(getContextTargetId(SETUP, "work")).toBe("office");
    expect(getContextTargetId({ ...SETUP, contextTargets: { work: DEVICE_ONLY } }, "work")).toBeNull();
    expect(getContextTargetId({ targets: [], contextTargets: {} }, "work")).toBeNull();
  });

  it("scopes each sync to the contexts its klart.json lists", () => {
    const listings = { home: ["personal", "club"], office: ["work"] };
    const office = getSyncScope(SETUP, "office", listings);
    expect(office.ownsContext("work")).toBe(true);
    expect(office.ownsContext("personal")).toBe(false);
    expect(office.isPrimary).toBe(false);
    expect(getSyncScope(SETUP, "home", listings).isPrimary).toBe(true);
  });

  it("keeps a context in the folder that lists it, even when this device's setup says otherwise", () => {
    // This device thinks "personal" lives in the office sync, but the home folder lists it.
    const stale = { ...SETUP, contextTargets: { personal: "office", work: "office" } };
    const listings = { home: ["personal"], office: ["work"] };
    expect(getSyncScope(stale, "home", listings).ownsContext("personal")).toBe(true);
    expect(getSyncScope(stale, "office", listings).ownsContext("personal")).toBe(false);
  });

  it("puts a context created here and listed in no folder in its assigned sync, once every sync has been read", () => {
    const created = { ...SETUP, pendingContexts: ["club"] };
    const listings = { home: ["personal"], office: ["work"] };
    expect(getSyncScope(created, "home", listings).ownsContext("club")).toBe(true);
    expect(getSyncScope(created, "office", listings).ownsContext("club")).toBe(false);
    // The office folder hasn't been read yet: it may hold "club", so nothing claims it.
    expect(getSyncScope(created, "home", { home: ["personal"] }).ownsContext("club")).toBe(false);
    // Before the first read a folder holds nothing, so a push can't empty it.
    expect(getSyncScope(SETUP, "home", {}).ownsContext("personal")).toBe(false);
  });

  it("never writes a context that no folder lists and wasn't created here back into a folder", () => {
    // A device that was closed while "club" was removed (or moved to a sync it doesn't have) still holds it.
    const listings = { home: ["personal"], office: ["work"] };
    expect(getSyncScope(SETUP, "home", listings).ownsContext("club")).toBe(false);
    expect(getSyncScope(SETUP, "office", listings).ownsContext("club")).toBe(false);
  });

  it("finds contexts no folder lists once every sync has been read, keeping new and device-only ones", () => {
    const listings = { home: ["personal"], office: [] };
    expect(findStaleContexts(SETUP, listings, CONTEXTS)).toEqual(["work", "club"]);
    expect(findStaleContexts({ ...SETUP, pendingContexts: ["club"] }, listings, CONTEXTS)).toEqual(["work"]);
    expect(findStaleContexts({ ...SETUP, contextTargets: { work: DEVICE_ONLY } }, listings, CONTEXTS)).toEqual([
      "club",
    ]);
    // Not before every sync has been read: the office folder may still list them.
    expect(findStaleContexts(SETUP, { home: ["personal"] }, CONTEXTS)).toEqual([]);
    // Never every context, and never without syncs.
    expect(findStaleContexts(SETUP, { home: [], office: [] }, CONTEXTS)).toEqual([]);
    expect(findStaleContexts({ targets: [], contextTargets: {} }, {}, CONTEXTS)).toEqual([]);
  });

  it("drops pending contexts once a folder lists them", () => {
    const created = { ...SETUP, pendingContexts: ["club", "garden"] };
    expect(settlePendingContexts(created, { home: ["personal", "club"] }).pendingContexts).toEqual(["garden"]);
    expect(settlePendingContexts(created, { home: ["personal"] })).toBe(created);
  });

  it("gives the first sync this device's contexts on its first read", () => {
    const first: SyncSetup = { targets: [{ ...SETUP.targets[0]!, adoptLocalData: true }], contextTargets: {} };
    const task = { context: "club" } as Task;
    const data = { contexts: CONTEXTS, tasks: { T1: task }, lists: {} };

    // An empty folder gets everything.
    const empty = adoptLocalContexts(first, "home", data, []);
    expect(empty.pendingContexts).toEqual(["personal", "work", "club"]);
    expect(empty.targets[0]?.adoptLocalData).toBeUndefined();
    // A folder in use only gets contexts with something in them.
    expect(adoptLocalContexts(first, "home", data, ["personal"]).pendingContexts).toEqual(["club"]);
    // Only once, and only for the sync that was just added.
    expect(adoptLocalContexts(empty, "home", data, [])).toBe(empty);
    expect(adoptLocalContexts(SETUP, "home", data, [])).toBe(SETUP);
  });

  it("assigns contexts found in a sync to it, unless the sync they live in lists them too", () => {
    const listings = { home: ["personal"], office: ["work", "club"] };
    const next = assignFoundContexts(SETUP, "office", ["work", "club"], listings);
    expect(next.contextTargets).toEqual({ work: "office", club: "office" });
    expect(assignFoundContexts(SETUP, "home", ["personal"], listings)).toBe(SETUP);
    const both = { home: ["club"], office: ["work", "club"] };
    expect(
      assignFoundContexts({ ...SETUP, contextTargets: { work: "office", club: "home" } }, "office", ["club"], both)
    ).toEqual({ ...SETUP, contextTargets: { work: "office", club: "home" } });
  });

  it("doesn't move a context while the sync it lives in hasn't been read", () => {
    expect(assignFoundContexts(SETUP, "office", ["personal"], { office: ["personal"] })).toBe(SETUP);
  });

  it("corrects an assignment its own folder doesn't back up", () => {
    // Another device put "personal" in the office folder; it's back in the home folder only.
    const stale = { ...SETUP, contextTargets: { personal: "office", work: "office" } };
    const listings = { home: ["personal"], office: ["work"] };
    expect(assignFoundContexts(stale, "home", ["personal"], listings).contextTargets).toEqual({
      personal: "home",
      work: "office",
    });
  });

  it("doesn't let a sync take contexts from the primary that the primary lists", () => {
    // The bug: "personal" only reached the primary by default, so any folder listing it claimed it.
    const listings = { home: ["personal"], office: ["work", "personal"] };
    expect(assignFoundContexts(SETUP, "office", ["work", "personal"], listings).contextTargets).toEqual({
      work: "office",
    });
  });

  it("picks up contexts kept on this device when a sync holds them", () => {
    const local = { ...SETUP, contextTargets: { work: DEVICE_ONLY, club: DEVICE_ONLY } };
    expect(assignFoundContexts(local, "office", ["work"], { office: ["work"] }).contextTargets).toEqual({
      work: "office",
      club: DEVICE_ONLY,
    });
    expect(assignFoundContexts(local, "home", ["club"], { home: ["club"] }).contextTargets).toEqual({
      work: DEVICE_ONLY,
      club: "home",
    });
  });

  it("claims contexts assigned to a sync that was removed", () => {
    const stale = { ...SETUP, contextTargets: { club: "gone" } };
    const listings = { home: [], office: ["club"] };
    expect(assignFoundContexts(stale, "office", ["club"], listings).contextTargets).toEqual({ club: "office" });
  });

  it("places a new context in the sync it was created in", () => {
    const placed = placeNewContext(SETUP, "club", "office");
    expect(placed.contextTargets).toEqual({ work: "office", club: "office" });
    expect(placed.pendingContexts).toEqual(["club"]);
    expect(placeNewContext(SETUP, "club", "gone")).toBe(SETUP);
  });

  it("keeps a removed sync's contexts on this device instead of moving them", () => {
    const next = removeSyncTarget(SETUP, "office", CONTEXTS);
    expect(next.targets.map((target) => target.id)).toEqual(["home"]);
    expect(getContextTargetId(next, "work")).toBeNull();
    expect(getContextTargetId(next, "personal")).toBe("home");
    expect(removeSyncTarget(next, "home", CONTEXTS)).toEqual({ targets: [], contextTargets: {} });
  });

  it("keeps the old primary's contexts in place when another sync becomes primary", () => {
    const next = makePrimarySyncTarget(SETUP, "office", CONTEXTS);
    expect(next.targets[0]?.id).toBe("office");
    expect(getContextTargetId(next, "personal")).toBe("home");
    expect(getContextTargetId(next, "work")).toBe("office");
  });

  it("reports every sync's contexts, and the worst state across them", () => {
    const ok = buildSyncOverview(SETUP, { home: SYNCED, office: { ...SYNCED, method: "folder" } }, CONTEXTS);
    expect(ok.state).toBe("synced");
    expect(ok.targets.map((target) => target.contexts.map((context) => context.id))).toEqual([
      ["personal", "club"],
      ["work"],
    ]);

    const failing = buildSyncOverview(
      SETUP,
      { home: SYNCED, office: { state: "synced", method: "folder", git: { error: "rejected" } } },
      CONTEXTS
    );
    expect(failing.state).toBe("error");
    expect(failing.error).toBe("Work OneDrive: rejected");
  });

  it("asks for an update before any other problem, naming the newest version needed", () => {
    const overview = buildSyncOverview(
      SETUP,
      {
        home: { state: "outdated", method: "github", folderVersion: "0.9" },
        office: { state: "error", method: "folder", error: "The folder was moved" },
      },
      CONTEXTS
    );
    expect(overview.state).toBe("outdated");
    expect(overview.folderVersion).toBe("0.9");
  });
});
