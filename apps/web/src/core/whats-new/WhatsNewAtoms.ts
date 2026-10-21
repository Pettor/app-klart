import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

/** Version whose "What's new" was last shown on this device. */
export const lastSeenVersionAtom = atomWithStorage<string | null>("klart-last-seen-version", null, undefined, {
  getOnInit: true,
});

/** Set when the user reopens "What's new" from Settings, so it shows even without unseen notes. */
export const whatsNewRequestedAtom = atom<boolean>(false);
