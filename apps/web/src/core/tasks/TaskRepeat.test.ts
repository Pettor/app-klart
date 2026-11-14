import { describe, expect, it } from "vitest";
import type { TaskRepeat } from "./TaskRepeat";
import { createRepeat, nextOccurrence, occurrenceOnOrAfter } from "./TaskRepeat";

// 2026-10-21 is a Wednesday.
function rule(patch: Partial<TaskRepeat>): TaskRepeat {
  return { every: 1, unit: "day", weekdays: [], from: "2026-10-21", ...patch };
}

describe("occurrenceOnOrAfter", () => {
  it.each([
    [rule({}), "2026-10-25", "2026-10-25"],
    [rule({ every: 3 }), "2026-10-23", "2026-10-24"],
    [rule({ every: 3 }), "2026-10-24", "2026-10-24"],
    // Never before the first occurrence
    [rule({ every: 3 }), "2026-10-01", "2026-10-21"],
    [rule({ unit: "week" }), "2026-10-22", "2026-10-28"],
    [rule({ unit: "week", weekdays: [1, 4] }), "2026-10-22", "2026-10-22"],
    [rule({ unit: "week", weekdays: [1, 4] }), "2026-10-23", "2026-10-26"],
    // Every other week: Mon 26 Oct is in an off week, Mon 2 Nov is on
    [rule({ unit: "week", every: 2, weekdays: [1] }), "2026-10-22", "2026-11-02"],
    [rule({ unit: "week", every: 2, weekdays: [3, 5] }), "2026-10-22", "2026-10-23"],
    [rule({ unit: "week", every: 2, weekdays: [3, 5] }), "2026-10-24", "2026-11-04"],
    [rule({ unit: "month" }), "2026-10-22", "2026-11-21"],
    [rule({ unit: "month", every: 3 }), "2026-10-22", "2027-01-21"],
    [rule({ unit: "year" }), "2026-10-22", "2027-10-21"],
  ])("%o from %s is %s", (repeat, date, expected) => {
    expect(occurrenceOnOrAfter(repeat, date)).toBe(expected);
  });

  it("keeps a monthly task on the 31st at the end of shorter months without drifting", () => {
    const repeat = rule({ unit: "month", from: "2026-01-31" });
    expect(occurrenceOnOrAfter(repeat, "2026-02-01")).toBe("2026-02-28");
    expect(occurrenceOnOrAfter(repeat, "2026-03-01")).toBe("2026-03-31");
    expect(occurrenceOnOrAfter(repeat, "2026-04-01")).toBe("2026-04-30");
  });

  it("puts a yearly task on 29 February on the 28th in other years", () => {
    expect(occurrenceOnOrAfter(rule({ unit: "year", from: "2028-02-29" }), "2028-03-01")).toBe("2029-02-28");
  });
});

describe("nextOccurrence", () => {
  it("is the first occurrence after the due date", () => {
    expect(nextOccurrence(rule({ unit: "week" }), "2026-10-21", "2026-10-21")).toBe("2026-10-28");
    // Completed early
    expect(nextOccurrence(rule({ unit: "week" }), "2026-10-21", "2026-10-19")).toBe("2026-10-28");
  });

  it("never falls before the day the task was completed", () => {
    // A daily task due Monday and completed on Wednesday comes back on Wednesday, not Tuesday.
    expect(nextOccurrence(rule({ from: "2026-10-19" }), "2026-10-19", "2026-10-21")).toBe("2026-10-21");
    expect(nextOccurrence(rule({ unit: "week", from: "2026-10-05" }), "2026-10-05", "2026-10-21")).toBe("2026-10-26");
  });
});

describe("createRepeat", () => {
  it("starts a weekly rule on its date's weekday", () => {
    expect(createRepeat("week", "2026-10-21")).toEqual({ every: 1, unit: "week", weekdays: [3], from: "2026-10-21" });
    expect(createRepeat("month", "2026-10-21", 2)).toEqual({
      every: 2,
      unit: "month",
      weekdays: [],
      from: "2026-10-21",
    });
  });
});
