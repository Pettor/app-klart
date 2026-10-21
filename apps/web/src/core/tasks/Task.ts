import { z } from "zod";
import { toTaskLinks } from "./TaskLink";

export const TASK_SCHEMA = "klart.task/v1";

export type TaskStatus = "open" | "done" | "archived";

/** One task, stored as `tasks/<context>/<id>.json` in the data folder. */
export interface Task {
  schema: typeof TASK_SCHEMA;
  id: string;
  title: string;
  context: string;
  /** Lowercase, without `#`. Includes the context's routing tag when it was typed. */
  tags: string[];
  /** Local date `YYYY-MM-DD`. */
  due: string | null;
  /** Local date-time `YYYY-MM-DDTHH:MM`. */
  remindAt: string | null;
  important: boolean;
  status: TaskStatus;
  notes: string;
  /** Optional `http(s)://` links to the task's source, e.g. a PR, an email or a document. */
  links: string[];
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  /** The quick-add line the task was created from. */
  raw: string;
}

const nullableString = z.string().nullable().catch(null);

/**
 * Lenient schema for task files written by people, scripts or agents.
 * Missing optional fields fall back to sensible defaults.
 */
export const TaskFileSchema = z.object({
  schema: z.literal(TASK_SCHEMA).catch(TASK_SCHEMA),
  id: z.string().min(1),
  title: z.string(),
  context: z.string().min(1),
  tags: z.array(z.string()).catch([]),
  due: nullableString,
  remindAt: nullableString,
  important: z.boolean().catch(false),
  status: z.enum(["open", "done", "archived"]).catch("open"),
  notes: z.string().catch(""),
  links: z.array(z.string()).transform(toTaskLinks).catch([]),
  createdAt: z.string(),
  updatedAt: z.string(),
  completedAt: nullableString,
  raw: z.string().catch(""),
});

/** What an agent may drop into `inbox/` as JSON. Only `title` is required. */
export const InboxTaskSchema = z.object({
  title: z.string().min(1),
  context: z.string().optional(),
  tags: z.array(z.string()).optional(),
  due: z.string().nullable().optional(),
  remindAt: z.string().nullable().optional(),
  important: z.boolean().optional(),
  notes: z.string().optional(),
  links: z.array(z.string()).optional(),
});

export type InboxTask = z.infer<typeof InboxTaskSchema>;

export function isOpen(task: Task): boolean {
  return task.status === "open";
}

/** Orders tasks by due date (no date last), then newest first. */
export function compareByDue(a: Task, b: Task): number {
  if (a.due !== b.due) {
    if (!a.due) {
      return 1;
    }
    if (!b.due) {
      return -1;
    }
    return a.due < b.due ? -1 : 1;
  }
  return b.createdAt.localeCompare(a.createdAt);
}
