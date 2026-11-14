import { addDays, isLocalDate, weekdayOf } from "./LocalDate";
import { toTaskLink } from "./TaskLink";
import type { RepeatUnit, TaskRepeat } from "./TaskRepeat";
import { createRepeat, occurrenceOnOrAfter } from "./TaskRepeat";
import type { KlartContext } from "~/core/contexts/KlartContext";
import { ALL_CONTEXTS, findContextByTag, getDefaultContextId } from "~/core/contexts/KlartContext";

/**
 * Quick-add syntax, shared by the app, `inbox/*.txt` files and LLMS.txt:
 *
 * - `#tag` adds a tag. A tag naming a context (`#work`) also routes the task there.
 * - `@2026-07-08`, `@today`, `@tomorrow`, `@fri`, `@+3d` set the due date.
 * - `^09:00`, `^fri-09:00`, `^2026-11-02T09:00` set a reminder.
 * - `*daily`, `*weekly`, `*monthly`, `*yearly`, `*weekdays`, `*2w` (every 2 weeks), `*mon,thu` make it recurring.
 * - `!` marks the task important.
 * - `https://…` or `www.…` adds a link to the task's source (`www.` links get `https://`).
 * - Every other word is the title, in order.
 */
export interface ParsedQuickAdd {
  title: string;
  context: string;
  tags: string[];
  due: string | null;
  remindAt: string | null;
  important: boolean;
  links: string[];
  repeat: TaskRepeat | null;
  raw: string;
}

export interface QuickAddOptions {
  /** Today's local date, `YYYY-MM-DD`. */
  today: string;
  contexts: KlartContext[];
  /** The selected context, or `"all"`. */
  currentContext: string;
}

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

/** Resolves a date token (without `@`) to a local date, or `null` when it isn't one. */
export function parseDateToken(token: string, today: string): string | null {
  const value = token.toLowerCase();
  if (isLocalDate(value)) {
    return value;
  }
  if (value === "today" || value === "tod") {
    return today;
  }
  if (value === "tomorrow" || value === "tmr") {
    return addDays(today, 1);
  }
  const relative = value.match(/^\+(\d{1,3})d$/);
  if (relative) {
    return addDays(today, Number(relative[1]));
  }
  if (value.length >= 3) {
    const weekday = WEEKDAYS.findIndex((name) => name.startsWith(value));
    if (weekday >= 0) {
      const diff = (weekday - weekdayOf(today) + 7) % 7 || 7;
      return addDays(today, diff);
    }
  }
  return null;
}

const REPEAT_WORDS: Record<string, RepeatUnit> = {
  daily: "day",
  day: "day",
  weekly: "week",
  week: "week",
  monthly: "month",
  month: "month",
  yearly: "year",
  year: "year",
};

const REPEAT_UNITS: Record<string, RepeatUnit> = { d: "day", w: "week", m: "month", y: "year" };

function parseWeekday(value: string): number | null {
  if (value.length < 2) {
    return null;
  }
  const weekday = WEEKDAYS.findIndex((name) => name.startsWith(value));
  return weekday >= 0 ? weekday : null;
}

/**
 * Resolves a repeat token (without `*`), counted from the due date, or else from today. A rule on given weekdays
 * without a due date starts on the first of them.
 */
export function parseRepeatToken(token: string, due: string | null, today: string): TaskRepeat | null {
  const value = token.toLowerCase();
  const from = due ?? today;
  const word = REPEAT_WORDS[value];
  if (word) {
    return createRepeat(word, from);
  }
  const interval = value.match(/^(\d{1,3})([dwmy])$/);
  if (interval && Number(interval[1]) > 0) {
    return createRepeat(REPEAT_UNITS[interval[2]!]!, from, Number(interval[1]));
  }
  const weekdays = value === "weekdays" ? [1, 2, 3, 4, 5] : value.split(",").map(parseWeekday);
  if (weekdays.length === 0 || weekdays.some((day) => day === null)) {
    return null;
  }
  const repeat: TaskRepeat = { every: 1, unit: "week", weekdays: [...new Set(weekdays as number[])].sort(), from };
  return due ? repeat : { ...repeat, from: occurrenceOnOrAfter(repeat, today) };
}

/** Resolves a reminder token (without `^`). A bare time uses the due date, else today. */
export function parseRemindToken(token: string, due: string | null, today: string): string | null {
  const match = token.match(/^(?:(.+)[-T])?(\d{1,2}):(\d{2})$/i);
  if (!match) {
    return null;
  }
  const hours = Number(match[2]);
  const minutes = Number(match[3]);
  if (hours > 23 || minutes > 59) {
    return null;
  }
  const date = match[1] ? parseDateToken(match[1], today) : (due ?? today);
  if (!date) {
    return null;
  }
  return `${date}T${String(hours).padStart(2, "0")}:${match[3]}`;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function parseQuickAdd(text: string, { today, contexts, currentContext }: QuickAddOptions): ParsedQuickAdd {
  const tags: string[] = [];
  const words: string[] = [];
  const links: string[] = [];
  let due: string | null = null;
  let remindToken: string | null = null;
  let repeatToken: string | null = null;
  let important = false;

  for (const token of text.split(/\s+/)) {
    if (!token) {
      continue;
    }
    if (token.length > 1 && token.startsWith("#")) {
      const tag = token.slice(1).toLowerCase();
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
      continue;
    }
    if (token.length > 1 && token.startsWith("@")) {
      const date = parseDateToken(token.slice(1), today);
      if (date) {
        due = date;
        continue;
      }
    }
    // Checked here so a word like "*bold" keeps its place in the title.
    if (token.length > 1 && token.startsWith("*") && parseRepeatToken(token.slice(1), null, today)) {
      repeatToken = token.slice(1);
      continue;
    }
    if (token.length > 1 && token.startsWith("^")) {
      remindToken = token.slice(1);
      continue;
    }
    const link = toTaskLink(token);
    if (link) {
      if (!links.includes(link)) {
        links.push(link);
      }
      continue;
    }
    if (token === "!") {
      important = true;
      continue;
    }
    words.push(token);
  }

  const repeat = repeatToken ? parseRepeatToken(repeatToken, due, today) : null;
  // A recurring task is always due, on its first occurrence.
  due = repeat ? repeat.from : due;

  const remindAt = remindToken ? parseRemindToken(remindToken, due, today) : null;
  if (remindToken && !remindAt) {
    words.push(`^${remindToken}`);
  }

  const routed = tags.map((tag) => findContextByTag(contexts, tag)).find((context) => !!context);
  const fallback =
    currentContext !== ALL_CONTEXTS && contexts.some((context) => context.id === currentContext)
      ? currentContext
      : getDefaultContextId(contexts);

  return {
    title: capitalize(words.join(" ")),
    context: routed?.id ?? fallback,
    tags,
    due,
    remindAt,
    important,
    links,
    repeat,
    raw: text.trim(),
  };
}
