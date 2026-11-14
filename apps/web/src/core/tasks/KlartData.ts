import type { DayFile, DayItemSource, SuggestionReason } from "./Day";
import { createDay, dayHasTask } from "./Day";
import { addDays, daysBetween, parseLocalDate, toLocalDate, toUtcTimestamp } from "./LocalDate";
import type { ParsedQuickAdd } from "./QuickAdd";
import type { Task } from "./Task";
import { TASK_SCHEMA, TaskFileSchema } from "./Task";
import { createDerivedTaskId, createTaskId } from "./TaskId";
import type { TaskRepeat } from "./TaskRepeat";
import { nextOccurrence } from "./TaskRepeat";
import type { KlartContext } from "~/core/contexts/KlartContext";
import { DEFAULT_CONTEXTS, getDefaultContextId } from "~/core/contexts/KlartContext";
import type { ShoppingList } from "~/core/shopping/ShoppingList";
import { ShoppingListFileSchema } from "~/core/shopping/ShoppingList";

/** Everything Klart knows. Mirrors the data folder one to one. */
export interface KlartData {
  contexts: KlartContext[];
  tasks: Record<string, Task>;
  days: Record<string, DayFile>;
  /** Shopping lists by id. */
  lists: Record<string, ShoppingList>;
}

export type TaskPatch = Partial<
  Pick<Task, "title" | "context" | "tags" | "due" | "remindAt" | "important" | "notes" | "links">
> & {
  /** `null` stops the task repeating. */
  repeat?: TaskRepeat | null;
};

export function createEmptyData(): KlartData {
  return { contexts: DEFAULT_CONTEXTS, tasks: {}, days: {}, lists: {} };
}

/**
 * Fills in fields added since the data was stored (e.g. `links`) and drops tasks that can't be read,
 * the same way task files from the data folder are parsed.
 */
export function normalizeData(data: KlartData): KlartData {
  const tasks: Record<string, Task> = {};
  for (const [id, stored] of Object.entries(data.tasks ?? {})) {
    const parsed = TaskFileSchema.safeParse(stored);
    if (parsed.success) {
      tasks[id] = parsed.data as Task;
    }
  }
  const lists: Record<string, ShoppingList> = {};
  for (const [id, stored] of Object.entries(data.lists ?? {})) {
    const parsed = ShoppingListFileSchema.safeParse(stored);
    if (parsed.success) {
      lists[id] = parsed.data as ShoppingList;
    }
  }
  return {
    contexts: data.contexts ?? DEFAULT_CONTEXTS,
    tasks,
    days: data.days ?? {},
    lists,
  };
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
    links: parsed.links,
    createdAt: timestamp,
    updatedAt: timestamp,
    completedAt: null,
    raw: parsed.raw,
    ...(parsed.repeat ? { repeat: parsed.repeat } : {}),
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
  return changeTask(data, id, now, (task) => {
    const { repeat, ...rest } = patch;
    if (repeat === null) {
      return { ...rest, repeat: undefined };
    }
    if (repeat) {
      return { ...rest, repeat };
    }
    // Moving a recurring task's due date moves its schedule with it.
    if (task.repeat && patch.due && patch.due !== task.due) {
      return { ...rest, repeat: { ...task.repeat, from: patch.due } };
    }
    return rest;
  });
}

/**
 * The task that follows a completed recurring one: a copy due on the schedule's next date, with its reminder
 * moved along. Its id is derived from the completed task and the new date, so devices agree on it.
 */
export function createNextOccurrence(task: Task, now: Date): Task | null {
  if (!task.repeat) {
    return null;
  }
  const completedOn = task.completedAt ? toLocalDate(new Date(task.completedAt)) : toLocalDate(now);
  const due = nextOccurrence(task.repeat, task.due ?? task.repeat.from, completedOn);
  let remindAt: string | null = null;
  if (task.remindAt) {
    const offset = task.due ? daysBetween(task.due, task.remindAt.slice(0, 10)) : 0;
    remindAt = `${addDays(due, offset)}T${task.remindAt.slice(11, 16)}`;
  }
  const timestamp = toUtcTimestamp(now);
  return {
    schema: TASK_SCHEMA,
    id: createDerivedTaskId(`${task.id}:${due}`, parseLocalDate(due).getTime()),
    title: task.title,
    context: task.context,
    tags: task.tags,
    due,
    remindAt,
    important: task.important,
    status: "open",
    notes: task.notes,
    links: task.links,
    createdAt: timestamp,
    updatedAt: timestamp,
    completedAt: null,
    raw: task.raw,
    repeat: task.repeat,
  };
}

