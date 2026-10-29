import type { ParsedShoppingItem } from "./ShoppingItemParse";
import type { ShoppingItem, ShoppingList, ShoppingListKind } from "./ShoppingList";
import { isListOpen, SHOPPING_LIST_SCHEMA } from "./ShoppingList";
import type { KlartData } from "~/core/tasks/KlartData";
import { addToDay, archiveTask, removeFromDay, setTaskDone, updateTask, upsertTask } from "~/core/tasks/KlartData";
import { toUtcTimestamp } from "~/core/tasks/LocalDate";
import type { Task } from "~/core/tasks/Task";
import { TASK_SCHEMA } from "~/core/tasks/Task";

export type ShoppingItemPatch = Partial<Pick<ShoppingItem, "name" | "qty" | "price" | "link" | "note" | "category">>;

/** What the caller decides about a task made from a list or item: its id, title and context. */
export interface ShoppingTaskSeed {
  id: string;
  title: string;
  context: string;
}

export function createShoppingList(
  id: string,
  name: string,
  kind: ShoppingListKind,
  context: string,
  date: string | null,
  now: Date
): ShoppingList {
  const timestamp = toUtcTimestamp(now);
  return {
    schema: SHOPPING_LIST_SCHEMA,
    id,
    name,
    kind,
    context,
    date,
    completedAt: null,
    deletedAt: null,
    taskId: null,
    items: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function createShoppingItem(id: string, parsed: ParsedShoppingItem, now: Date): ShoppingItem {
  const timestamp = toUtcTimestamp(now);
  return {
    id,
    name: parsed.name,
    qty: parsed.qty,
    price: parsed.price,
    link: parsed.link,
    note: "",
    category: parsed.category,
    bought: false,
    important: false,
    taskId: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function upsertList(data: KlartData, list: ShoppingList): KlartData {
  return { ...data, lists: { ...data.lists, [list.id]: list } };
}

function changeList(
  data: KlartData,
  listId: string,
  now: Date,
  change: (list: ShoppingList) => Partial<ShoppingList>
): KlartData {
  const list = data.lists[listId];
  if (!list) {
    return data;
  }
  return upsertList(data, { ...list, ...change(list), updatedAt: toUtcTimestamp(now) });
}

function changeItem(
  data: KlartData,
  listId: string,
  itemId: string,
  now: Date,
  change: (item: ShoppingItem) => Partial<ShoppingItem>
): KlartData {
  const timestamp = toUtcTimestamp(now);
  return changeList(data, listId, now, (list) => ({
    items: list.items.map((item) => (item.id === itemId ? { ...item, ...change(item), updatedAt: timestamp } : item)),
  }));
}

export function findItem(data: KlartData, listId: string, itemId: string): ShoppingItem | undefined {
  return data.lists[listId]?.items.find((item) => item.id === itemId);
}

/** The linked task, when it still exists and isn't archived. */
function linkedTask(data: KlartData, taskId: string | null): Task | undefined {
  const task = taskId ? data.tasks[taskId] : undefined;
  return task && task.status !== "archived" ? task : undefined;
}

/** Archives a linked task and takes it out of today's My Day. */
function unlinkTask(data: KlartData, taskId: string | null, today: string, now: Date): KlartData {
  return linkedTask(data, taskId) ? removeFromDay(archiveTask(data, taskId!, now), today, taskId!) : data;
}

export function addShoppingItem(data: KlartData, listId: string, item: ShoppingItem, now: Date): KlartData {
  return changeList(data, listId, now, (list) => ({ items: [...list.items, item] }));
}

export function updateShoppingItem(
  data: KlartData,
  listId: string,
  itemId: string,
  patch: ShoppingItemPatch,
  now: Date
): KlartData {
  return changeItem(data, listId, itemId, now, () => patch);
}

/** Marks an item bought or not, and completes or reopens its My Day task to match. */
export function setItemBought(data: KlartData, listId: string, itemId: string, bought: boolean, now: Date): KlartData {
  const item = findItem(data, listId, itemId);
  if (!item) {
    return data;
  }
  const next = changeItem(data, listId, itemId, now, () => ({ bought }));
  const task = linkedTask(next, item.taskId);
  return task && (task.status === "done") !== bought ? setTaskDone(next, task.id, bought, now) : next;
}

/** Stars or unstars an item, and its My Day task to match. */
export function toggleItemImportant(data: KlartData, listId: string, itemId: string, now: Date): KlartData {
  const item = findItem(data, listId, itemId);
  if (!item) {
    return data;
  }
  const next = changeItem(data, listId, itemId, now, () => ({ important: !item.important }));
  return linkedTask(next, item.taskId) ? updateTask(next, item.taskId!, { important: !item.important }, now) : next;
}

/** Removes an item from its list; its My Day task is archived. */
export function removeShoppingItem(
  data: KlartData,
  listId: string,
  itemId: string,
  today: string,
  now: Date
): KlartData {
  const item = findItem(data, listId, itemId);
  if (!item) {
    return data;
  }
  const next = changeList(data, listId, now, (list) => ({
    items: list.items.filter((other) => other.id !== itemId),
  }));
  return unlinkTask(next, item.taskId, today, now);
}

function createLinkedTask(seed: ShoppingTaskSeed, fields: Partial<Task>, now: Date): Task {
  const timestamp = toUtcTimestamp(now);
  return {
    schema: TASK_SCHEMA,
    id: seed.id,
    title: seed.title,
    context: seed.context,
    tags: [],
    due: null,
    remindAt: null,
    important: false,
    status: "open",
    notes: "",
    links: [],
    createdAt: timestamp,
    updatedAt: timestamp,
    completedAt: null,
    raw: "",
    ...fields,
  };
}

/** Makes the item a task in today's My Day. Completing that task marks the item bought, and back. */
export function addItemToDay(
  data: KlartData,
  listId: string,
  itemId: string,
  seed: ShoppingTaskSeed,
  today: string,
  now: Date
): KlartData {
  const list = data.lists[listId];
  const item = findItem(data, listId, itemId);
  if (!list || !item || item.bought) {
    return data;
  }
  const existing = linkedTask(data, item.taskId);
  if (existing) {
    // Already linked: just make sure it's in today's My Day.
    return addToDay(data, today, [{ taskId: existing.id, addedBy: "user", reason: null }], now);
  }
  const task = createLinkedTask(
    seed,
    {
      important: item.important,
      due: list.date,
      links: item.link ? [item.link] : [],
      notes: item.note,
      shopping: { listId, itemId },
    },
    now
  );
  const linked = changeItem(upsertTask(data, task), listId, itemId, now, () => ({ taskId: task.id }));
  return addToDay(linked, today, [{ taskId: task.id, addedBy: "user", reason: null }], now);
}

/** Takes the item's task out of My Day; the task is archived and the item stays on the list. */
export function removeItemFromDay(
  data: KlartData,
  listId: string,
  itemId: string,
  today: string,
  now: Date
): KlartData {
  const item = findItem(data, listId, itemId);
  if (!item?.taskId) {
    return data;
  }
  return changeItem(unlinkTask(data, item.taskId, today, now), listId, itemId, now, () => ({ taskId: null }));
}

/** Adds one task to My Day that opens the list. */
export function addListToDay(
  data: KlartData,
  listId: string,
  seed: ShoppingTaskSeed,
  today: string,
  now: Date
): KlartData {
  const list = data.lists[listId];
  if (!list || list.completedAt) {
    return data;
  }
  const existing = linkedTask(data, list.taskId);
  if (existing) {
    return addToDay(data, today, [{ taskId: existing.id, addedBy: "user", reason: null }], now);
  }
  const task = createLinkedTask(seed, { due: list.date, shopping: { listId, itemId: null } }, now);
  const linked = changeList(upsertTask(data, task), listId, now, () => ({ taskId: task.id }));
  return addToDay(linked, today, [{ taskId: task.id, addedBy: "user", reason: null }], now);
}

/**
 * Completes a list. Items not bought either move to another open list (keeping their My Day tasks), or stay on
 * the completed list and their tasks are archived. The list's own task is completed.
 */
export function completeShoppingList(
  data: KlartData,
  listId: string,
  moveTo: string | null,
  today: string,
  now: Date
): KlartData {
  const list = data.lists[listId];
  const target = moveTo && moveTo !== listId ? data.lists[moveTo] : undefined;
  if (!list || list.completedAt || list.deletedAt || (moveTo && (!target || !isListOpen(target)))) {
    return data;
  }
  const left = list.items.filter((item) => !item.bought);
  let next = data;

  if (target) {
    const timestamp = toUtcTimestamp(now);
    next = changeList(next, target.id, now, (current) => ({
      items: [...current.items, ...left.map((item) => ({ ...item, updatedAt: timestamp }))],
    }));
    for (const item of left) {
      const task = linkedTask(next, item.taskId);
      if (task) {
        next = upsertTask(next, { ...task, shopping: { listId: target.id, itemId: item.id }, updatedAt: timestamp });
      }
    }
  } else {
    for (const item of left) {
      next = unlinkTask(next, item.taskId, today, now);
    }
  }

  const listTask = linkedTask(next, list.taskId);
  if (listTask?.status === "open") {
    next = setTaskDone(next, listTask.id, true, now);
  }
  return changeList(next, listId, now, (current) => ({
    completedAt: toUtcTimestamp(now),
    items: target ? current.items.filter((item) => item.bought) : current.items,
  }));
}

/** Renames a list. A blank name keeps the old one. */
export function renameShoppingList(data: KlartData, listId: string, name: string, now: Date): KlartData {
  const trimmed = name.trim();
  const list = data.lists[listId];
  if (!list || !trimmed || trimmed === list.name) {
    return data;
  }
  return changeList(data, listId, now, () => ({ name: trimmed }));
}

/**
 * Deletes a list: it's marked deleted and hidden, and the My Day tasks made from it and its items are archived.
 * The list keeps its file (with `deletedAt`) so other devices delete it too.
 */
export function deleteShoppingList(data: KlartData, listId: string, today: string, now: Date): KlartData {
  const list = data.lists[listId];
  if (!list || list.deletedAt) {
    return data;
  }
  let next = unlinkTask(data, list.taskId, today, now);
  for (const item of list.items) {
    next = unlinkTask(next, item.taskId, today, now);
  }
  return changeList(next, listId, now, (current) => ({
    deletedAt: toUtcTimestamp(now),
    taskId: null,
    items: current.items.map((item) => (item.taskId ? { ...item, taskId: null } : item)),
  }));
}

export function reopenShoppingList(data: KlartData, listId: string, now: Date): KlartData {
  if (data.lists[listId]?.deletedAt) {
    return data;
  }
  return changeList(data, listId, now, () => ({ completedAt: null }));
}

/**
 * Carries changes made to linked tasks back to their lists: a completed task marks its item bought, a starred
 * one stars it, an archived one unlinks. Runs after every change, so it also catches edits that come in through
 * sync or from agents. Only a task newer than its item wins, so it never undoes a change made on the list.
 */
export function reconcileShoppingTasks(data: KlartData): KlartData {
  let next = data;
  for (const task of Object.values(data.tasks)) {
    const link = task.shopping;
    const list = link ? next.lists[link.listId] : undefined;
    if (!link || !list) {
      continue;
    }

    if (link.itemId === null) {
      if (task.status === "archived" && list.taskId === task.id) {
        next = upsertList(next, { ...list, taskId: null });
      }
      continue;
    }

    const item = list.items.find((other) => other.id === link.itemId);
    if (!item || item.taskId !== task.id) {
      continue;
    }
    let patch: Partial<ShoppingItem> | null = null;
    if (task.status === "archived") {
      patch = { taskId: null };
    } else if (
      task.updatedAt > item.updatedAt &&
      (item.bought !== (task.status === "done") || item.important !== task.important)
    ) {
      patch = { bought: task.status === "done", important: task.important, updatedAt: task.updatedAt };
    }
    if (patch) {
      const changed = { ...item, ...patch };
      const updatedAt = changed.updatedAt > list.updatedAt ? changed.updatedAt : list.updatedAt;
      next = upsertList(next, {
        ...list,
        updatedAt,
        items: list.items.map((other) => (other.id === item.id ? changed : other)),
      });
    }
  }
  return next;
}
