import { describe, expect, it } from "vitest";
import type { SyncStatus } from "./SyncAtoms";
import type { SyncSetup } from "./SyncTargets";
import {
  assignFoundContexts,
  buildSyncOverview,
  DEVICE_ONLY,
  getContextTargetId,
  getSyncScope,
  makePrimarySyncTarget,
  removeSyncTarget,
} from "./SyncTargets";
import type { KlartContext } from "~/core/contexts/KlartContext";

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

  it("scopes each sync to its contexts; only the primary holds shopping lists", () => {
    const office = getSyncScope(SETUP, "office");
    expect(office.ownsContext("work")).toBe(true);
    expect(office.ownsContext("personal")).toBe(false);
    expect(office.isPrimary).toBe(false);
    expect(getSyncScope(SETUP, "home").isPrimary).toBe(true);
  });

  it("assigns contexts found in a secondary sync to it, but never overrides a choice", () => {
    const next = assignFoundContexts({ ...SETUP, contextTargets: { work: DEVICE_ONLY } }, "office", ["work", "club"]);
    expect(next.contextTargets).toEqual({ work: DEVICE_ONLY, club: "office" });
    expect(assignFoundContexts(SETUP, "home", ["club"])).toBe(SETUP);
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
});
