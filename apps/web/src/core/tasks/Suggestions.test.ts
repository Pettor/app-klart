import { describe, expect, it } from "vitest";
import type { DayFile } from "./Day";
import { addDays } from "./LocalDate";
import type { RankedSuggestion } from "./Suggestions";
import {
  buildSuggestions,
  getSnoozedToday,
  isUrgentSuggestion,
  rankSuggestions,
  selectDueSuggestions,
} from "./Suggestions";
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
    links: [],
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

  it("leaves out groups switched off in settings and widens coming up", () => {
    const result = buildSuggestions({
      tasks: [task("soon", { due: addDays(TODAY, 5) }), task("loose")],
      today: TODAY,
      settings: { disabled: ["recently_added"], comingUpDays: 7 },
    });
    expect(result.map((group) => [group.reason, group.tasks.map((t) => t.id)])).toEqual([["coming_up", ["soon"]]]);
  });

  it("selects overdue and due-today tasks for Add all due", () => {
    expect(selectDueSuggestions(groups).map(({ task: t, reason }) => [t.id, reason])).toEqual([
      ["overdue-old", "overdue"],
      ["overdue-new", "overdue"],
      ["due-today", "due_today"],
    ]);
  });
});

describe("rankSuggestions", () => {
  function rank(tasks: Task[], planned: string[] = [], yesterday: string[] = []): RankedSuggestion[] {
    return rankSuggestions({
      tasks,
      today: TODAY,
      todayDay: day(TODAY, planned),
      yesterdayDay: day(addDays(TODAY, -1), yesterday),
      contextTags: ["work"],
    });
  }

  it("orders by urgency: overdue, due today, left from yesterday, soon, undated", () => {
    const ranked = rank(
      [
        task("undated"),
        task("soon", { due: addDays(TODAY, 2) }),
        task("yesterday"),
        task("today", { due: TODAY }),
        task("overdue", { due: addDays(TODAY, -2) }),
      ],
      [],
      ["yesterday"]
    );
    expect(ranked.map((suggestion) => suggestion.task.id)).toEqual([
      "overdue",
      "today",
      "yesterday",
      "soon",
      "undated",
    ]);
    expect(ranked.map((suggestion) => suggestion.why)).toEqual([
      { type: "overdue", days: 2 },
      { type: "due_today" },
      { type: "left_from_yesterday" },
      { type: "due_in", days: 2 },
      { type: "no_date" },
    ]);
  });

  it("asks about long-overdue tasks instead of leading with them", () => {
    const ranked = rank([task("stale", { due: addDays(TODAY, -54) }), task("yesterday")], [], ["yesterday"]);
    expect(ranked.map((suggestion) => suggestion.task.id)).toEqual(["yesterday", "stale"]);
    expect(ranked[1]).toMatchObject({ why: { type: "stale", days: 54 }, kinds: ["overdue"] });
    expect(isUrgentSuggestion(ranked[1]!)).toBe(false);
  });

  it("lifts important tasks and tasks with a reminder today", () => {
    const ranked = rank([
      task("plain"),
      task("reminder", { remindAt: `${TODAY}T14:00` }),
      task("star", { important: true }),
    ]);
    expect(ranked.map((suggestion) => suggestion.task.id)).toEqual(["star", "reminder", "plain"]);
    expect(ranked[0]!.kinds).toEqual(["important"]);
  });

  it("explains a weak suggestion by its shared tag, ignoring context tags", () => {
    const ranked = rank(
      [
        task("planned", { tags: ["acme", "work"] }),
        task("related", { tags: ["acme"] }),
        task("work-only", { tags: ["work"] }),
        task("overdue", { due: addDays(TODAY, -2), tags: ["acme"] }),
      ],
      ["planned"]
    );
    const byId = Object.fromEntries(ranked.map((suggestion) => [suggestion.task.id, suggestion]));
    expect(byId.related).toMatchObject({ why: { type: "goes_with_today", tag: "acme" }, kinds: ["related"] });
    expect(byId["work-only"]).toMatchObject({ why: { type: "no_date" }, kinds: [] });
    expect(byId.overdue).toMatchObject({ why: { type: "overdue", days: 2 }, kinds: ["overdue", "related"] });
  });

  it("counts anything due today or worse as urgent", () => {
    const ranked = rank([task("today", { due: TODAY }), task("tomorrow", { due: addDays(TODAY, 1) })]);
    expect(ranked.filter(isUrgentSuggestion).map((suggestion) => suggestion.task.id)).toEqual(["today"]);
  });

  it("leaves out snoozed tasks and follows settings", () => {
    const ranked = rankSuggestions({
      tasks: [task("snoozed", { due: TODAY }), task("soon", { due: addDays(TODAY, 5) }), task("loose")],
      today: TODAY,
      snoozedIds: new Set(["snoozed"]),
      settings: { disabled: ["recently_added"], comingUpDays: 7 },
    });
    expect(ranked.map((suggestion) => suggestion.task.id)).toEqual(["soon"]);
  });
});

describe("getSnoozedToday", () => {
  it("only keeps today's, so a snoozed task returns the next day", () => {
    expect([...getSnoozedToday({ a: TODAY, b: addDays(TODAY, -1) }, TODAY)]).toEqual(["a"]);
  });
});
