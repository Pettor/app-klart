import type { ReactElement } from "react";
import { BellIcon, CheckIcon, EllipsisHorizontalIcon, LinkIcon, StarIcon, SunIcon } from "@heroicons/react/20/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import { Button, Dropdown, Label, Link, ToggleButton } from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import { DUE_TONE_CLASS, formatDue, formatReminder, getDueTone } from "./TaskDateFormat";
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
}: TaskRowProps): ReactElement {
  const intl = useIntl();
  const hasMenu = !!onArchive || (isInMyDay && !!onRemoveFromMyDay);

  return (
    <div
      data-testid="task-row"
      className={clsx(
        `ctx-${task.contextColor}`,
        "group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors sm:gap-3 sm:px-3",
        task.done ? "bg-surface-secondary/80 min-h-12" : "bg-surface-secondary hover:bg-surface-tertiary min-h-13"
      )}
    >
      <Button
        isIconOnly
        variant="ghost"
        size="sm"
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
        className="shrink-0 rounded-full"
      >
        {task.done ? (
          <span className="grid size-5 place-items-center rounded-full bg-(--ctx)">
            <CheckIcon className="text-background size-3.5" />
          </span>
        ) : (
          <span className="block size-[18px] rounded-full border-2" style={{ borderColor: "var(--ctx)" }} />
        )}
      </Button>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={clsx("text-sm", task.done && "text-muted line-through")}>{task.title}</span>
        {!task.done && (
          <span className="text-muted flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs">
            {showContext && (
              <span className="inline-flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-(--ctx)" aria-hidden />
                {task.contextName}
              </span>
            )}
            {task.due && (
              <span className={DUE_TONE_CLASS[getDueTone(task.due, today)]}>{formatDue(intl, task.due, today)}</span>
            )}
            {task.remindAt && (
              <span className="text-foreground/80 inline-flex items-center gap-1">
                <BellIcon className="size-3" aria-hidden />
                {formatReminder(intl, task.remindAt, today)}
              </span>
            )}
            {task.tags.map((tag) => (
              <span key={tag} className="text-(--tag)">
                #{tag}
              </span>
            ))}
            {task.links.map((link) => (
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
                className="text-accent inline-flex max-w-48 items-center gap-1 text-xs no-underline hover:underline"
              >
                <LinkIcon className="size-3 shrink-0" aria-hidden />
                <span className="truncate">{formatTaskLink(link)}</span>
              </Link>
            ))}
          </span>
        )}
      </div>

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
          className={clsx("data-[selected=true]:bg-transparent", task.important ? "text-(--star)" : "text-muted")}
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
            className="text-muted"
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
