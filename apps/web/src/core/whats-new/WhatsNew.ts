import type { ReleaseNote } from "./ReleaseNotes";

/** Compares dotted versions numerically ("0.10.0" > "0.9.0"); a pre-release suffix is ignored. */
export function compareVersions(a: string, b: string): number {
  const partsA = a.split(/[-+]/)[0]!.split(".");
  const partsB = b.split(/[-+]/)[0]!.split(".");
  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const diff = (Number(partsA[i]) || 0) - (Number(partsB[i]) || 0);
    if (diff !== 0) {
      return Math.sign(diff);
    }
  }
  return 0;
}

/**
 * The version to remember as seen: never older than what's stored. A tab still running an older
 * build would otherwise lower it, and every newer tab would show its notes again.
 */
export function getNewerVersion(version: string, lastSeenVersion: string | null): string {
  return lastSeenVersion !== null && compareVersions(lastSeenVersion, version) > 0 ? lastSeenVersion : version;
}

export interface WhatsNewInput {
  notes: ReleaseNote[];
  currentVersion: string;
  /** Version whose notes were last shown (or skipped) on this device; null if never. */
  lastSeenVersion: string | null;
  /** Whether this device already had Klart data, i.e. it ran a version from before "What's new" existed. */
  hasExistingData: boolean;
}

/**
 * Release notes to show after an update, newest first. Empty on a fresh
 * install, when the version didn't change, after a downgrade, or when no
 * notes were written for the versions in between.
 */
export function getUnseenReleaseNotes({
  notes,
  currentVersion,
  lastSeenVersion,
  hasExistingData,
}: WhatsNewInput): ReleaseNote[] {
  const released = notes
    .filter((note) => compareVersions(note.version, currentVersion) <= 0)
    .sort((a, b) => compareVersions(b.version, a.version));

  if (lastSeenVersion === null) {
    // Existing users get the latest notes once; new users have nothing to catch up on.
    return hasExistingData ? released.slice(0, 1) : [];
  }
  return released.filter((note) => compareVersions(note.version, lastSeenVersion) > 0);
}
