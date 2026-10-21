/**
 * Helpers for local calendar dates (`YYYY-MM-DD`) and local date-times
 * (`YYYY-MM-DDTHH:MM`). Klart stores due dates and reminders in the user's
 * own time zone, and timestamps (`createdAt`, `updatedAt`) in UTC.
 */

const LOCAL_DATE = /^\d{4}-\d{2}-\d{2}$/;
const LOCAL_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** True for a real calendar date; `2026-02-30` is rejected rather than rolled over. */
export function isLocalDate(value: string): boolean {
  return LOCAL_DATE.test(value) && toLocalDate(parseLocalDate(value)) === value;
}

export function isLocalDateTime(value: string): boolean {
  return LOCAL_DATE_TIME.test(value);
}

export function toLocalDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function toLocalDateTime(date: Date): string {
  return `${toLocalDate(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Parses `YYYY-MM-DD` as local noon, which is safe across DST changes. */
export function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year!, month! - 1, day!, 12, 0, 0, 0);
}

/** Parses `YYYY-MM-DDTHH:MM` as a local date-time. */
export function parseLocalDateTime(value: string): Date {
  const [datePart, timePart] = value.split("T");
  const [hours, minutes] = (timePart ?? "00:00").split(":").map(Number);
  const date = parseLocalDate(datePart!);
  date.setHours(hours!, minutes!, 0, 0);
  return date;
}

export function addDays(value: string, days: number): string {
  const date = parseLocalDate(value);
  date.setDate(date.getDate() + days);
  return toLocalDate(date);
}

/** 0 = Sunday … 6 = Saturday. */
export function weekdayOf(value: string): number {
  return parseLocalDate(value).getDay();
}

/** Current UTC timestamp without milliseconds, e.g. `2026-10-21T08:12:04Z`. */
export function toUtcTimestamp(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

/** Minutes since midnight for an `HH:MM` string. */
export function minutesOfDay(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}