/** Creates the next occurrence of a completed recurring task, or reopens it when a completion was undone. */
function spawnNextOccurrence(data: KlartData, task: Task, now: Date): KlartData {
  const next = createNextOccurrence(task, now);
  if (!next) {
    return data;
  }
  const existing = data.tasks[next.id];
  let result = data;
  if (!existing) {
    result = upsertTask(result, next);
  } else if (existing.status === "archived") {
    result = upsertTask(result, { ...existing, status: "open", updatedAt: toUtcTimestamp(now) });
  }
  return upsertTask(result, { ...task, nextId: next.id, updatedAt: toUtcTimestamp(now) });
}

export function setTaskDone(data: KlartData, id: string, done: boolean, now: Date): KlartData {
  const before = data.tasks[id];
  const result = changeTask(data, id, now, () => ({
    status: done ? "done" : "open",
    completedAt: done ? toUtcTimestamp(now) : null,
  }));
  const task = result.tasks[id];
  if (!before || !task?.repeat) {
    return result;
  }
  if (done && before.status !== "done") {
    return spawnNextOccurrence(result, task, now);
  }
  if (!done && before.status === "done" && task.nextId) {
    // Undoing a completion takes back the occurrence it created, unless someone already worked on it.
    const next = result.tasks[task.nextId];
    let undone = upsertTask(result, { ...task, nextId: undefined });
    if (next && next.status === "open" && next.updatedAt === next.createdAt) {
      undone = upsertTask(undone, { ...next, status: "archived", updatedAt: toUtcTimestamp(now) });
    }
    return undone;
  }
  return result;
}

/**
 * Creates the next occurrence of recurring tasks completed outside the app (by an agent, or by hand in the data
 * folder), which have no `nextId` yet. Run after a sync pull.
 */
export function reconcileRecurringTasks(data: KlartData, now: Date): KlartData {
  let result = data;
  for (const task of Object.values(data.tasks)) {
    if (task.repeat && task.status === "done" && !task.nextId) {
      result = spawnNextOccurrence(result, task, now);
    }
  }
  return result;
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

/**
 * Moves a My Day item to just before or after another one. Lets a filtered list (one context, a tag)
 * reorder its visible tasks without knowing where the hidden ones sit.
 */
export function moveDayItemNextTo(
  data: KlartData,
  date: string,
  taskId: string,
  targetId: string,
  position: "before" | "after"
): KlartData {
  const day = data.days[date];
  if (!day || taskId === targetId || !dayHasTask(day, taskId)) {
    return data;
  }
  const rest = day.items.filter((item) => item.taskId !== taskId);
  const targetIndex = rest.findIndex((item) => item.taskId === targetId);
  if (targetIndex < 0) {
    return data;
  }
  return moveDayItem(data, date, taskId, position === "before" ? targetIndex : targetIndex + 1);
}

/**
 * What a device shows when it hides some contexts: those contexts, their tasks, My Day items and
 * shopping lists left out. Hiding every context hides none. Read-only; mutations work on the full data.
 */
export function withoutHiddenContexts(data: KlartData, hiddenIds: string[]): KlartData {
  const hidden = new Set(hiddenIds);
  const contexts = data.contexts.filter((context) => !hidden.has(context.id));
  if (contexts.length === data.contexts.length || contexts.length === 0) {
    return data;
  }
  const tasks: Record<string, Task> = {};
  for (const task of Object.values(data.tasks)) {
    if (!hidden.has(task.context)) {
      tasks[task.id] = task;
    }
  }
  const days: Record<string, DayFile> = {};
  for (const day of Object.values(data.days)) {
    days[day.date] = { ...day, items: day.items.filter((item) => !data.tasks[item.taskId] || !!tasks[item.taskId]) };
  }
  const lists: Record<string, ShoppingList> = {};
  for (const list of Object.values(data.lists)) {
    // Pinned, since a list without a context belongs to the first one, which may be hidden.
    const context = list.context ?? getDefaultContextId(data.contexts);
    if (!hidden.has(context)) {
      lists[list.id] = { ...list, context };
    }
  }
  return { contexts, tasks, days, lists };
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

/**
 * Removes a context and moves its tasks and shopping lists to the first remaining one.
 * The last context can't be removed.
 */
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
  // Lists without a context belong to the first one, so they move too when it's removed.
  const isFirst = getDefaultContextId(data.contexts) === id;
  for (const list of Object.values(data.lists)) {
    if (list.context === id || (list.context === null && isFirst)) {
      const moved = { ...list, context: target, updatedAt: toUtcTimestamp(now) };
      next = { ...next, lists: { ...next.lists, [list.id]: moved } };
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
