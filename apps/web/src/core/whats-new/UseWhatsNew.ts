import { useCallback, useEffect, useMemo } from "react";
import { useAtom } from "jotai";
import type { ReleaseNote } from "./ReleaseNotes";
import { RELEASE_NOTES } from "./ReleaseNotes";
import { compareVersions, getNewerVersion, getUnseenReleaseNotes } from "./WhatsNew";
import { lastSeenVersionAtom, whatsNewRequestedAtom } from "./WhatsNewAtoms";

/** Read before anything writes, so a brand-new install isn't mistaken for an update. */
const hadDataAtStartup = ((): boolean => {
  try {
    return localStorage.getItem("klart-data") !== null;
  } catch {
    return false;
  }
})();

export interface WhatsNewState {
  isOpen: boolean;
  /** Newest first. */
  releases: ReleaseNote[];
  open: () => void;
  close: () => void;
}

/** Shows release notes once after the app version changes, and on request. */
export function useWhatsNew(): WhatsNewState {
  const currentVersion = import.meta.env.VITE_APP_VERSION;
  const [lastSeenVersion, setLastSeenVersion] = useAtom(lastSeenVersionAtom);
  const [isRequested, setRequested] = useAtom(whatsNewRequestedAtom);

  const unseen = useMemo(
    () =>
      getUnseenReleaseNotes({
        notes: RELEASE_NOTES,
        currentVersion,
        lastSeenVersion,
        hasExistingData: hadDataAtStartup,
      }),
    [currentVersion, lastSeenVersion]
  );

  // Nothing to announce (fresh install, or no notes for this version): remember the version quietly.
  // Only ever forward: an older build in another tab must not undo what a newer one marked as seen.
  useEffect(() => {
    if (unseen.length === 0 && getNewerVersion(currentVersion, lastSeenVersion) !== lastSeenVersion) {
      setLastSeenVersion(currentVersion);
    }
  }, [currentVersion, lastSeenVersion, setLastSeenVersion, unseen.length]);

  const releases = useMemo(
    () => (isRequested ? RELEASE_NOTES.filter((note) => compareVersions(note.version, currentVersion) <= 0) : unseen),
    [currentVersion, isRequested, unseen]
  );

  const open = useCallback(() => setRequested(true), [setRequested]);

  const close = useCallback(() => {
    setRequested(false);
    setLastSeenVersion((stored) => getNewerVersion(currentVersion, stored));
  }, [currentVersion, setLastSeenVersion, setRequested]);

  return { isOpen: releases.length > 0, releases, open, close };
}
