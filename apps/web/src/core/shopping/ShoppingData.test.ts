import { describe, expect, it } from "vitest";
import {
  addItemToDay,
  addListToDay,
  addShoppingItem,
  completeShoppingList,
  createShoppingItem,
  createShoppingList,
  deleteShoppingList,
  reconcileShoppingTasks,
  removeItemFromDay,
  removeShoppingItem,
  renameShoppingList,
  reopenShoppingList,
  setItemBought,
  toggleItemImportant,
  upsertList,
} from "./ShoppingData";
import { parseShoppingItem } from "./ShoppingItemParse";
import type { KlartData } from "~/core/tasks/KlartData";
import { archiveTask, createEmptyData, normalizeData, setTaskDone, updateTask } from "~/core/tasks/KlartData";

const TODAY = "2026-10-28";
const T0 = new Date("2026-10-28T08:00:00Z");
const T1 = new Date("2026-10-28T09:00:00Z");
const T2 = new Date("2026-10-28T10:00:00Z");

function seed(): KlartData {
  let data = upsertList(createEmptyData(), createShoppingList("L1", "Week", "grocery", "personal", null, T0));
  data = upsertList(data, createShoppingList("L2", "Next week", "grocery", "personal", null, T0));
  data = addShoppingItem(data, "L1", createShoppingItem("milk", parseShoppingItem("2x mjölk"), T0), T0);
  data = addShoppingItem(data, "L1", createShoppingItem("bread", parseShoppingItem("Bröd"), T0), T0);
  return data;
}

function withMilkInDay(): KlartData {
  return addItemToDay(seed(), "L1", "milk", { id: "T1", title: "Buy: mjölk × 2", context: "personal" }, TODAY, T1);
}

describe("addItemToDay", () => {
  it("creates a linked task in today's My Day", () => {
    const data = withMilkInDay();
    expect(data.tasks.T1).toMatchObject({ title: "Buy: mjölk × 2", shopping: { listId: "L1", itemId: "milk" } });
    expect(data.lists.L1!.items[0]!.taskId).toBe("T1");
    expect(data.days[TODAY]!.items.map((item) => item.taskId)).toEqual(["T1"]);
  });

  it("survives normalizing, so the link is stored", () => {
    const data = withMilkInDay();
    expect(normalizeData(JSON.parse(JSON.stringify(data)))).toEqual(data);
  });
});

describe("the two-way link", () => {
  it("buying the item completes the task", () => {
    const data = setItemBought(withMilkInDay(), "L1", "milk", true, T2);
    expect(data.tasks.T1!.status).toBe("done");
    expect(reconcileShoppingTasks(data)).toBe(data);
  });

  it("completing the task marks the item bought, and reopening it takes it back", () => {
    const done = reconcileShoppingTasks(setTaskDone(withMilkInDay(), "T1", true, T2));
    expect(done.lists.L1!.items[0]!.bought).toBe(true);
    const reopened = reconcileShoppingTasks(setTaskDone(done, "T1", false, new Date("2026-10-28T11:00:00Z")));
    expect(reopened.lists.L1!.items[0]!.bought).toBe(false);
  });

  it("starring either side stars the other", () => {
    const starred = toggleItemImportant(withMilkInDay(), "L1", "milk", T2);
    expect(starred.tasks.T1!.important).toBe(true);
    const unstarred = reconcileShoppingTasks(
      updateTask(starred, "T1", { important: false }, new Date("2026-10-28T11:00:00Z"))
    );
    expect(unstarred.lists.L1!.items[0]!.important).toBe(false);
  });

  it("deleting the task unlinks the item", () => {
    const data = reconcileShoppingTasks(archiveTask(withMilkInDay(), "T1", T2));
    expect(data.lists.L1!.items[0]!.taskId).toBeNull();
  });

  it("an older task never undoes a newer change on the list", () => {
    const data = withMilkInDay();
    const stale = { ...data, tasks: { ...data.tasks, T1: { ...data.tasks.T1!, status: "done" as const } } };
    expect(reconcileShoppingTasks(stale).lists.L1!.items[0]!.bought).toBe(false);
  });
});

