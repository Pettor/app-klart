import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { KlartData } from "./KlartData";
import { createEmptyData } from "./KlartData";
import { toLocalDate } from "./LocalDate";
import type { ContextSelection } from "~/core/contexts/KlartContext";

/** Smart views in the sidebar. */
export type SmartView = "day" | "important" | "planned" | "tasks";

/** All tasks, days and contexts. Persisted in the browser; mirrored to the data folder when one is connected. */
export const klartDataAtom = atomWithStorage<KlartData>("klart-data", createEmptyData(), undefined, {
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
