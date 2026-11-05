import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { AutomationRequest, AutomationSettings } from "./Automations";
import { DEFAULT_AUTOMATION_SETTINGS } from "./Automations";

/**
 * Kept on this device only, never in the synced folder: a shared folder or repository must not be able to
 * plant shell commands that run on someone else's computer.
 */
export const automationSettingsAtom = atomWithStorage<AutomationSettings>(
  "klart-automations",
  DEFAULT_AUTOMATION_SETTINGS,
  undefined,
  { getOnInit: true }
);

/** Request files waiting for the primary sync's next push, which writes them to `requests/`. */
export const pendingRequestsAtom = atom<AutomationRequest[]>([]);

export const automationsRunningAtom = atom(false);