describe("removing", () => {
  it("taking an item out of My Day archives its task", () => {
    const data = removeItemFromDay(withMilkInDay(), "L1", "milk", TODAY, T2);
    expect(data.tasks.T1!.status).toBe("archived");
    expect(data.days[TODAY]!.items).toEqual([]);
    expect(data.lists.L1!.items[0]!.taskId).toBeNull();
  });

  it("removing an item archives its task", () => {
    const data = removeShoppingItem(withMilkInDay(), "L1", "milk", TODAY, T2);
    expect(data.lists.L1!.items.map((item) => item.id)).toEqual(["bread"]);
    expect(data.tasks.T1!.status).toBe("archived");
  });
});

describe("completeShoppingList", () => {
  it("moves items left to another list, keeping their tasks linked", () => {
    const data = completeShoppingList(setItemBought(withMilkInDay(), "L1", "bread", true, T1), "L1", "L2", TODAY, T2);
    expect(data.lists.L1!.completedAt).toBe("2026-10-28T10:00:00Z");
    expect(data.lists.L1!.items.map((item) => item.id)).toEqual(["bread"]);
    expect(data.lists.L2!.items.map((item) => item.id)).toEqual(["milk"]);
    expect(data.tasks.T1).toMatchObject({ status: "open", shopping: { listId: "L2", itemId: "milk" } });
  });

  it("completing anyway keeps the items and archives their tasks", () => {
    const data = completeShoppingList(withMilkInDay(), "L1", null, TODAY, T2);
    expect(data.lists.L1!.items).toHaveLength(2);
    expect(data.tasks.T1!.status).toBe("archived");
  });

  it("completes the list's own task", () => {
    const linked = addListToDay(seed(), "L1", { id: "LT", title: "Shop: Week", context: "personal" }, TODAY, T1);
    expect(linked.lists.L1!.taskId).toBe("LT");
    const data = completeShoppingList(linked, "L1", null, TODAY, T2);
    expect(data.tasks.LT!.status).toBe("done");
  });
});

describe("renameShoppingList", () => {
  it("renames, trimming the name", () => {
    const data = renameShoppingList(seed(), "L1", "  Weekend ", T1);
    expect(data.lists.L1).toMatchObject({ name: "Weekend", updatedAt: "2026-10-28T09:00:00Z" });
  });

  it("ignores a blank name", () => {
    const data = seed();
    expect(renameShoppingList(data, "L1", "  ", T1)).toBe(data);
  });
});

describe("deleteShoppingList", () => {
  it("marks the list deleted and archives the tasks made from it", () => {
    const data = deleteShoppingList(withMilkInDay(), "L1", TODAY, T2);
    expect(data.lists.L1!.deletedAt).toBe("2026-10-28T10:00:00Z");
    expect(data.lists.L1!.items[0]!.taskId).toBeNull();
    expect(data.tasks.T1!.status).toBe("archived");
    expect(data.days[TODAY]!.items).toHaveLength(0);
  });

  it("keeps the deletion through normalizing, so it syncs", () => {
    const data = deleteShoppingList(seed(), "L1", TODAY, T2);
    expect(normalizeData(JSON.parse(JSON.stringify(data))).lists.L1!.deletedAt).toBe("2026-10-28T10:00:00Z");
  });

  it("a deleted list can't be completed, reopened or moved to", () => {
    const data = deleteShoppingList(seed(), "L2", TODAY, T1);
    expect(completeShoppingList(data, "L2", null, TODAY, T2)).toBe(data);
    expect(completeShoppingList(data, "L1", "L2", TODAY, T2)).toBe(data);
    expect(reopenShoppingList(data, "L2", T2)).toBe(data);
  });
});
