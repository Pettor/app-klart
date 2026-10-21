import { describe, expect, it } from "vitest";
import type { ReleaseNote } from "./ReleaseNotes";
import { compareVersions, getUnseenReleaseNotes } from "./WhatsNew";

function note(version: string): ReleaseNote {
  return { version, highlights: [], fixes: [] };
}

const notes = [note("0.3.0"), note("0.2.0"), note("0.1.0")];

function versions(result: ReleaseNote[]): string[] {
  return result.map((item) => item.version);
}

describe("compareVersions", () => {
  it("compares numerically, not as text", () => {
    expect(compareVersions("0.10.0", "0.9.0")).toBe(1);
    expect(compareVersions("1.0.0", "1.0.0")).toBe(0);
    expect(compareVersions("1.2", "1.2.1")).toBe(-1);
  });

  it("ignores pre-release and build suffixes", () => {
    expect(compareVersions("0.2.0-build.42", "0.2.0")).toBe(0);
  });
});

describe("getUnseenReleaseNotes", () => {
  it("shows nothing on a fresh install", () => {
    const result = getUnseenReleaseNotes({
      notes,
      currentVersion: "0.3.0",
      lastSeenVersion: null,
      hasExistingData: false,
    });
    expect(result).toEqual([]);
  });

  it("shows the latest notes once to users from before What's new existed", () => {
    const result = getUnseenReleaseNotes({
      notes,
      currentVersion: "0.2.0",
      lastSeenVersion: null,
      hasExistingData: true,
    });
    expect(versions(result)).toEqual(["0.2.0"]);
  });

  it("shows every version since the last one seen, newest first", () => {
    const result = getUnseenReleaseNotes({
      notes,
      currentVersion: "0.3.0",
      lastSeenVersion: "0.1.0",
      hasExistingData: true,
    });
    expect(versions(result)).toEqual(["0.3.0", "0.2.0"]);
  });

  it("shows nothing when the version didn't change or went back", () => {
    expect(
      getUnseenReleaseNotes({ notes, currentVersion: "0.2.0", lastSeenVersion: "0.2.0", hasExistingData: true })
    ).toEqual([]);
    expect(
      getUnseenReleaseNotes({ notes, currentVersion: "0.1.0", lastSeenVersion: "0.3.0", hasExistingData: true })
    ).toEqual([]);
  });

  it("skips notes for versions that aren't released yet", () => {
    const result = getUnseenReleaseNotes({
      notes,
      currentVersion: "0.2.0",
      lastSeenVersion: "0.1.0",
      hasExistingData: true,
    });
    expect(versions(result)).toEqual(["0.2.0"]);
  });
});
