import type { ReactElement } from "react";
import { ArrowPathIcon } from "@heroicons/react/20/solid";
import { Label, ListBox, NumberField, Select, ToggleButton } from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import type { RepeatPreset, TaskRepeatPatch } from "./UseTaskRepeatField";
import { useTaskRepeatField } from "./UseTaskRepeatField";
import { formatRepeat, formatWeekday } from "~/core/tasks/FormatRepeat";
import type { RepeatUnit, TaskRepeat } from "~/core/tasks/TaskRepeat";
import { WEEKDAY_ORDER, weekdaysOf } from "~/core/tasks/TaskRepeat";

export interface TaskRepeatFieldProps {
  repeat: TaskRepeat | null;
  /** Local date `YYYY-MM-DD`; the schedule counts from it. */
  due: string | null;
  /** Today's local date, where a task without a due date starts repeating. */
  today: string;
  onChange: (patch: TaskRepeatPatch) => void;
  className?: string;
}

const FIELD_LABEL_CLASS = "text-muted text-xs font-normal";

/** Picks how often a task repeats: a preset, or every N days, weeks, months or years, on chosen weekdays. */
export function TaskRepeatField({ repeat, due, today, onChange, className }: TaskRepeatFieldProps): ReactElement {
  const intl = useIntl();
  const field = useTaskRepeatField(repeat, due, today, onChange);

  const presets: { id: RepeatPreset; label: string }[] = [
    {
      id: "none",
      label: intl.formatMessage({
        description: "TaskRepeatField - option for a task that doesn't repeat",
        defaultMessage: "Doesn't repeat",
        id: "4K8lAv",
      }),
    },
    {
      id: "day",
      label: intl.formatMessage({
        description: "TaskRepeatField - option repeating every day",
        defaultMessage: "Daily",
        id: "wa/0Re",
      }),
    },
    {
      id: "weekdays",
      label: intl.formatMessage({
        description: "TaskRepeatField - option repeating Monday to Friday",
        defaultMessage: "Weekdays",
        id: "SmmZ92",
      }),
    },
    {
      id: "week",
      label: intl.formatMessage({
        description: "TaskRepeatField - option repeating every week",
        defaultMessage: "Weekly",
        id: "LghxPa",
      }),
    },
    {
      id: "month",
      label: intl.formatMessage({
        description: "TaskRepeatField - option repeating every month",
        defaultMessage: "Monthly",
        id: "OPaT29",
      }),
    },
    {
      id: "year",
      label: intl.formatMessage({
        description: "TaskRepeatField - option repeating every year",
        defaultMessage: "Yearly",
        id: "dBcJmi",
      }),
    },
    {
      id: "custom",
      label: intl.formatMessage({
        description: "TaskRepeatField - option for a custom schedule, e.g. every 2 weeks on Mon and Thu",
        defaultMessage: "Custom…",
        id: "5C3Bcw",
      }),
    },
  ];

  const units: { id: RepeatUnit; label: string }[] = [
    {
      id: "day",
      label: intl.formatMessage(
        {
          description: "TaskRepeatField - unit of a custom schedule",
          defaultMessage: "{every, plural, one {day} other {days}}",
          id: "pKYjac",
        },
        { every: repeat?.every ?? 1 }
      ),
    },
    {
      id: "week",
      label: intl.formatMessage(
        {
          description: "TaskRepeatField - unit of a custom schedule",
          defaultMessage: "{every, plural, one {week} other {weeks}}",
          id: "7TKCw1",
        },
        { every: repeat?.every ?? 1 }
      ),
    },
    {
      id: "month",
      label: intl.formatMessage(
        {
          description: "TaskRepeatField - unit of a custom schedule",
          defaultMessage: "{every, plural, one {month} other {months}}",
          id: "nJobVq",
        },
        { every: repeat?.every ?? 1 }
      ),
    },
    {
      id: "year",
      label: intl.formatMessage(
        {
          description: "TaskRepeatField - unit of a custom schedule",
          defaultMessage: "{every, plural, one {year} other {years}}",
          id: "II/8nX",
        },
        { every: repeat?.every ?? 1 }
      ),
    },
  ];

  const everyLabel = intl.formatMessage({
    description: "TaskRepeatField - label of the interval of a custom schedule, as in 'Every 2 weeks'",
    defaultMessage: "Every",
    id: "dpq7Do",
  });

  return (
    <div className={clsx("flex flex-col gap-2", className)} data-testid="task-repeat">
      <Select
        value={field.preset}
        onChange={(key) => key && field.selectPreset(String(key) as RepeatPreset)}
        className="flex min-w-0 flex-col gap-1"
        data-testid="task-repeat__preset"
      >
        <Label className={FIELD_LABEL_CLASS}>
          {intl.formatMessage({
            description: "TaskRepeatField - label of the repeat picker",
            defaultMessage: "Repeat",
            id: "bk7aJQ",
          })}
        </Label>
        <Select.Trigger className="gap-2">
          <ArrowPathIcon className={clsx("size-4 shrink-0", repeat ? "text-(--ctx)" : "text-muted")} aria-hidden />
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {presets.map((preset) => (
              <ListBox.Item key={preset.id} id={preset.id} textValue={preset.label}>
                {preset.label}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>

      {repeat && field.showDetails && (
        <div className="bg-surface-secondary flex flex-col gap-2.5 rounded-xl p-3" data-testid="task-repeat__custom">
          <div className="flex items-end gap-2">
            <NumberField
              value={repeat.every}
              minValue={1}
              maxValue={999}
              onChange={field.setEvery}
              aria-label={everyLabel}
              className="flex w-28 flex-col gap-1"
            >
              <Label className={FIELD_LABEL_CLASS}>{everyLabel}</Label>
              <NumberField.Group>
                <NumberField.DecrementButton />
                <NumberField.Input data-testid="task-repeat__every" />
                <NumberField.IncrementButton />
              </NumberField.Group>
            </NumberField>
            <Select
              value={repeat.unit}
              onChange={(key) => key && field.setUnit(String(key) as RepeatUnit)}
              aria-label={intl.formatMessage({
                description: "TaskRepeatField - aria-label of the unit picker of a custom schedule",
                defaultMessage: "Repeat unit",
                id: "onPfGM",
              })}
              className="min-w-0 flex-1"
              data-testid="task-repeat__unit"
            >
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {units.map((unit) => (
                    <ListBox.Item key={unit.id} id={unit.id} textValue={unit.label}>
                      {unit.label}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>

          {repeat.unit === "week" && (
            // A plain row, not a ToggleButtonGroup: several days can be on, and the group joins its buttons.
            <div
              role="group"
              aria-label={intl.formatMessage({
                description: "TaskRepeatField - aria-label of the weekday choice of a weekly schedule",
                defaultMessage: "On these days",
                id: "M0Fg26",
              })}
              className="grid grid-cols-7 gap-1"
            >
              {WEEKDAY_ORDER.map((weekday) => (
                <ToggleButton
                  key={weekday}
                  variant="ghost"
                  size="sm"
                  isSelected={weekdaysOf(repeat).includes(weekday)}
                  onChange={() => field.toggleWeekday(weekday)}
                  aria-label={formatWeekday(intl, weekday, "short")}
                  className={clsx(
                    "h-8 w-full min-w-0 rounded-lg border px-0 text-[13px]",
                    // Marked important: the ghost variant's own selected style is more specific.
                    weekdaysOf(repeat).includes(weekday)
                      ? "border-(--ctx)! bg-(--ctx)/15! font-semibold text-(--ctx)!"
                      : "border-separator text-muted"
                  )}
                  data-testid={`task-repeat__weekday-${weekday}`}
                >
                  {formatWeekday(intl, weekday, "narrow")}
                </ToggleButton>
              ))}
            </div>
          )}
        </div>
      )}

      {repeat && (
        <span className="text-muted pl-1 text-xs" data-testid="task-repeat__summary">
          {formatRepeat(intl, repeat)}
        </span>
      )}
    </div>
  );
}
