import { describe, expect, it } from "vitest";
import { keepStarredFirst } from "./MyDayTaskOrder";
import type { MyDayTask } from "./MyDayTypes";

function task(id: string, important: boolean): MyDayTask {
  return {
    id,
    title: id,
    done: false,
    important,
    due: null,
    remindAt: null,
    tags: [],
    links: [],
    notes: "",
    contextName: "Personal",
    contextColor: "blue",
    isInMyDay: true,
  };
}

// Starred a and b lead; c and d follow.
const TASKS = [task("a", true), task("b", true), task("c", false), task("d", false)];

describe("keepStarredFirst", () => {
  it("keeps a move within the task's own group", () => {
    expect(keepStarredFirst(TASKS, "d", "c", "before")).toEqual({ targetId: "c", position: "before" });
    expect(keepStarredFirst(TASKS, "a", "b", "after")).toEqual({ targetId: "b", position: "after" });
  });

  it("lands an unstarred task dropped among the starred ones at the top of its group", () => {
    expect(keepStarredFirst(TASKS, "d", "a", "before")).toEqual({ targetId: "c", position: "before" });
  });

  it("lands a starred task dropped among the unstarred ones at the bottom of its group", () => {
    expect(keepStarredFirst(TASKS, "a", "d", "after")).toEqual({ targetId: "b", position: "after" });
  });

  it("doesn't move a task that's alone in its group", () => {
    const tasks = [task("a", true), task("c", false)];
    expect(keepStarredFirst(tasks, "a", "c", "after")).toBeNull();
  });
});
