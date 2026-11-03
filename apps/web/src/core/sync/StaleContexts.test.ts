import { describe, expect, it } from "vitest";
import { withoutContexts } from "./StaleContexts";
import { createShoppingList, upsertList } from "~/core/shopping/ShoppingData";
import { addToDay, createEmptyData, createTask } from "~/core/tasks/KlartData";
import { parseQuickAdd } from "~/core/tasks/QuickAdd";

const TODAY = "2026-11-03";

describe("StaleContexts", () => {
  it("drops contexts with their tasks, shopping lists and My Day items", () => {
    const empty = createEmptyData();
    const work = createTask(
      parseQuickAdd("review PR", { today: TODAY, contexts: empty.contexts, currentContext: "work" }),
      new Date(),
      "W1"
    );
    const home = createTask(
      parseQuickAdd("water the plants", { today: TODAY, contexts: empty.contexts, currentContext: "personal" }),
      new Date(),
      "P1"
    );
    const withTasks = addToDay(
      { ...empty, tasks: { W1: work, P1: home } },
      TODAY,
      [
        { taskId: "W1", addedBy: "user", reason: null },
        { taskId: "P1", addedBy: "user", reason: null },
      ],
      new Date()
    );
    const data = upsertList(withTasks, createShoppingList("L1", "Office", "other", "work", null, new Date()));

    const next = withoutContexts(data, ["work"]);
    expect(next.contexts.map((context) => context.id)).toEqual(["personal"]);
    expect(Object.keys(next.tasks)).toEqual(["P1"]);
    expect(next.lists).toEqual({});
    expect(next.days[TODAY]?.items.map((item) => item.taskId)).toEqual(["P1"]);
  });
});
