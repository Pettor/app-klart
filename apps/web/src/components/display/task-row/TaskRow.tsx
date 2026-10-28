import type { CSSProperties, ReactElement } from "react";
import {
  ArrowTopRightOnSquareIcon,
  Bars3BottomLeftIcon,
  BellIcon,
  EllipsisHorizontalIcon,
  StarIcon,
  SunIcon,
} from "@heroicons/react/20/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import { Button, Dropdown, Label, Link, ToggleButton } from "@heroui/react";
import { useBreakpoint } from "@package/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import type { DueTone } from "./TaskDateFormat";
import { DUE_TONE_CLASS, formatDue, formatReminder, getDueTone } from "./TaskDateFormat";
import { TaskLinksButton } from "./TaskLinksButton";
import { TaskCheck, TaskRowLeanMeta } from "./TaskRowParts";
import { useStarPop } from "./UseStarPop";
import { useTaskCompletion } from "./UseTaskCompletion";
import type { TaskRowReorder } from "./UseTaskReorder";
import { REORDER_HANDLE_ATTRIBUTE, REORDER_ID_ATTRIBUTE } from "./UseTaskReorder";
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
  /** Plays the arrival animation as the row mounts, e.g. just added from Suggestions. */
  isArriving?: boolean;
  /** Shows the due date and reminder under the title. */
  showMeta?: boolean;
  /** Shows a marker when the task has a note. */
  showNotes?: boolean;
  /** Shows a button per link that opens it in a new tab. */
  showLinks?: boolean;
  /**
   * Makes the row draggable, from `useTaskReorder`: press and drag it with a mouse, or by its grip on touch
   * screens. Ignored for completed tasks.
   */
  reorder?: TaskRowReorder;
}

/** Under the Dark (HeroUI) theme, the context, due date and reminder under a title are pills. */
const META_CHIP = "inline-flex items-center hero:h-[22px] hero:rounded-full hero:px-2";

