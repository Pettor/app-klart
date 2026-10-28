import type { ReactElement } from "react";
import {
  ArrowTopRightOnSquareIcon,
  Bars3BottomLeftIcon,
  BellIcon,
  CheckIcon,
  LinkIcon,
  ShoppingCartIcon,
} from "@heroicons/react/20/solid";
import { Button, Link } from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import { DUE_TONE_CLASS, formatDue, formatReminder, getDueTone } from "./TaskDateFormat";
import type { TaskRowTask } from "./TaskRow";
import { formatTaskLink } from "~/core/tasks/TaskLink";

export interface TaskCheckProps {
  done: boolean;
  /** Fills the box and draws the check while completion animates. */
  isChecking: boolean;
  onPress: () => void;
  className?: string;
  testId?: string;
}

/** The completion checkbox of a task row or sheet. Its shape and colors follow the theme (see `main.css`). */
export function TaskCheck({ done, isChecking, onPress, className, testId }: TaskCheckProps): ReactElement {
  const intl = useIntl();

  return (
    <Button
      isIconOnly
      variant="ghost"
      aria-label={
        done
          ? intl.formatMessage({
              description: "TaskRow - aria-label for marking a completed task as not completed",
              defaultMessage: "Mark not completed",
              id: "lq+lgm",
            })
          : intl.formatMessage({
              description: "TaskRow - aria-label for completing a task",
              defaultMessage: "Complete task",
              id: "GcMmcK",
            })
      }
      data-testid={testId}
      onPress={onPress}
      className={clsx("slab-check size-10 shrink-0 rounded-full", className)}
    >
      {done ? (
        <span className="slab-check-done grid size-5 place-items-center rounded-full bg-(--ctx)">
          <CheckIcon className="text-background size-3.5" />
        </span>
      ) : (
        <span
          className={clsx(
            "slab-check-ring relative grid size-[22px] place-items-center rounded-full border-2 shadow-(--slab-check-inset)",
            isChecking && "slab-check-on"
          )}
        >
          {isChecking ? (
            <CheckIcon className="slab-check-mark text-background size-3.5" />
          ) : (
            <span className="slab-check-fill absolute inset-[3px] rounded-full bg-(--ctx) opacity-0 transition-opacity" />
          )}
        </span>
      )}
    </Button>
  );
}

/** The link without its scheme, e.g. `github.com/acme/repo/pull/412`. */
function formatLinkPath(link: string): string {
  return link.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

export interface TaskLinkItemProps {
  link: string;
  className?: string;
}

/** One of a task's links in a list: the site's initial, its name and address, opening in a new tab. */
export function TaskLinkItem({ link, className }: TaskLinkItemProps): ReactElement {
  const host = formatTaskLink(link);
  return (
    <Link
      href={link}
      target="_blank"
      rel="noreferrer"
      data-testid="task-links__link"
      className={clsx(
        "text-foreground hover:bg-surface-secondary flex min-h-14 w-full items-center gap-3 px-3 py-1.5 no-underline",
        className
      )}
    >
      <span
        aria-hidden
        className="grid size-[34px] shrink-0 place-items-center rounded-[10px] bg-(--tag)/16 text-sm font-bold text-(--tag)"
      >
        {host.charAt(0).toUpperCase()}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-medium">{host}</span>
        <span className="text-muted truncate text-xs">{formatLinkPath(link)}</span>
      </span>
      <ArrowTopRightOnSquareIcon className="text-muted size-4 shrink-0" aria-hidden />
    </Link>
  );
}

export interface TaskRowLeanMetaProps {
  task: TaskRowTask;
  today: string;
  showContext: boolean;
  /** The due date and reminder, from the "Dates & reminders" display option. */
  showDates: boolean;
  /** The link count, from the "Link buttons" display option. */
  showLinks: boolean;
  /** The note marker, from the "Note marker" display option. */
  showNotes: boolean;
}

/**
 * The phone row's single grey line under the title: context, due date (red when overdue), reminder,
 * a link count and a note marker. It never wraps.
 */
export function TaskRowLeanMeta({
  task,
  today,
  showContext,
  showDates,
  showLinks,
  showNotes,
}: TaskRowLeanMetaProps): ReactElement {
  const intl = useIntl();

  return (
    <span
      className="text-muted flex items-center gap-2.5 overflow-hidden text-[12.5px] whitespace-nowrap"
      data-testid="task-row__meta"
    >
      {task.shopping && (
        <span className={clsx(`ctx-${task.shopping.color}`, "inline-flex items-center gap-1")}>
          <ShoppingCartIcon className="size-3 text-(--ctx)" aria-hidden />
          {task.shopping.listName}
        </span>
      )}
      {showContext && (
        <span className="inline-flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-(--ctx)" aria-hidden />
          {task.contextName}
        </span>
      )}
      {showDates && task.due && (
        <span className={clsx("font-medium", DUE_TONE_CLASS[getDueTone(task.due, today)])}>
          {formatDue(intl, task.due, today)}
        </span>
      )}
      {showDates && task.remindAt && (
        <span className="inline-flex items-center gap-1">
          <BellIcon className="size-3" aria-hidden />
          {formatReminder(intl, task.remindAt, today)}
        </span>
      )}
      {showLinks && task.links.length > 0 && (
        <span
          className="inline-flex items-center gap-1"
          role="img"
          aria-label={intl.formatMessage(
            {
              description: "TaskRow - accessible text of the link count in a phone task row",
              defaultMessage: "{count, plural, one {# link} other {# links}}",
              id: "ahZI9p",
            },
            { count: task.links.length }
          )}
        >
          <LinkIcon className="size-3" aria-hidden />
          <span aria-hidden>{task.links.length}</span>
        </span>
      )}
      {showNotes && task.hasNotes && (
        <span
          role="img"
          aria-label={intl.formatMessage({
            description: "TaskRow - accessible name of the note marker in a phone task row",
            defaultMessage: "Has note",
            id: "iwJVq3",
          })}
          className="flex shrink-0"
        >
          <Bars3BottomLeftIcon className="size-[13px]" aria-hidden />
        </span>
      )}
    </span>
  );
}
