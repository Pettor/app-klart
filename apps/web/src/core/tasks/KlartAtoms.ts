import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import type { KlartData } from "./KlartData";
import { createEmptyData, normalizeData } from "./KlartData";
import { toLocalDate } from "./LocalDate";
import { createSampleData, SAMPLE_DATA_ENABLED } from "./SampleData";
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
    if (stored === initialValue) {
      return stored;
    }
    // Dev builds: an empty list (tasks are never deleted) gets the sample data too, not just a fresh browser.
    return SAMPLE_DATA_ENABLED && Object.keys(stored.tasks ?? {}).length === 0
      ? createSampleData()
      : normalizeData(stored);
  },
  // Other tabs may still run an older version.
  subscribe: (key, callback, initialValue) =>
    jsonStorage.subscribe!(
      key,
      (value) => callback(value === initialValue ? value : normalizeData(value)),
      initialValue
    ),
};

/** Starts empty, or with sample data in dev builds until a task is stored. */
export const klartDataAtom = atomWithStorage<KlartData>(
  "klart-data",
  SAMPLE_DATA_ENABLED ? createSampleData() : createEmptyData(),
  klartDataStorage,
  { getOnInit: true }
);

/** The selected context id, or `"all"`. Remembered per device. */
export const currentContextAtom = atomWithStorage<ContextSelection>("klart-context", "all", undefined, {
  getOnInit: true,
});

/** Today's local date. Kept current by `useTodayTicker`. */
export const todayAtom = atom<string>(toLocalDate(new Date()));

export const smartViewAtom = atom<SmartView>("day");

export const tagFilterAtom = atom<string | null>(null);

export const searchQueryAtom = atom<string>("");

/** Bumped to ask the task search field to take focus (e.g. from the `/` shortcut). */
export const searchFocusRequestAtom = atom<number>(0);

export const showSuggestionsAtom = atomWithStorage<boolean>("klart-show-suggestions", true, undefined, {
  getOnInit: true,
});

/** Shows every task's tags under its title. Off, tags appear on hover or focus. Remembered per device. */
export const showTaskTagsAtom = atomWithStorage<boolean>("klart-show-task-tags", false, undefined, {
  getOnInit: true,
});

export const showAgentJsonAtom = atom<boolean>(false);
