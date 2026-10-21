import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import type { KlartData } from "./KlartData";
import { createEmptyData, normalizeData } from "./KlartData";
import { toLocalDate } from "./LocalDate";
import type { ContextSelection } from "~/core/contexts/KlartContext";

/** Smart views in the sidebar. */
export type SmartView = "day" | "important" | "planned" | "tasks";

/** All tasks, days and contexts. Persisted in the browser; mirrored to the data folder when one is connected. */
const jsonStorage = createJSONStorage<KlartData>(() => localStorage);

/** Normalizes on read, so data stored by an older version gets fields added since. */
const klartDataStorage: typeof jsonStorage = {
  ...jsonStorage,
  getItem: (key, initialValue) => {
    const stored = jsonStorage.getItem(key, initialValue) as KlartData;
    return stored === initialValue ? stored : normalizeData(stored);
  },
  // Other tabs may still run an older version.
  subscribe: (key, callback, initialValue) =>
    jsonStorage.subscribe!(
      key,
      (value) => callback(value === initialValue ? value : normalizeData(value)),
      initialValue
    ),
};

export const klartDataAtom = atomWithStorage<KlartData>("klart-data", createEmptyData(), klartDataStorage, {
  getOnInit: true,
});

/** The selected context id, or `"all"`. Remembered per device. */
export const currentContextAtom = atomWithStorage<ContextSelection>("klart-context", "all", undefined, {
  getOnInit: true,
});

/** Today's local date. Kept current by `useTodayTicker`. */
export const todayAtom = atom<string>(toLocalDate(new Date()));

export const smartViewAtom = atom<SmartView>("day");

export const tagFilterAtom = atom<string | null>(null);

export const searchQueryAtom = atom<string>("");

export const showSuggestionsAtom = atomWithStorage<boolean>("klart-show-suggestions", true, undefined, {
  getOnInit: true,
});

export const showAgentJsonAtom = atom<boolean>(false);
