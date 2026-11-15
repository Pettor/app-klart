import { describe, expect, it } from "vitest";
import { groupPlannedTasks } from "./MyDayPlannedGroups";
import type { MyDayTask } from "./MyDayTypes";

// Wednesday
const TODAY = "2026-10-21";

function task(id: string, due: string | null): MyDayTask {
  return {
    id,
    title: id,
    done: false,
    important: false,
    due,
    remindAt: null,
    tags: [],
    links: [],
    notes: "",
    contextName: "Personal",
    contextColor: "blue",
    isInMyDay: false,
  };
}

describe("groupPlannedTasks", () => {
  it("sorts tasks into sections by due date, keeping their order", () => {
    const groups = groupPlannedTasks(
      [
        task("old", "2026-09-01"),
        task("yesterday", "2026-10-20"),
        task("today", TODAY),
        task("tomorrow", "2026-10-22"),
        task("week", "2026-10-28"),
        task("later", "2026-10-29"),
      ],
      TODAY
    );
    expect(groups.map((group) => [group.id, group.tasks.map((entry) => entry.id)])).toEqual([
      ["overdue", ["old", "yesterday"]],
      ["today", ["today"]],
      ["tomorrow", ["tomorrow"]],
      ["week", ["week"]],
      ["later", ["later"]],
    ]);
  });

  it("leaves out empty sections and undated tasks", () => {
    const groups = groupPlannedTasks([task("undated", null), task("later", "2027-01-01")], TODAY);
    expect(groups.map((group) => group.id)).toEqual(["later"]);
  });
});