const DUE_CHIP_CLASS: Record<DueTone, string> = {
  overdue: "hero:bg-[#f31260]/16",
  today: "hero:bg-accent/16",
  upcoming: "hero:bg-surface-tertiary hero:text-foreground/85",
};

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
  isArriving = false,
  showMeta = true,
  showNotes = true,
  showLinks = true,
  reorder: reorderProp,
}: TaskRowProps): ReactElement {
  const intl = useIntl();
  const hasMenu = !!onArchive || (isInMyDay && !!onRemoveFromMyDay);
  const reorder = task.done ? undefined : reorderProp;
  const completion = useTaskCompletion(task.id, task.done, onToggleDone);
  const star = useStarPop(task.id, task.important, onToggleImportant);
  // Phones get the lean row: the title takes the width, and links, star and actions move to the details sheet.
  const isLean = !useBreakpoint("sm");
  const hasNoteMarker = showNotes && !!task.hasNotes;
  const hasMeta = isLean
    ? showContext ||
      (showLinks && task.links.length > 0) ||
      hasNoteMarker ||
      (showMeta && (!!task.due || !!task.remindAt))
    : hasNoteMarker || (showMeta && (showContext || !!task.due || !!task.remindAt));

  return (
    // Collapses to nothing while a completed card sinks away, so the list closes the gap.
    <div
      className={clsx(
        "slab-leave",
        completion.phase === "leaving" && "slab-leaving",
        isArriving && !task.done && "slab-arriving"
      )}
    >
      <div className="slab-leave-in">
        <div
          data-testid="task-row"
          {...{ [REORDER_ID_ATTRIBUTE]: task.id }}
          {...reorder?.rowProps}
          className={clsx(
            `ctx-${task.contextColor}`,
            "group flex flex-col pr-2.5",
            task.done
              ? "slab-done compact:min-h-10 compact:py-0.5 min-h-12 justify-center py-1.5 pl-[26px]"
              : "slab compact:py-1 py-2.5",
            // On phones the grip hugs the card's edge.
            !task.done && (isLean && reorder ? "pl-1" : "pl-2"),
            isLean && "slab-lean select-none [-webkit-touch-callout:none]",
            reorder && "slab-draggable select-none",
            reorder?.isLifted && "slab-lifted",
            reorder?.isSettled && "slab-settled",
            completion.isChecking && "slab-checking",
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

          {/* The checkbox, title, link and star sit on one line that never moves; tags open up below it. */}
          <div className="flex items-center gap-1.5">
            {reorder && (
              <span
                className={clsx("slab-grip shrink-0 touch-none", isLean ? "-mr-2" : "-mr-1.5")}
                {...reorder.gripProps}
              >
                <Button
                  isIconOnly
                  variant="ghost"
                  size="sm"
                  aria-label={intl.formatMessage(
                    {
                      description: "TaskRow - aria-label of the grip that drags a task to reorder My Day",
                      defaultMessage: "Move {title}. Hold and drag, or use the arrow up and down keys.",
                      id: "pOpSzP",
                    },
                    { title: task.title }
                  )}
                  onKeyDown={reorder.onGripKeyDown}
                  className={clsx("text-muted h-11 min-w-0 rounded-md", isLean ? "w-5" : "w-7")}
                  data-testid="task-row__grip"
                >
                  <GripIcon />
                </Button>
              </span>
            )}

            <TaskCheck
              done={task.done}
              isChecking={completion.isChecking}
              onPress={completion.toggle}
              testId="task-row__toggle"
              className={clsx(isLean && "w-9")}
            />

            <div className="relative flex min-w-0 flex-1 flex-col gap-1 py-1">
              {onOpen && (
                // An invisible button over the whole column, so the meta line opens the task too.
                // It must be the pressed element itself: React Aria drops a press released outside the button's box.
                <Button
                  variant="ghost"
                  aria-label={
                    reorder
                      ? intl.formatMessage(
                          {
                            description:
                              "TaskRow - aria-label of the task title, which opens the task editor, in a reorderable list",
                            defaultMessage: "Edit task: {title}. Drag, or press Alt and arrow up or down, to reorder.",
                            id: "RsrGjL",
                          },
                          { title: task.title }
                        )
                      : intl.formatMessage(
                          {
                            description: "TaskRow - aria-label of the task title, which opens the task editor",
                            defaultMessage: "Edit task: {title}",
                            id: "KEvGdJ",
                          },
                          { title: task.title }
                        )
                  }
                  onPress={() => !reorder?.isDropping() && onOpen(task.id)}
                  onKeyDown={reorder?.onRowKeyDown}
                  {...{ [REORDER_HANDLE_ATTRIBUTE]: "" }}
                  // Clears the ghost button's hover and press fills, which would cover the title it sits over.
                  className="absolute inset-0 h-auto min-h-0 w-auto transform-none rounded-md p-0 [--button-bg-hover:transparent] [--button-bg-pressed:transparent]"
                  data-testid="task-row__open"
                />
              )}
              <span
                // Phones keep each title to one line; the full title is in the tooltip and the details sheet.
                title={task.title}
                className={clsx(
                  task.done && "text-muted text-sm line-through",
                  !task.done && (isLean ? "font-medium" : "font-semibold tracking-[-0.005em]"),
                  !task.done && "text-[15px]",
                  isLean && "truncate"
                )}
                data-testid="task-row__title"
              >
                {/* Inline, so the strike drawn while completing follows every line of a wrapped title. */}
                <span className={clsx(!task.done && "slab-title")}>{task.title}</span>
              </span>
              {!task.done && hasMeta && isLean && (
                <TaskRowLeanMeta
                  task={task}
                  today={today}
                  showContext={showContext}
                  showDates={showMeta}
                  showLinks={showLinks}
                  showNotes={showNotes}
                />
              )}
              {!task.done && hasMeta && !isLean && (
                <span className="text-muted hero:gap-x-1.5 hero:gap-y-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs">
                  {showMeta && showContext && (
                    <span className={clsx(META_CHIP, "hero:bg-(--ctx)/16 hero:text-(--ctx) gap-1.5")}>
                      <span className="size-1.5 rounded-full bg-(--ctx)" aria-hidden />
                      {task.contextName}
                    </span>
                  )}
                  {showMeta && task.due && (
                    <span
                      className={clsx(
                        META_CHIP,
                        "hero:font-medium font-semibold",
                        DUE_TONE_CLASS[getDueTone(task.due, today)],
                        DUE_CHIP_CLASS[getDueTone(task.due, today)]
                      )}
                    >
                      {formatDue(intl, task.due, today)}
                    </span>
                  )}
                  {showMeta && task.remindAt && (
                    <span className={clsx(META_CHIP, "hero:bg-surface-tertiary hero:text-foreground/85 gap-1")}>
                      <BellIcon className="size-3" aria-hidden />
                      {formatReminder(intl, task.remindAt, today)}
                    </span>
                  )}
                  {hasNoteMarker && (
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
            </div>

            {!task.done && isLean && task.important && (
              // Phones can't star from the row, but a starred task shows it at the end.
              <span
                role="img"
                aria-label={intl.formatMessage({
                  description: "TaskRow - accessible name of the important marker in a phone task row",
                  defaultMessage: "Important",
                  id: "3/a3Ys",
                })}
                className="flex shrink-0 pl-1"
                data-testid="task-row__important-marker"
              >
                <StarIcon className="size-4 text-(--star)" aria-hidden />
              </span>
            )}

            {!task.done && !isLean && showLinks && task.links.length > 1 && (
              // Several links share one button, leaving the title room.
              <TaskLinksButton links={task.links} title={task.title} variant="popover" />
            )}

            {!task.done &&
              !isLean &&
              showLinks &&
              task.links.length === 1 &&
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

            {!task.done && !isLean && onAddToMyDay && !isInMyDay && (
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

            {!task.done && !isLean && (
              <ToggleButton
                isIconOnly
                variant="ghost"
                size="sm"
                isSelected={task.important}
                onChange={star.toggle}
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
                {task.important ? (
                  <StarIcon key={star.pops} className={clsx("size-[18px]", star.pops > 0 && "slab-pop")} />
                ) : (
                  <StarOutlineIcon className="size-[18px]" />
                )}
              </ToggleButton>
            )}

            {hasMenu && !isLean && (
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
          {!task.done && task.tags.length > 0 && (
            <span className="slab-tags flex flex-wrap gap-1.5 pl-[46px]" data-testid="task-row__tags">
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
      </div>
    </div>
  );
}
