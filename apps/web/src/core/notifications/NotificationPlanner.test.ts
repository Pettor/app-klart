import { describe, expect, it } from "vitest";
import { planNotifications } from "./NotificationPlanner";
import type { NotificationSettings } from "./NotificationSettings";
import { DEFAULT_NOTIFICATION_SETTINGS } from "./NotificationSettings";
import type { KlartData } from "~/core/tasks/KlartData";
import { createEmptyData } from "~/core/tasks/KlartData";
import type { Task } from "~/core/tasks/Task";

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
    createdAt: "2026-10-01T08:00:00Z",
    updatedAt: "2026-10-01T08:00:00Z",
    completedAt: null,
    raw: "",
    ...patch,
  };
}

function data(tasks: Task[], inToday: string[] = []): KlartData {
  return {
    ...createEmptyData(),
    tasks: Object.fromEntries(tasks.map((t) => [t.id, t])),
    days: {
      "2026-10-21": {
        schema: "klart.day/v1",
        date: "2026-10-21",
        items: inToday.map((taskId) => ({ taskId, addedAt: "", addedBy: "user" as const, reason: null })),
      },
    },
  };
}

/** Local time on Wednesday 21 October 2026. */
function at(hours: number, minutes = 0): Date {
  return new Date(2026, 9, 21, hours, minutes);
}

function kinds(
  now: Date,
  input: KlartData,
  settings: NotificationSettings = DEFAULT_NOTIFICATION_SETTINGS,
  sent: string[] = []
): string[] {
  return planNotifications({ now, data: input, settings, sent: new Set(sent) }).map((n) => n.key);
}

describe("planNotifications", () => {
  const reminder = task("r", { remindAt: "2026-10-21T14:00", due: "2026-10-21" });

  it("sends a reminder once its time has passed", () => {
    expect(kinds(at(13, 59), data([reminder]))).toEqual([]);
    expect(kinds(at(14, 0), data([reminder]))).toEqual(["reminder:r:2026-10-21T14:00"]);
  });

  it("doesn't send a reminder twice", () => {
    expect(kinds(at(14, 1), data([reminder]), DEFAULT_NOTIFICATION_SETTINGS, ["reminder:r:2026-10-21T14:00"])).toEqual(
      []
    );
  });

  it("drops reminders that are long past", () => {
    const old = task("old", { remindAt: "2026-10-19T09:00" });
    expect(kinds(at(14), data([old]))).toEqual([]);
  });

  it("skips completed tasks", () => {
    expect(kinds(at(14, 5), data([{ ...reminder, status: "done" }]))).toEqual([]);
  });

  it("waits for a context's notification hours", () => {
    const settings: NotificationSettings = {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      contexts: { personal: { enabled: true, from: "15:00", to: "21:00", weekdaysOnly: false } },
    };
    expect(kinds(at(14, 5), data([reminder]), settings)).toEqual([]);
    expect(kinds(at(15, 0), data([reminder]), settings)).toEqual(["reminder:r:2026-10-21T14:00"]);
  });

  it("summarises the day at the plan time, within its window", () => {
    const tasks = [task("late", { due: "2026-10-01" }), task("today", { due: "2026-10-21" })];
    const plan = planNotifications({
      now: at(8, 30),
      data: data(tasks),
      settings: DEFAULT_NOTIFICATION_SETTINGS,
      sent: new Set(),
    });
    expect(plan[0]).toMatchObject({ kind: "plan-day", overdue: 1, dueToday: 1, leftFromYesterday: 0, suggestions: 2 });
    expect(kinds(at(7, 59), data(tasks))).toEqual([]);
    expect(kinds(at(12, 0), data(tasks))).not.toContain("plan-day:2026-10-21");
  });

  it("nudges about overdue tasks and wraps up what's left in My Day", () => {
    const tasks = [task("late", { due: "2026-10-01" }), task("open")];
    expect(kinds(at(10, 15), data(tasks))).toContain("overdue:2026-10-21");
    expect(kinds(at(17, 5), data(tasks, ["open"]))).toEqual(["wrap-up:2026-10-21"]);
  });

  it("groups due-today tasks without a reminder time", () => {
    const tasks = [task("a", { due: "2026-10-21" }), task("b", { due: "2026-10-21", remindAt: "2026-10-21T18:00" })];
    const due = planNotifications({
      now: at(13, 0),
      data: data(tasks),
      settings: DEFAULT_NOTIFICATION_SETTINGS,
      sent: new Set(),
    });
    expect(due).toHaveLength(1);
    expect(due[0]).toMatchObject({ kind: "due-today" });
    expect(due[0]?.kind === "due-today" && due[0].tasks.map((t) => t.id)).toEqual(["a"]);
  });
});
