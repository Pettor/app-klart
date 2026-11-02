import type { IntlShape } from "react-intl";
import { DUE_TONE_CLASS, formatShortDate } from "~/components/display/task-row/TaskDateFormat";
import type { SuggestionWhy } from "~/core/tasks/Suggestions";

const DAYS_PER_MONTH = 30;

/** Long overdue reads better in months. */
const MONTHS_FROM_DAYS = 60;

export function getWhyText(intl: IntlShape, why: SuggestionWhy): string {
  switch (why.type) {
    case "overdue":
      return intl.formatMessage(
        {
          description: "SuggestionList - why an overdue task is suggested",
          defaultMessage: "{days, plural, one {Overdue since yesterday} other {Overdue # days}}",
          id: "CTbw/K",
        },
        { days: why.days }
      );
    case "stale":
      return why.days >= MONTHS_FROM_DAYS
        ? intl.formatMessage(
            {
              description: "SuggestionList - why a task overdue for months is suggested, asking if it still matters",
              defaultMessage: "Overdue {months} months, still relevant?",
              id: "tgitAl",
            },
            { months: Math.round(why.days / DAYS_PER_MONTH) }
          )
        : intl.formatMessage(
            {
              description: "SuggestionList - why a task overdue for weeks is suggested, asking if it still matters",
              defaultMessage: "Overdue {days} days, still relevant?",
              id: "r2uJE7",
            },
            { days: why.days }
          );
    case "due_today":
      return intl.formatMessage({
        description: "SuggestionList - why a task is suggested",
        defaultMessage: "Due today",
        id: "8GxipC",
      });
    case "left_from_yesterday":
      return intl.formatMessage({
        description: "SuggestionList - why a task left from yesterday is suggested",
        defaultMessage: "Left from yesterday",
        id: "FbVwMT",
      });
    case "due_in":
      return intl.formatMessage(
        {
          description: "SuggestionList - why a task due soon is suggested",
          defaultMessage: "{days, plural, one {Due tomorrow} other {Due in # days}}",
          id: "a1gOBa",
        },
        { days: why.days }
      );
    case "due_on":
      return intl.formatMessage(
        {
          description: "SuggestionList - due date of a suggested task",
          defaultMessage: "Due {date}",
          id: "ynnWTA",
        },
        { date: formatShortDate(intl, why.date) }
      );
    case "goes_with_today":
      return intl.formatMessage(
        {
          description: "SuggestionList - why a task sharing a tag with today's tasks is suggested",
          defaultMessage: "Goes with today: #{tag}",
          id: "S6bnTh",
        },
        { tag: why.tag }
      );
    case "no_date":
      return intl.formatMessage({
        description: "SuggestionList - shown for a suggested task without a due date",
        defaultMessage: "No date",
        id: "NNNL4l",
      });
  }
}

export const WHY_TONE_CLASS: Record<SuggestionWhy["type"], string> = {
  overdue: DUE_TONE_CLASS.overdue,
  stale: "text-warning",
  due_today: DUE_TONE_CLASS.today,
  left_from_yesterday: "text-violet-600 dark:text-violet-400",
  due_in: DUE_TONE_CLASS.today,
  due_on: "text-muted",
  goes_with_today: DUE_TONE_CLASS.today,
  no_date: "text-muted",
};
