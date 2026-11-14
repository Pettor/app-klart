import type { IntlShape } from "react-intl";
import { addDays, parseLocalDate } from "./LocalDate";
import type { TaskRepeat } from "./TaskRepeat";
import { WEEKDAY_ORDER, weekdaysOf } from "./TaskRepeat";

/** A Sunday, so `addDays(SUNDAY, n)` falls on weekday `n`. */
const SUNDAY = "2024-01-07";

/** "Mon", "Tue" … in the user's language. */
export function formatWeekday(intl: IntlShape, weekday: number, style: "short" | "narrow" = "short"): string {
  return intl.formatDate(parseLocalDate(addDays(SUNDAY, weekday)), { weekday: style });
}

/** "Every week" (short) or "Every 2 weeks on Mon and Thu" (long). */
export function formatRepeat(intl: IntlShape, repeat: TaskRepeat, length: "short" | "long" = "long"): string {
  const weekdays = weekdaysOf(repeat);
  if (repeat.unit === "week" && repeat.every === 1 && weekdays.join(",") === "1,2,3,4,5") {
    return intl.formatMessage({
      description: "FormatRepeat - a task repeating Monday to Friday",
      defaultMessage: "Every weekday",
      id: "HKgTy3",
    });
  }

  switch (repeat.unit) {
    case "day":
      return intl.formatMessage(
        {
          description: "FormatRepeat - a task repeating every day or every few days",
          defaultMessage: "{every, plural, one {Every day} other {Every # days}}",
          id: "cWEuko",
        },
        { every: repeat.every }
      );
    case "week": {
      const every = intl.formatMessage(
        {
          description: "FormatRepeat - a task repeating every week or every few weeks",
          defaultMessage: "{every, plural, one {Every week} other {Every # weeks}}",
          id: "JhvXdp",
        },
        { every: repeat.every }
      );
      if (length === "short") {
        return every;
      }
      const days = WEEKDAY_ORDER.filter((day) => weekdays.includes(day)).map((day) => formatWeekday(intl, day));
      return intl.formatMessage(
        {
          description: "FormatRepeat - a weekly rule with its weekdays, e.g. 'Every week on Mon and Thu'",
          defaultMessage: "{every} on {days}",
          id: "9UoJaT",
        },
        { every, days: intl.formatList(days, { type: "conjunction" }) }
      );
    }
    case "month": {
      const every = intl.formatMessage(
        {
          description: "FormatRepeat - a task repeating every month or every few months",
          defaultMessage: "{every, plural, one {Every month} other {Every # months}}",
          id: "gJcWAc",
        },
        { every: repeat.every }
      );
      if (length === "short") {
        return every;
      }
      return intl.formatMessage(
        {
          description: "FormatRepeat - a monthly rule with its day of the month, e.g. 'Every month on day 15'",
          defaultMessage: "{every} on day {day}",
          id: "oNnvxe",
        },
        { every, day: parseLocalDate(repeat.from).getDate() }
      );
    }
    case "year": {
      const every = intl.formatMessage(
        {
          description: "FormatRepeat - a task repeating every year or every few years",
          defaultMessage: "{every, plural, one {Every year} other {Every # years}}",
          id: "VJSDVK",
        },
        { every: repeat.every }
      );
      if (length === "short") {
        return every;
      }
      return intl.formatMessage(
        {
          description: "FormatRepeat - a yearly rule with its date, e.g. 'Every year on 14 Nov'",
          defaultMessage: "{every} on {date}",
          id: "Da0tyO",
        },
        { every, date: intl.formatDate(parseLocalDate(repeat.from), { day: "numeric", month: "short" }) }
      );
    }
  }
}
