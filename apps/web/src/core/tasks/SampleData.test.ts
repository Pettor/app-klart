import { describe, expect, it } from "vitest";
import { SUGGESTION_REASONS } from "./Day";
import { addToDay, createTask, normalizeData } from "./KlartData";
import { addDays } from "./LocalDate";
import { parseQuickAdd } from "./QuickAdd";
import { createSampleData, hasSampleData, withoutSampleData } from "./SampleData";
import { buildSuggestions } from "./Suggestions";

const NOW = new Date(2026, 9, 21, 12, 0);
const TODAY = "2026-10-21";

describe("createSampleData", () => {
  const data = createSampleData(NOW);

  it("produces valid task files that every context exists for", () => {
    expect(normalizeData(data).tasks).toEqual(data.tasks);
    const contextIds = new Set(data.contexts.map((context) => context.id));
    for (const task of Object.values(data.tasks)) {
      expect(contextIds).toContain(task.context);
    }
  });

  it("fills today's and yesterday's My Day", () => {
    expect(data.days[TODAY]!.items.length).toBeGreaterThan(3);
    expect(data.days[addDays(TODAY, -1)]!.items.length).toBeGreaterThan(0);
  });

  it("shows every suggestion group", () => {
    const groups = buildSuggestions({
      tasks: Object.values(data.tasks),
      today: TODAY,
      todayDay: data.days[TODAY],
      yesterdayDay: data.days[addDays(TODAY, -1)],
      contextTags: data.contexts.map((context) => context.tag),
    });
    expect(groups.map((group) => group.reason)).toEqual([...SUGGESTION_REASONS]);
  });

  it("includes done, archived, important, reminder, linked and annotated tasks", () => {
    const tasks = Object.values(data.tasks);
    expect(tasks.some((task) => task.status === "done")).toBe(true);
    expect(tasks.some((task) => task.status === "archived")).toBe(true);
    expect(tasks.some((task) => task.important)).toBe(true);
    expect(tasks.some((task) => task.remindAt)).toBe(true);
    expect(tasks.some((task) => task.links.length > 1)).toBe(true);
    expect(tasks.some((task) => task.notes)).toBe(true);
  });
});

describe("withoutSampleData", () => {
  it("keeps real tasks, their days and the sample contexts they use", () => {
    const sample = createSampleData(NOW);
    const parsed = parseQuickAdd("#brf real board task", {
      today: TODAY,
      contexts: sample.contexts,
      currentContext: "all",
    });
    const real = createTask(parsed, NOW, "REAL");
    const mixed = addToDay(
      { ...sample, tasks: { ...sample.tasks, [real.id]: real } },
      TODAY,
      [{ taskId: real.id, addedBy: "user", reason: null }],
      NOW
    );

    const cleaned = withoutSampleData(mixed);

    expect(hasSampleData(sample)).toBe(true);
    expect(Object.keys(cleaned.tasks)).toEqual(["REAL"]);
    expect(cleaned.days[TODAY]!.items.map((item) => item.taskId)).toEqual(["REAL"]);
    expect(cleaned.days[addDays(TODAY, -1)]).toBeUndefined();
    expect(cleaned.contexts.map((context) => context.id)).toEqual(["personal", "work", "sample-brf"]);
  });

  it("leaves data without sample tasks alone", () => {
    const cleaned = withoutSampleData(withoutSampleData(createSampleData(NOW)));
    expect(hasSampleData(cleaned)).toBe(false);
    expect(cleaned.contexts.map((context) => context.id)).toEqual(["personal", "work"]);
  });
});
