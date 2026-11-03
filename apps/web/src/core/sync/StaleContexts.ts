import type { KlartContext } from "~/core/contexts/KlartContext";
import type { ShoppingList } from "~/core/shopping/ShoppingList";
import type { DayFile } from "~/core/tasks/Day";
import type { KlartData } from "~/core/tasks/KlartData";
import type { Task } from "~/core/tasks/Task";

/** Where dropped contexts are kept on this device, newest last, in case one was dropped by mistake. */
export const STALE_CONTEXTS_BACKUP_KEY = "klart-dropped-contexts";
const BACKUPS_KEPT = 10;

export interface DroppedContexts {
  droppedAt: string;
  contexts: KlartContext[];
  tasks: Task[];
  lists: ShoppingList[];
}

/** `data` without these contexts, their tasks, their shopping lists and those tasks' My Day items. */
export function withoutContexts(data: KlartData, contextIds: string[]): KlartData {
  const dropped = new Set(contextIds);
  const tasks: Record<string, Task> = {};
  for (const task of Object.values(data.tasks)) {
    if (!dropped.has(task.context)) {
      tasks[task.id] = task;
    }
  }
  const days: Record<string, DayFile> = {};
  for (const [date, day] of Object.entries(data.days)) {
    days[date] = { ...day, items: day.items.filter((item) => !data.tasks[item.taskId] || !!tasks[item.taskId]) };
  }
  const lists: Record<string, ShoppingList> = {};
  for (const list of Object.values(data.lists)) {
    if (list.context === null || !dropped.has(list.context)) {
      lists[list.id] = list;
    }
  }
  return { contexts: data.contexts.filter((context) => !dropped.has(context.id)), tasks, days, lists };
}

/** Keeps a copy of the contexts about to be dropped, with their tasks and lists, in this device's storage. */
export function backUpDroppedContexts(data: KlartData, contextIds: string[], droppedAt: string): void {
  const dropped = new Set(contextIds);
  const backup: DroppedContexts = {
    droppedAt,
    contexts: data.contexts.filter((context) => dropped.has(context.id)),
    tasks: Object.values(data.tasks).filter((task) => dropped.has(task.context)),
    lists: Object.values(data.lists).filter((list) => list.context !== null && dropped.has(list.context)),
  };
  try {
    const stored = JSON.parse(localStorage.getItem(STALE_CONTEXTS_BACKUP_KEY) ?? "[]") as DroppedContexts[];
    const backups = Array.isArray(stored) ? stored : [];
    localStorage.setItem(STALE_CONTEXTS_BACKUP_KEY, JSON.stringify([...backups, backup].slice(-BACKUPS_KEPT)));
  } catch {
    // Storage full or unavailable: dropping the stale copy matters more than keeping it.
  }
}
