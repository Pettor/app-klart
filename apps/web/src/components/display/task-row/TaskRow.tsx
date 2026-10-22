import type { CSSProperties, ReactElement } from "react";
import {
  ArrowTopRightOnSquareIcon,
  Bars3BottomLeftIcon,
  BellIcon,
  CheckIcon,
  EllipsisHorizontalIcon,
  StarIcon,
  SunIcon,
} from "@heroicons/react/20/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import { Button, Dropdown, Label, Link, ToggleButton } from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import { DUE_TONE_CLASS, formatDue, formatReminder, getDueTone } from "./TaskDateFormat";
import type { TaskRowReorder } from "./UseTaskReorder";
import { REORDER_ID_ATTRIBUTE } from "./UseTaskReorder";
import type { ContextColor } from "~/core/contexts/KlartContext";
import { formatTaskLink } from "~/core/tasks/TaskLink";

/** Display-ready task. Built by the route hook from a domain `Task`. */
export interface TaskRowTask {
  id: string;
  title: string;
  done: boolean;
  important: boolean;
  due: string | null;
  remindAt: string | null;
  /** Tags to show, without the context's own routing tag. */
  tags: string[];
  /** `http(s)://` links to the task's source; each opens in a new tab. */
  links: string[];
  /** Shows a "Note" marker in the meta line. */
  hasNotes?: boolean;
  contextName: string;
  contextColor: ContextColor;
}

export interface TaskRowProps {
  task: TaskRowTask;
  today: string;
  /** Shows the context name, used when "All contexts" is selected. */
  showContext?: boolean;
  isInMyDay?: boolean;
  onToggleDone: (taskId: string, done: boolean) => void;
  onToggleImportant: (taskId: string) => void;
  onAddToMyDay?: (taskId: string) => void;
  onRemoveFromMyDay?: (taskId: string) => void;
  onArchive?: (taskId: string) => void;
  /** Makes the title pressable, e.g. to open the task editor. */
  onOpen?: (taskId: string) => void;
  /** Highlights the row, e.g. while it's open in the editor. */
  isSelected?: boolean;
  /** Adds a grip to drag the row, from `useTaskReorder`. Ignored for completed tasks. */
  reorder?: TaskRowReorder;
}

/** Six dots. Heroicons has no grip icon. */
function GripIcon(): ReactElement {
  return (
    <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor" aria-hidden>
      <circle cx="2" cy="3" r="1.5" />
      <circle cx="8" cy="3" r="1.5" />
      <circle cx="2" cy="8" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="2" cy="13" r="1.5" />
      <circle cx="8" cy="13" r="1.5" />
    </svg>
  );
}

