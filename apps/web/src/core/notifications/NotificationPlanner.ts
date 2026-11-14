import type { NotificationSettings, TimedNotificationSetting } from "./NotificationSettings";
import { getContextNotifications } from "./NotificationSettings";
import type { KlartData } from "~/core/tasks/KlartData";
import { addDays, minutesOfDay, parseLocalDateTime, toLocalDate } from "~/core/tasks/LocalDate";
import { buildSuggestions } from "~/core/tasks/Suggestions";
import type { Task } from "~/core/tasks/Task";
import { isOpen } from "~/core/tasks/Task";

/** A notification that is due now. `key` is stable so nothing rings twice. */
export type PlannedNotification =
  | { key: string; kind: "reminder"; task: Task }
  | { key: string; kind: "recurring"; task: Task }
  | { key: string; kind: "plan-day"; overdue: number; dueToday: number; leftFromYesterday: number; suggestions: number }
  | { key: string; kind: "due-today"; tasks: Task[] }
  | { key: string; kind: "overdue"; tasks: Task[] }
  | { key: string; kind: "wrap-up"; tasks: Task[] };

export interface PlannerInput {
  now: Date;
  data: KlartData;
  settings: NotificationSettings;
  /** Keys already sent on this device. */
  sent: Set<string>;
}

/** Daily summaries are only sent within this many minutes after their time, so a late start doesn't ring stale news. */
export const DAILY_WINDOW_MINUTES = 180;

/** Reminders older than this are dropped instead of sent. */
export const REMINDER_GRACE_MINUTES = 12 * 60;

function isWithinContextHours(task: Task, settings: NotificationSettings, now: Date): boolean {
  const hours = getContextNotifications(settings, task.context);
  if (!hours.enabled) {
    return false;
  }
  const weekday = now.getDay();
  if (hours.weekdaysOnly && (weekday === 0 || weekday === 6)) {
    return false;
  }
  const minutes = now.getHours() * 60 + now.getMinutes();
  const from = minutesOfDay(hours.from);
  const to = minutesOfDay(hours.to);
  return from <= to ? minutes >= from && minutes <= to : minutes >= from || minutes <= to;
}

function isDailyDue(setting: TimedNotificationSetting, now: Date): boolean {
  if (!setting.enabled) {
    return false;
  }
  const elapsed = now.getHours() * 60 + now.getMinutes() - minutesOfDay(setting.time);
  return elapsed >= 0 && elapsed <= DAILY_WINDOW_MINUTES;
}

/** Works out which notifications should be shown right now. Pure, so it can run on any timer. */
export function planNotifications({ now, data, settings, sent }: PlannerInput): PlannedNotification[] {
  const today = toLocalDate(now);
  const planned: PlannedNotification[] = [];
  const tasks = Object.values(data.tasks).filter(isOpen);
  const notifiable = tasks.filter((task) => isWithinContextHours(task, settings, now));
  const todayDay = data.days[today];
  const inToday = new Set(todayDay?.items.map((item) => item.taskId));

  if (settings.reminders.enabled) {
    for (const task of notifiable) {
      // Recurring tasks get a notification of their own, below.
      if (!task.remindAt || task.repeat) {
        continue;
      }
      const key = `reminder:${task.id}:${task.remindAt}`;
      const lateBy = (now.getTime() - parseLocalDateTime(task.remindAt).getTime()) / 60_000;
      if (lateBy >= 0 && lateBy <= REMINDER_GRACE_MINUTES && !sent.has(key)) {
        planned.push({ key, kind: "reminder", task });
      }
    }
  }

  // One per occurrence: at its reminder when it has one, else at the daily time on its due date.
  if (settings.recurring.enabled) {
    for (const task of notifiable) {
      if (!task.repeat || !task.due) {
        continue;
      }
      const key = `recurring:${task.id}:${task.due}`;
      if (sent.has(key)) {
        continue;
      }
      if (task.remindAt) {
        const lateBy = (now.getTime() - parseLocalDateTime(task.remindAt).getTime()) / 60_000;
        if (lateBy >= 0 && lateBy <= REMINDER_GRACE_MINUTES) {
          planned.push({ key, kind: "recurring", task });
        }
      } else if (task.due === today && isDailyDue(settings.recurring, now)) {
        planned.push({ key, kind: "recurring", task });
      }
    }
  }

  const planKey = `plan-day:${today}`;
  if (isDailyDue(settings.planDay, now) && !sent.has(planKey)) {
    const groups = buildSuggestions({
      tasks: notifiable,
      today,
      todayDay,
      yesterdayDay: data.days[addDays(today, -1)],
      contextTags: data.contexts.map((context) => context.tag),
    });
    function count(reason: string): number {
      return groups.find((group) => group.reason === reason)?.tasks.length ?? 0;
    }
    const suggestions = groups
      .filter((group) => group.reason !== "recently_added")
      .reduce((sum, group) => sum + group.tasks.length, 0);
    if (suggestions > 0) {
      planned.push({
        key: planKey,
        kind: "plan-day",
        overdue: count("overdue"),
        dueToday: count("due_today"),
        leftFromYesterday: count("left_from_yesterday"),
        suggestions,
      });
    }
  }

  const dueKey = `due-today:${today}`;
  if (isDailyDue(settings.dueToday, now) && !sent.has(dueKey)) {
    const dueToday = notifiable.filter(
      (task) => task.due === today && !task.remindAt && !(task.repeat && settings.recurring.enabled)
    );
    if (dueToday.length > 0) {
      planned.push({ key: dueKey, kind: "due-today", tasks: dueToday });
    }
  }

  const overdueKey = `overdue:${today}`;
  if (isDailyDue(settings.overdue, now) && !sent.has(overdueKey)) {
    const overdue = notifiable
      .filter((task) => !!task.due && task.due < today)
      .sort((a, b) => (a.due! < b.due! ? -1 : 1));
    if (overdue.length > 0) {
      planned.push({ key: overdueKey, kind: "overdue", tasks: overdue });
    }
  }

  const wrapKey = `wrap-up:${today}`;
  if (isDailyDue(settings.wrapUp, now) && !sent.has(wrapKey)) {
    const open = notifiable.filter((task) => inToday.has(task.id));
    if (open.length > 0) {
      planned.push({ key: wrapKey, kind: "wrap-up", tasks: open });
    }
  }

  return planned;
}
