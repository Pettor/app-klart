import { describe, expect, it } from "vitest";
import {
  addToDay,
  archiveTask,
  createEmptyData,
  createTask,
  moveContext,
  moveDayItem,
  moveDayItemNextTo,
  normalizeData,
  removeContext,
  removeFromDay,
  setTaskDone,
  updateTask,
} from "./KlartData";
import { parseQuickAdd } from "./QuickAdd";
import { createShoppingList, upsertList } from "~/core/shopping/ShoppingData";

const TODAY = "2026-10-21";
const CREATED = new Date("2026-10-21T08:12:04.123Z");
const LATER = new Date("2026-10-21T09:00:00.000Z");

function setup(): ReturnType<typeof createEmptyData> {
  const data = createEmptyData();
  const parsed = parseQuickAdd("#work review PR @today", {
    today: TODAY,
    contexts: data.contexts,
    currentContext: "all",
  });
  const task = createTask(parsed, CREATED, "T1");
  return { ...data, tasks: { [task.id]: task } };
}

describe("createTask", () => {
  it("stamps timestamps without milliseconds", () => {
    const task = setup().tasks.T1!;
    expect(task).toMatchObject({
      schema: "klart.task/v1",
      title: "Review PR",
      context: "work",
      status: "open",
      createdAt: "2026-10-21T08:12:04Z",
      updatedAt: "2026-10-21T08:12:04Z",
    });
  });

  it("creates sortable ULIDs by default", () => {
    const parsed = parseQuickAdd("x", { today: TODAY, contexts: createEmptyData().contexts, currentContext: "all" });
    const first = createTask(parsed, new Date(1_000));
    const second = createTask(parsed, new Date(2_000));
    expect(first.id).toHaveLength(26);
    expect(first.id < second.id).toBe(true);
  });
});

describe("task changes", () => {
  it("updates updatedAt on every change", () => {
    const next = updateTask(setup(), "T1", { title: "Review the PR" }, LATER);
    expect(next.tasks.T1).toMatchObject({ title: "Review the PR", updatedAt: "2026-10-21T09:00:00Z" });
  });

  it("sets and clears completedAt", () => {
    const done = setTaskDone(setup(), "T1", true, LATER);
    expect(done.tasks.T1).toMatchObject({ status: "done", completedAt: "2026-10-21T09:00:00Z" });
    expect(setTaskDone(done, "T1", false, LATER).tasks.T1).toMatchObject({ status: "open", completedAt: null });
  });

  it("archives instead of deleting", () => {
    expect(archiveTask(setup(), "T1", LATER).tasks.T1?.status).toBe("archived");
  });

  it("ignores unknown tasks", () => {
    const data = setup();
    expect(updateTask(data, "missing", { title: "x" }, LATER)).toBe(data);
  });
});

describe("day changes", () => {
  it("adds once, keeps order and removes", () => {
    let data = addToDay(setup(), TODAY, [{ taskId: "T1", addedBy: "user", reason: null }], LATER);
    data = addToDay(data, TODAY, [{ taskId: "T1", addedBy: "agent", reason: "due_today" }], LATER);
    data = addToDay(data, TODAY, [{ taskId: "T2", addedBy: "suggestion", reason: "overdue" }], LATER);
    expect(data.days[TODAY]?.items.map((item) => [item.taskId, item.addedBy])).toEqual([
      ["T1", "user"],
      ["T2", "suggestion"],
    ]);

    data = moveDayItem(data, TODAY, "T2", 0);
    expect(data.days[TODAY]?.items.map((item) => item.taskId)).toEqual(["T2", "T1"]);

    data = removeFromDay(data, TODAY, "T2");
    expect(data.days[TODAY]?.items.map((item) => item.taskId)).toEqual(["T1"]);
  });

  it("moves an item next to another one", () => {
    let data = addToDay(
      setup(),
      TODAY,
      ["A", "B", "C", "D"].map((taskId) => ({ taskId, addedBy: "user" as const, reason: null })),
      LATER
    );
    function order(): string[] {
      return data.days[TODAY]!.items.map((item) => item.taskId);
    }

    data = moveDayItemNextTo(data, TODAY, "A", "C", "after");
    expect(order()).toEqual(["B", "C", "A", "D"]);

    data = moveDayItemNextTo(data, TODAY, "D", "B", "before");
    expect(order()).toEqual(["D", "B", "C", "A"]);

    const unchanged = data;
    expect(moveDayItemNextTo(data, TODAY, "A", "missing", "before")).toBe(unchanged);
    expect(moveDayItemNextTo(data, TODAY, "A", "A", "before")).toBe(unchanged);
  });
});

describe("context changes", () => {
  it("moves tasks to the first remaining context when one is removed", () => {
    const next = removeContext(setup(), "work", LATER);
    expect(next.contexts.map((context) => context.id)).toEqual(["personal"]);
    expect(next.tasks.T1).toMatchObject({ context: "personal", updatedAt: "2026-10-21T09:00:00Z" });
  });

  it("moves shopping lists to the first remaining context when one is removed", () => {
    let data = upsertList(setup(), createShoppingList("L1", "Office", "other", "work", null, CREATED));
    data = upsertList(data, { ...createShoppingList("L2", "Old", "other", "personal", null, CREATED), context: null });
    const next = removeContext(data, "work", LATER);
    expect(next.lists.L1).toMatchObject({ context: "personal", updatedAt: "2026-10-21T09:00:00Z" });
    expect(next.lists.L2).toBe(data.lists.L2);

    // A list without a context belongs to the first one, so it moves when that one goes.
    expect(removeContext(data, "personal", LATER).lists.L2).toMatchObject({ context: "work" });
  });

  it("never removes the last context", () => {
    const one = removeContext(setup(), "work", LATER);
    expect(removeContext(one, "personal", LATER)).toBe(one);
  });

  it("reorders contexts", () => {
    expect(moveContext(setup(), "work", -1).contexts.map((context) => context.id)).toEqual(["work", "personal"]);
    const data = setup();
    expect(moveContext(data, "work", 1)).toBe(data);
  });
});

describe("normalizeData", () => {
  it("fills in fields missing from tasks stored by an older version", () => {
    const data = setup();
    const { links: _links, ...oldTask } = data.tasks.T1!;
    const stored = { ...data, tasks: { T1: oldTask } } as unknown as typeof data;
    expect(normalizeData(stored).tasks.T1).toEqual(data.tasks.T1);
  });

  it("drops tasks that can't be read", () => {
    const data = setup();
    const stored = { ...data, tasks: { ...data.tasks, broken: { title: 42 } } } as unknown as typeof data;
    expect(Object.keys(normalizeData(stored).tasks)).toEqual(["T1"]);
  });
});
