import type { DayFile, DayItemSource, SuggestionReason } from "./Day";
import { createDay, dayHasTask } from "./Day";
import { toUtcTimestamp } from "./LocalDate";
import type { ParsedQuickAdd } from "./QuickAdd";
import type { Task } from "./Task";
import { TASK_SCHEMA } from "./Task";
import { createTaskId } from "./TaskId";
import type { KlartContext } from "~/core/contexts/KlartContext";
import { DEFAULT_CONTEXTS, getDefaultContextId } from "~/core/contexts/KlartContext";

/** Everything Klart knows. Mirrors the data folder one to one. */
export interface KlartData {
  contexts: KlartContext[];
  tasks: Record<string, Task>;
  days: Record<string, DayFile>;
}

export type TaskPatch = Partial<Pick<Task, "title" | "context" | "tags" | "due" | "remindAt" | "important" | "notes">>;

export function createEmptyData(): KlartData {
  return { contexts: DEFAULT_CONTEXTS, tasks: {}, days: {} };
}

export function createTask(parsed: ParsedQuickAdd, now: Date, id: string = createTaskId(now.getTime())): Task {
  const timestamp = toUtcTimestamp(now);
  return {
    schema: TASK_SCHEMA,
    id,
    title: parsed.title,
    context: parsed.context,
    tags: parsed.tags,
    due: parsed.due,
    remindAt: parsed.remindAt,
    important: parsed.important,
    status: "open",
    notes: "",
    createdAt: timestamp,
    updatedAt: timestamp,
    completedAt: null,
    raw: parsed.raw,
  };
}

export function upsertTask(data: KlartData, task: Task): KlartData {
  return { ...data, tasks: { ...data.tasks, [task.id]: task } };
}

function changeTask(data: KlartData, id: string, now: Date, change: (task: Task) => Partial<Task>): KlartData {
  const task = data.tasks[id];
  if (!task) {
    return data;
  }
  return upsertTask(data, { ...task, ...change(task), updatedAt: toUtcTimestamp(now) });
}

export function updateTask(data: KlartData, id: string, patch: TaskPatch, now: Date): KlartData {
  return changeTask(data, id, now, () => patch);
}

export function setTaskDone(data: KlartData, id: string, done: boolean, now: Date): KlartData {
  return changeTask(data, id, now, () => ({
    status: done ? "done" : "open",
    completedAt: done ? toUtcTimestamp(now) : null,
  }));
}

/** Tasks are never deleted, only archived, so other devices and agents see the change. */
export function archiveTask(data: KlartData, id: string, now: Date): KlartData {
  return changeTask(data, id, now, () => ({ status: "archived" }));
}

export function addToDay(
  data: KlartData,
  date: string,
  items: { taskId: string; addedBy: DayItemSource; reason: SuggestionReason | null }[],
  now: Date
): KlartData {
  const day = data.days[date] ?? createDay(date);
  const additions = items
    .filter(
      (item, index) =>
        !dayHasTask(day, item.taskId) && items.findIndex((other) => other.taskId === item.taskId) === index
    )
    .map((item) => ({ ...item, addedAt: toUtcTimestamp(now) }));
  if (additions.length === 0) {
    return data;
  }
  return { ...data, days: { ...data.days, [date]: { ...day, items: [...day.items, ...additions] } } };
}

export function removeFromDay(data: KlartData, date: string, taskId: string): KlartData {
  const day = data.days[date];
  if (!dayHasTask(day, taskId)) {
    return data;
  }
  return {
    ...data,
    days: { ...data.days, [date]: { ...day!, items: day!.items.filter((item) => item.taskId !== taskId) } },
  };
}

export function moveDayItem(data: KlartData, date: string, taskId: string, toIndex: number): KlartData {
  const day = data.days[date];
  const fromIndex = day?.items.findIndex((item) => item.taskId === taskId) ?? -1;
  if (!day || fromIndex < 0) {
    return data;
  }
  const items = [...day.items];
  const [item] = items.splice(fromIndex, 1);
  items.splice(Math.max(0, Math.min(toIndex, items.length)), 0, item!);
  return { ...data, days: { ...data.days, [date]: { ...day, items } } };
}

export function addContext(data: KlartData, context: KlartContext): KlartData {
  return { ...data, contexts: [...data.contexts, context] };
}

export function updateContext(data: KlartData, id: string, patch: Partial<Omit<KlartContext, "id">>): KlartData {
  return {
    ...data,
    contexts: data.contexts.map((context) => (context.id === id ? { ...context, ...patch } : context)),
  };
}

/** Removes a context and moves its tasks to the first remaining one. The last context can't be removed. */
export function removeContext(data: KlartData, id: string, now: Date): KlartData {
  const contexts = data.contexts.filter((context) => context.id !== id);
  if (contexts.length === 0 || contexts.length === data.contexts.length) {
    return data;
  }
  const target = getDefaultContextId(contexts);
  let next: KlartData = { ...data, contexts };
  for (const task of Object.values(data.tasks)) {
    if (task.context === id) {
      next = updateTask(next, task.id, { context: target }, now);
    }
  }
  return next;
}

export function moveContext(data: KlartData, id: string, direction: -1 | 1): KlartData {
  const index = data.contexts.findIndex((context) => context.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= data.contexts.length) {
    return data;
  }
  const contexts = [...data.contexts];
  [contexts[index], contexts[target]] = [contexts[target]!, contexts[index]!];
  return { ...data, contexts };
}
