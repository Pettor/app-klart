import { addDays, isLocalDate, weekdayOf } from "./LocalDate";
import type { KlartContext } from "~/core/contexts/KlartContext";
import { ALL_CONTEXTS, findContextByTag, getDefaultContextId } from "~/core/contexts/KlartContext";

/**
 * Quick-add syntax, shared by the app, `inbox/*.txt` files and LLMS.txt:
 *
 * - `#tag` adds a tag. A tag naming a context (`#work`) also routes the task there.
 * - `@2026-07-08`, `@today`, `@tomorrow`, `@fri`, `@+3d` set the due date.
 * - `^09:00`, `^fri-09:00`, `^2026-11-02T09:00` set a reminder.
 * - `!` marks the task important.
 * - Every other word is the title, in order.
 */
export interface ParsedQuickAdd {
  title: string;
  context: string;
  tags: string[];
  due: string | null;
  remindAt: string | null;
  important: boolean;
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
  let due: string | null = null;
  let remindToken: string | null = null;
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
    if (token.length > 1 && token.startsWith("^")) {
      remindToken = token.slice(1);
      continue;
    }
    if (token === "!") {
      important = true;
      continue;
    }
    words.push(token);
  }

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
    raw: text.trim(),
  };
}
