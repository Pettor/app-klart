import type { IntlShape } from "react-intl";
import { addDays, parseLocalDate } from "~/core/tasks/LocalDate";

export type DueTone = "overdue" | "today" | "upcoming";

/** "Wed, 21 Oct" */
export function formatShortDate(intl: IntlShape, date: string): string {
  return intl.formatDate(parseLocalDate(date), { weekday: "short", day: "numeric", month: "short" });
}

/** "Today", "Tomorrow", "Yesterday" or a short date. */
export function formatRelativeDate(intl: IntlShape, date: string, today: string): string {
  if (date === today) {
    return intl.formatMessage({
      description: "TaskDateFormat - relative date today",
      defaultMessage: "Today",
      id: "ycLm5+",
    });
  }
  if (date === addDays(today, 1)) {
    return intl.formatMessage({
      description: "TaskDateFormat - relative date tomorrow",
      defaultMessage: "Tomorrow",
      id: "FiTbOq",
    });
  }
  if (date === addDays(today, -1)) {
    return intl.formatMessage({
      description: "TaskDateFormat - relative date yesterday",
      defaultMessage: "Yesterday",
      id: "WtGmGk",
    });
  }
  return formatShortDate(intl, date);
}

export function getDueTone(due: string, today: string): DueTone {
  if (due < today) {
    return "overdue";
  }
  return due === today ? "today" : "upcoming";
}

/** "Overdue, Fri, 28 Aug", "Today" or "Tomorrow". */
export function formatDue(intl: IntlShape, due: string, today: string): string {
  if (due < today) {
    return intl.formatMessage(
      {
        description: "TaskDateFormat - overdue due date label",
        defaultMessage: "Overdue, {date}",
        id: "AjoGso",
      },
      { date: formatShortDate(intl, due) }
    );
  }
  return formatRelativeDate(intl, due, today);
}

/** "Today 14:00" */
export function formatReminder(intl: IntlShape, remindAt: string, today: string): string {
  return `${formatRelativeDate(intl, remindAt.slice(0, 10), today)} ${remindAt.slice(11, 16)}`;
}

export const DUE_TONE_CLASS: Record<DueTone, string> = {
  overdue: "text-danger",
  today: "text-(--due-today)",
  upcoming: "text-muted",
};
