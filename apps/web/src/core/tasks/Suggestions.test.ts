import { describe, expect, it } from "vitest";
import type { DayFile } from "./Day";
import { buildSuggestions, selectDueSuggestions } from "./Suggestions";
import type { Task } from "./Task";

const TODAY = "2026-10-21";

function task(id: string, patch: Partial<Task> = {}): Task {
  return {
    schema: "klart.task/v1",
    id,
    title: id,
    context: "personal",
    tags: [],
    due: null,
    remindAt: null,
    important: false,
    status: "open",
    notes: "",
    createdAt: `2026-10-01T08:00:${id.padStart(2, "0").slice(-2)}Z`,
    updatedAt: "2026-10-01T08:00:00Z",
    completedAt: null,
    raw: "",
    ...patch,
  };
}

function day(date: string, ids: string[]): DayFile {
  return {
    schema: "klart.day/v1",
    date,
    items: ids.map((taskId) => ({ taskId, addedAt: "", addedBy: "user", reason: null })),
  };
}

describe("buildSuggestions", () => {
  const tasks = [
    task("overdue-old", { due: "2026-08-28" }),
    task("overdue-new", { due: "2026-10-20" }),
    task("due-today", { due: TODAY }),
    task("yesterday", { tags: ["hem"] }),
    task("soon", { due: "2026-10-23" }),
    task("later", { due: "2026-11-30" }),
    task("related", { tags: ["acme"] }),
    task("planned", { tags: ["acme"] }),
    task("done", { due: "2026-10-01", status: "done" }),
    task("archived", { status: "archived" }),
  ];
  const todayDay = day(TODAY, ["planned"]);
  const yesterdayDay = day("2026-10-20", ["yesterday", "done"]);

  const groups = buildSuggestions({ tasks, today: TODAY, todayDay, yesterdayDay });
  const byReason = Object.fromEntries(groups.map((group) => [group.reason, group.tasks.map((t) => t.id)]));

  it("ranks groups in the documented order", () => {
    expect(groups.map((group) => group.reason)).toEqual([
      "overdue",
      "due_today",
      "left_from_yesterday",
      "coming_up",
      "related_to_today",
      "recently_added",
    ]);
  });

  it("sorts overdue tasks oldest first", () => {
    expect(byReason.overdue).toEqual(["overdue-old", "overdue-new"]);
  });

  it("puts each task in exactly one group", () => {
    expect(byReason.due_today).toEqual(["due-today"]);
    expect(byReason.left_from_yesterday).toEqual(["yesterday"]);
    expect(byReason.coming_up).toEqual(["soon"]);
    expect(byReason.related_to_today).toEqual(["related"]);
    expect(byReason.recently_added).toEqual(["later"]);
  });

  it("skips tasks already in My Day and tasks that aren't open", () => {
    const all = groups.flatMap((group) => group.tasks.map((t) => t.id));
    expect(all).not.toContain("planned");
    expect(all).not.toContain("done");
    expect(all).not.toContain("archived");
  });

  it("ignores context routing tags when looking for related tasks", () => {
    const result = buildSuggestions({
      tasks: [task("a", { tags: ["work"] }), task("b", { tags: ["work"] })],
      today: TODAY,
      todayDay: day(TODAY, ["a"]),
      contextTags: ["work"],
    });
    expect(result.map((group) => group.reason)).toEqual(["recently_added"]);
  });

  it("selects overdue and due-today tasks for Add all due", () => {
    expect(selectDueSuggestions(groups).map(({ task: t, reason }) => [t.id, reason])).toEqual([
      ["overdue-old", "overdue"],
      ["overdue-new", "overdue"],
      ["due-today", "due_today"],
    ]);
  });
});
