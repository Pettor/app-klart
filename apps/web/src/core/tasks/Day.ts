import { z } from "zod";

export const DAY_SCHEMA = "klart.day/v1";

/** Why a task is suggested for My Day, in ranking order. */
export const SUGGESTION_REASONS = [
  "overdue",
  "due_today",
  "left_from_yesterday",
  "coming_up",
  "related_to_today",
  "recently_added",
] as const;

export type SuggestionReason = (typeof SUGGESTION_REASONS)[number];

export type DayItemSource = "user" | "quick_add" | "suggestion" | "agent";

export interface DayItem {
  taskId: string;
  addedAt: string;
  addedBy: DayItemSource;
  reason: SuggestionReason | null;
}

/** What's in My Day for one date, stored as `days/<date>.json`. Order is display order. */
export interface DayFile {
  schema: typeof DAY_SCHEMA;
  date: string;
  items: DayItem[];
}

export const DayFileSchema = z.object({
  schema: z.literal(DAY_SCHEMA).catch(DAY_SCHEMA),
  date: z.string(),
  items: z
    .array(
      z.object({
        taskId: z.string().min(1),
        addedAt: z.string().catch(""),
        addedBy: z.enum(["user", "quick_add", "suggestion", "agent"]).catch("agent"),
        reason: z.enum(SUGGESTION_REASONS).nullable().catch(null),
      })
    )
    .catch([]),
});

export function createDay(date: string): DayFile {
  return { schema: DAY_SCHEMA, date, items: [] };
}

export function dayHasTask(day: DayFile | undefined, taskId: string): boolean {
  return !!day?.items.some((item) => item.taskId === taskId);
}