export function TaskRow({
  task,
  today,
  showContext = false,
  isInMyDay = false,
  onToggleDone,
  onToggleImportant,
  onAddToMyDay,
  onRemoveFromMyDay,
  onArchive,
  onOpen,
  isSelected = false,
  reorder: reorderProp,
}: TaskRowProps): ReactElement {
  const intl = useIntl();
  const hasMenu = !!onArchive || (isInMyDay && !!onRemoveFromMyDay);
  const reorder = task.done ? undefined : reorderProp;
  const hasMeta = showContext || !!task.due || !!task.remindAt || !!task.hasNotes;

  return (
    <div
      data-testid="task-row"
      {...{ [REORDER_ID_ATTRIBUTE]: task.id }}
      className={clsx(
        `ctx-${task.contextColor}`,
        "group flex items-center gap-1.5 pr-2.5",
        task.done ? "slab-done min-h-12 py-1.5 pl-[26px]" : "slab py-2.5",
        !task.done && (reorderProp ? "pl-1" : "pl-2"),
        reorder?.isLifted && "slab-lifted",
        reorder?.isSettled && "slab-settled",
        isSelected && "outline-2 outline-offset-2 outline-(color:--ctx)"
      )}
      style={reorder?.isLifted ? ({ "--slab-dy": `${reorder.offsetY}px` } as CSSProperties) : undefined}
    >
      {reorder?.dropIndicator && (
        <span
          aria-hidden
          className={clsx(
            "pointer-events-none absolute inset-x-2 h-[3px] rounded-sm bg-(--ctx) shadow-[0_0_10px_var(--ctx)]",
            reorder.dropIndicator === "before" ? "-top-2" : "-bottom-[9px]"
          )}
        />
      )}

      {reorder && (
        <span className="slab-reveal flex shrink-0 touch-none" {...reorder.gripProps}>
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            aria-label={intl.formatMessage(
              {
                description: "TaskRow - aria-label of the grip that drags a task to reorder My Day",
                defaultMessage: "Move {title}. Drag, or use the arrow up and down keys.",
                id: "KyPo/v",
              },
              { title: task.title }
            )}
            onKeyDown={reorder.onGripKeyDown}
            className="text-muted h-11 w-[22px] min-w-0 cursor-grab rounded-md active:cursor-grabbing sm:h-9"
            data-testid="task-row__grip"
          >
            <GripIcon />
          </Button>
        </span>
      )}

      <Button
        isIconOnly
        variant="ghost"
        aria-label={
          task.done
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
        data-testid="task-row__toggle"
        onPress={() => onToggleDone(task.id, !task.done)}
        className="slab-check size-10 shrink-0 rounded-full"
      >
        {task.done ? (
          <span className="grid size-5 place-items-center rounded-full bg-(--ctx)">
            <CheckIcon className="text-background size-3.5" />
          </span>
        ) : (
          <span
            className="slab-check-ring relative block size-[22px] rounded-full border-2 shadow-(--slab-check-inset)"
            // Inline: a global `* { border-color }` rule outside any layer beats Tailwind's border utilities.
            style={{ borderColor: "var(--ctx)" }}
          >
            <span className="slab-check-fill absolute inset-[3px] rounded-full bg-(--ctx) opacity-0 transition-opacity" />
          </span>
        )}
      </Button>

      <div className="relative flex min-w-0 flex-1 flex-col gap-1 py-1">
        {onOpen && (
          // An invisible button over the whole column, so the meta line opens the task too.
          // It must be the pressed element itself: React Aria drops a press released outside the button's box.
          <Button
            variant="ghost"
            aria-label={intl.formatMessage(
              {
                description: "TaskRow - aria-label of the task title, which opens the task editor",
                defaultMessage: "Edit task: {title}",
                id: "KEvGdJ",
              },
              { title: task.title }
            )}
            onPress={() => onOpen(task.id)}
            className="absolute inset-0 h-auto min-h-0 w-auto transform-none rounded-md p-0 data-[hovered=true]:bg-transparent data-[pressed=true]:bg-transparent"
            data-testid="task-row__open"
          />
        )}
        <span
          className={clsx(
            task.done ? "text-muted text-sm line-through" : "text-[15px] font-semibold tracking-[-0.005em]"
          )}
          data-testid="task-row__title"
        >
          {task.title}
        </span>
        {!task.done && hasMeta && (
          <span className="text-muted flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs">
            {showContext && (
              <span className="inline-flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-(--ctx)" aria-hidden />
                {task.contextName}
              </span>
            )}
            {task.due && (
              <span className={clsx("font-semibold", DUE_TONE_CLASS[getDueTone(task.due, today)])}>
                {formatDue(intl, task.due, today)}
              </span>
            )}
            {task.remindAt && (
              <span className="inline-flex items-center gap-1">
                <BellIcon className="size-3" aria-hidden />
                {formatReminder(intl, task.remindAt, today)}
              </span>
            )}
            {task.hasNotes && (
              <span className="inline-flex items-center gap-1">
                <Bars3BottomLeftIcon className="size-3" aria-hidden />
                {intl.formatMessage({
                  description: "TaskRow - marker shown when a task has a note",
                  defaultMessage: "Note",
                  id: "necy86",
                })}
              </span>
            )}
          </span>
        )}
        {!task.done && task.tags.length > 0 && (
          <span className="slab-tags flex flex-wrap gap-1.5" data-testid="task-row__tags">
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="h-[22px] rounded-full bg-(--tag)/14 px-[9px] text-xs leading-[22px] font-medium text-(--tag)"
              >
                #{tag}
              </span>
            ))}
          </span>
        )}
      </div>

      {!task.done &&
        task.links.map((link) => (
          <Link
            key={link}
            href={link}
            target="_blank"
            rel="noreferrer"
            aria-label={intl.formatMessage(
              {
                description: "TaskRow - aria-label for a link to the task's source, opened in a new tab",
                defaultMessage: "Open link to {host}",
                id: "ahIXxO",
              },
              { host: formatTaskLink(link) }
            )}
            data-testid="task-row__link"
            className="relative z-10 grid size-9 shrink-0 place-items-center rounded-[10px] bg-(--tag)/14 text-(--tag) no-underline transition hover:scale-106 hover:bg-(--tag)/28"
          >
            <ArrowTopRightOnSquareIcon className="size-4" aria-hidden />
          </Link>
        ))}

      {!task.done && onAddToMyDay && !isInMyDay && (
        <Button
          isIconOnly
          variant="ghost"
          size="sm"
          aria-label={intl.formatMessage({
            description: "TaskRow - aria-label for adding a task to My Day",
            defaultMessage: "Add to My Day",
            id: "86HuCS",
          })}
          onPress={() => onAddToMyDay(task.id)}
        >
          <SunIcon className="size-4" />
        </Button>
      )}

      {!task.done && (
        <ToggleButton
          isIconOnly
          variant="ghost"
          size="sm"
          isSelected={task.important}
          onChange={() => onToggleImportant(task.id)}
          aria-label={intl.formatMessage({
            description: "TaskRow - aria-label for the important toggle",
            defaultMessage: "Mark important",
            id: "es9TNB",
          })}
          data-testid="task-row__important"
          className={clsx(
            "size-9 data-[selected=true]:bg-transparent",
            task.important ? "text-(--star)" : "text-muted"
          )}
        >
          {task.important ? <StarIcon className="size-[18px]" /> : <StarOutlineIcon className="size-[18px]" />}
        </ToggleButton>
      )}

      {hasMenu && (
        <Dropdown>
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            className="slab-reveal text-muted"
            aria-label={intl.formatMessage({
              description: "TaskRow - aria-label for the task actions menu",
              defaultMessage: "Task actions",
              id: "CKmqfO",
            })}
          >
            <EllipsisHorizontalIcon className="size-4" />
          </Button>
          <Dropdown.Popover>
            <Dropdown.Menu
              onAction={(key) => {
                if (key === "remove") {
                  onRemoveFromMyDay?.(task.id);
                } else if (key === "archive") {
                  onArchive?.(task.id);
                }
              }}
            >
              {isInMyDay && onRemoveFromMyDay ? (
                <Dropdown.Item id="remove" textValue="remove">
                  <Label>
                    {intl.formatMessage({
                      description: "TaskRow - menu item removing a task from My Day",
                      defaultMessage: "Remove from My Day",
                      id: "XaqG4n",
                    })}
                  </Label>
                </Dropdown.Item>
              ) : null}
              {onArchive ? (
                <Dropdown.Item id="archive" textValue="archive" variant="danger">
                  <Label>
                    {intl.formatMessage({
                      description: "TaskRow - menu item archiving (deleting) a task",
                      defaultMessage: "Delete task",
                      id: "S01fgv",
                    })}
                  </Label>
                </Dropdown.Item>
              ) : null}
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      )}
    </div>
  );
}
