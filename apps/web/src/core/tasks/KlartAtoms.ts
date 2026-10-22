import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import type { DisplayOptions } from "./DisplayOptions";
import { MINIMAL_DISPLAY_OPTIONS } from "./DisplayOptions";
import type { KlartData } from "./KlartData";
import { createEmptyData, normalizeData } from "./KlartData";
import { toLocalDate } from "./LocalDate";
import { createSampleData, SAMPLE_DATA_ENABLED } from "./SampleData";
import type { SuggestionSettings } from "./SuggestionSettings";
import { DEFAULT_SUGGESTION_SETTINGS } from "./SuggestionSettings";
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

const CONTEXT_KEY = "klart-context";
const START_CONTEXT_KEY = "klart-start-context";

/** The context Klart opens in: `"last"` (the last used), `"all"` or a context id. Set in Settings › General. */
export type StartContext = "last" | ContextSelection;

export const startContextAtom = atomWithStorage<StartContext>(START_CONTEXT_KEY, "last", undefined, {
  getOnInit: true,
});

/** Applies the start context once per app load, before `currentContextAtom` reads the stored selection. */
function applyStartContext(): void {
  try {
    const start = JSON.parse(localStorage.getItem(START_CONTEXT_KEY) ?? '"last"') as StartContext;
    if (start !== "last") {
      localStorage.setItem(CONTEXT_KEY, JSON.stringify(start));
    }
  } catch {
    // Unreadable or blocked storage: open in the last used context.
  }
}
applyStartContext();

/** The selected context id, or `"all"`. Remembered per device. */
export const currentContextAtom = atomWithStorage<ContextSelection>(CONTEXT_KEY, "all", undefined, {
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

const storedDisplayOptionsAtom = atomWithStorage<Partial<DisplayOptions>>(
  "klart-display-options",
  MINIMAL_DISPLAY_OPTIONS,
  undefined,
  { getOnInit: true }
);

/** What My Day shows besides titles. Remembered per device; options added later start at their default. */
export const displayOptionsAtom = atom(
  (get): DisplayOptions => ({ ...MINIMAL_DISPLAY_OPTIONS, ...get(storedDisplayOptionsAtom) }),
  (_get, set, options: DisplayOptions) => set(storedDisplayOptionsAtom, options)
);

/** The desktop sidebar folded down to a rail of icons. Remembered per device. */
export const sidebarCollapsedAtom = atomWithStorage<boolean>("klart-sidebar-collapsed", false, undefined, {
  getOnInit: true,
});

/** Which suggestion groups My Day offers. Remembered per device. */
export const suggestionSettingsAtom = atomWithStorage<SuggestionSettings>(
  "klart-suggestion-settings",
  DEFAULT_SUGGESTION_SETTINGS,
  undefined,
  { getOnInit: true }
);
