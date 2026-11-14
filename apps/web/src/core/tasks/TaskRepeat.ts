import { z } from "zod";
import { addDays, daysBetween, isLocalDate, parseLocalDate, toLocalDate, weekdayOf } from "./LocalDate";

export type RepeatUnit = "day" | "week" | "month" | "year";

/**
 * How often a task comes back. Occurrences are counted from `from`, so a monthly task on the 31st stays on the
 * last day of shorter months instead of drifting to the 28th.
 */
export interface TaskRepeat {
  /** Every `every` units, at least 1. */
  every: number;
  unit: RepeatUnit;
  /** Weekly only: the weekdays it falls on, 0 = Sunday … 6 = Saturday. Empty means `from`'s weekday. */
  weekdays: number[];
  /** Local date `YYYY-MM-DD` of the first occurrence. */
  from: string;
}

export const TaskRepeatSchema = z.object({
  every: z.number().int().min(1).max(999).catch(1),
  unit: z.enum(["day", "week", "month", "year"]),
  weekdays: z
    .array(z.number().int().min(0).max(6))
    .transform((days) => [...new Set(days)].sort())
    .catch([]),
  from: z.string().refine(isLocalDate),
});

/** Monday-first, the order the editor shows weekdays in. */
export const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

/** The weekdays a weekly rule falls on; `from`'s weekday when none are set. */
export function weekdaysOf(repeat: TaskRepeat): number[] {
  return repeat.weekdays.length > 0 ? repeat.weekdays : [weekdayOf(repeat.from)];
}

/** The date `months` months after `from`, on `from`'s day or the month's last day when it has fewer. */
function addMonthsClamped(from: string, months: number): string {
  const start = parseLocalDate(from);
  const target = new Date(start.getFullYear(), start.getMonth() + months, 1, 12);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0, 12).getDate();
  target.setDate(Math.min(start.getDate(), lastDay));
  return toLocalDate(target);
}

function monthsBetween(from: string, to: string): number {
  const a = parseLocalDate(from);
  const b = parseLocalDate(to);
  return (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth();
}

/** The first occurrence on or after `date`. */
export function occurrenceOnOrAfter(repeat: TaskRepeat, date: string): string {
  const start = date > repeat.from ? date : repeat.from;
  const every = Math.max(1, repeat.every);

  switch (repeat.unit) {
    case "day": {
      const steps = Math.ceil(daysBetween(repeat.from, start) / every);
      return addDays(repeat.from, steps * every);
    }
    case "week": {
      const weekdays = weekdaysOf(repeat);
      // Weeks start on Monday, counted from the week `from` falls in.
      const weekStart = addDays(repeat.from, -((weekdayOf(repeat.from) + 6) % 7));
      for (let offset = 0; offset < every * 7 + 7; offset += 1) {
        const day = addDays(start, offset);
        const week = Math.floor(daysBetween(weekStart, day) / 7);
        if (week % every === 0 && weekdays.includes(weekdayOf(day))) {
          return day;
        }
      }
      return start;
    }
    case "month":
    case "year": {
      const months = repeat.unit === "year" ? every * 12 : every;
      let steps = Math.max(0, Math.floor(monthsBetween(repeat.from, start) / months));
      let candidate = addMonthsClamped(repeat.from, steps * months);
      while (candidate < start) {
        steps += 1;
        candidate = addMonthsClamped(repeat.from, steps * months);
      }
      return candidate;
    }
  }
}

/**
 * The due date of the occurrence after one due on `due` and completed on `completedOn`: the first one after
 * `due`, and never before the day it was completed, so a task finished late doesn't come back already overdue.
 */
export function nextOccurrence(repeat: TaskRepeat, due: string, completedOn: string): string {
  const after = addDays(due, 1);
  return occurrenceOnOrAfter(repeat, after > completedOn ? after : completedOn);
}

/** A rule starting on `from`, e.g. for the editor's presets. Weekly rules start on `from`'s weekday. */
export function createRepeat(unit: RepeatUnit, from: string, every = 1): TaskRepeat {
  return { every, unit, weekdays: unit === "week" ? [weekdayOf(from)] : [], from };
}

export function isSameRepeat(a: TaskRepeat | undefined, b: TaskRepeat | undefined): boolean {
  if (!a || !b) {
    return a === b;
  }
  return a.every === b.every && a.unit === b.unit && a.from === b.from && a.weekdays.join(",") === b.weekdays.join(",");
}
