import { useState } from "react";
import type { RepeatUnit, TaskRepeat } from "~/core/tasks/TaskRepeat";
import { createRepeat, occurrenceOnOrAfter, weekdaysOf } from "~/core/tasks/TaskRepeat";

export type RepeatPreset = "none" | "day" | "weekdays" | "week" | "month" | "year" | "custom";

export interface TaskRepeatPatch {
  repeat: TaskRepeat | null;
  /** Set when a task without a due date starts repeating: its first occurrence. */
  due?: string;
}

export interface TaskRepeatFieldState {
  preset: RepeatPreset;
  /** Shows the interval, unit and weekday controls. */
  showDetails: boolean;
  selectPreset: (preset: RepeatPreset) => void;
  setEvery: (every: number) => void;
  setUnit: (unit: RepeatUnit) => void;
  toggleWeekday: (weekday: number) => void;
}

const WORKDAYS = [1, 2, 3, 4, 5];

/** The preset a rule matches, or `custom` for anything else (every 2 weeks, Mon and Thu, …). */
export function getRepeatPreset(repeat: TaskRepeat | null): RepeatPreset {
  if (!repeat) {
    return "none";
  }
  if (repeat.every !== 1) {
    return "custom";
  }
  if (repeat.unit === "week") {
    const weekdays = weekdaysOf(repeat);
    if (weekdays.join(",") === WORKDAYS.join(",")) {
      return "weekdays";
    }
    return weekdays.length === 1 && weekdays[0] === createRepeat("week", repeat.from).weekdays[0] ? "week" : "custom";
  }
  return repeat.unit;
}

/** Builds the rule for a preset, counted from the due date, or from today when the task has none. */
function presetRepeat(preset: Exclude<RepeatPreset, "none">, from: string, current: TaskRepeat | null): TaskRepeat {
  switch (preset) {
    case "weekdays":
      return { every: 1, unit: "week", weekdays: WORKDAYS, from };
    case "custom":
      return current ?? createRepeat("week", from);
    default:
      return createRepeat(preset, from);
  }
}

/** State of the editor's Repeat field. Every change saves at once, like the date pickers. */
export function useTaskRepeatField(
  repeat: TaskRepeat | null,
  due: string | null,
  today: string,
  onChange: (patch: TaskRepeatPatch) => void
): TaskRepeatFieldState {
  const [isCustom, setIsCustom] = useState(false);
  const derived = getRepeatPreset(repeat);
  const preset = isCustom && repeat ? "custom" : derived;

  function save(next: TaskRepeat): void {
    if (due) {
      onChange({ repeat: next });
      return;
    }
    // A recurring task is always due: on the rule's first date from today.
    const first = occurrenceOnOrAfter({ ...next, from: today }, today);
    onChange({ repeat: { ...next, from: first }, due: first });
  }

  return {
    preset,
    showDetails: preset === "custom",
    selectPreset: (next) => {
      setIsCustom(next === "custom");
      if (next === "none") {
        onChange({ repeat: null });
      } else if (next !== derived || !repeat) {
        save(presetRepeat(next, due ?? today, repeat));
      }
    },
    setEvery: (every) => {
      if (repeat && Number.isFinite(every)) {
        onChange({ repeat: { ...repeat, every: Math.min(999, Math.max(1, Math.round(every))) } });
      }
    },
    setUnit: (unit) => {
      if (repeat && unit !== repeat.unit) {
        onChange({ repeat: createRepeat(unit, repeat.from, repeat.every) });
      }
    },
    toggleWeekday: (weekday) => {
      if (!repeat) {
        return;
      }
      const current = weekdaysOf(repeat);
      const weekdays = current.includes(weekday) ? current.filter((day) => day !== weekday) : [...current, weekday];
      // At least one weekday stays on.
      if (weekdays.length > 0) {
        onChange({ repeat: { ...repeat, weekdays: weekdays.sort() } });
      }
    },
  };
}
