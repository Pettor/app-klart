import type { SuggestionReason } from "./Day";

/** Which suggestion groups My Day offers, set in Settings › Suggestions. Remembered per device. */
export interface SuggestionSettings {
  /** Groups switched off; their tasks can still land in a later group they match. */
  disabled: SuggestionReason[];
  /** How many days ahead counts as "coming up". */
  comingUpDays: number;
}

/** Choices for the "coming up" window: tomorrow only, three days, a week. */
export const COMING_UP_CHOICES = [1, 3, 7] as const;

export const DEFAULT_SUGGESTION_SETTINGS: SuggestionSettings = {
  disabled: [],
  comingUpDays: 3,
};
