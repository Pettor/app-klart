import { useState, type ReactElement } from "react";
import { BellIcon, StarIcon } from "@heroicons/react/20/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import { Button, Drawer, ToggleButton } from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import { DUE_TONE_CLASS, formatDue, formatReminder, getDueTone } from "~/components/display/task-row/TaskDateFormat";
import type { DueTone } from "~/components/display/task-row/TaskDateFormat";
import type { TaskRowTask } from "~/components/display/task-row/TaskRow";
import { TaskCheck, TaskLinkItem } from "~/components/display/task-row/TaskRowParts";
import { useTaskCompletion } from "~/components/display/task-row/UseTaskCompletion";

export interface TaskDetailsTask extends TaskRowTask {
  notes: string;
  isInMyDay: boolean;
}

export interface TaskDetailsSheetProps {
  /** The task to show, or `null` while the sheet is closed. */
  task: TaskDetailsTask | null;
  today: string;
  onClose: () => void;
  onToggleDone: (taskId: string, done: boolean) => void;
  onToggleImportant: (taskId: string) => void;
  onAddToMyDay: (taskId: string) => void;
  onRemoveFromMyDay: (taskId: string) => void;
  /** Opens the task in the editor. */
  onEdit: (taskId: string) => void;
}

const DUE_PILL_CLASS: Record<DueTone, string> = {
  overdue: "bg-danger/16",
  today: "bg-accent/16",
  upcoming: "bg-surface-tertiary text-foreground/85",
};

const PILL = "inline-flex h-[26px] items-center gap-1.5 rounded-full px-2.5 text-[13px] font-medium";
const SECTION_HEADING = "text-muted pl-1 text-xs font-semibold tracking-wider uppercase";

/**
 * A phone's bottom sheet for one task, opened by tapping it: the whole title, its dates and tags as pills, its
 * links and note, and the actions the lean row leaves out.
 */
export function TaskDetailsSheet({
  task,
  today,
  onClose,
  onToggleDone,
  onToggleImportant,
  onAddToMyDay,
  onRemoveFromMyDay,
  onEdit,
}: TaskDetailsSheetProps): ReactElement {
  // Keeps showing the last task while the sheet slides away.
  const [shown, setShown] = useState(task);
  if (task && task !== shown) {
    setShown(task);
  }

  return (
    <Drawer isOpen={!!task} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Backdrop>
        <Drawer.Content placement="bottom" className={shown ? `ctx-${shown.contextColor}` : undefined}>
          <Drawer.Dialog
            aria-label={shown?.title}
            className="max-h-[85dvh] pb-[max(1rem,env(safe-area-inset-bottom))]"
            data-testid="task-details"
          >
            <Drawer.Handle />
            <Drawer.Body className="overflow-y-auto px-4">
              {shown && (
                <TaskDetailsBody
                  // Remounts per task, so a pending completion never carries over.
                  key={shown.id}
                  task={shown}
                  today={today}
                  onClose={onClose}
                  onToggleDone={onToggleDone}
                  onToggleImportant={onToggleImportant}
                  onAddToMyDay={onAddToMyDay}
                  onRemoveFromMyDay={onRemoveFromMyDay}
                  onEdit={onEdit}
                />
              )}
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}

interface TaskDetailsBodyProps extends Omit<TaskDetailsSheetProps, "task"> {
  task: TaskDetailsTask;
}

function TaskDetailsBody({
  task,
  today,
  onClose,
  onToggleDone,
  onToggleImportant,
  onAddToMyDay,
  onRemoveFromMyDay,
  onEdit,
}: TaskDetailsBodyProps): ReactElement {
  const intl = useIntl();
  const completion = useTaskCompletion(task.id, task.done, onToggleDone, onClose);
  const notes = task.notes.trim();

  return (
    <div className="flex flex-col gap-4 pt-1">
      <div className="flex items-start gap-2">
        <TaskCheck
          done={task.done}
          isChecking={completion.isChecking}
          onPress={completion.toggle}
          testId="task-details__toggle"
          className="-ml-1 size-9"
        />
        <h2
          className="text-foreground mt-1.5 flex-1 text-lg leading-snug font-semibold"
          data-testid="task-details__title"
        >
          {task.title}
        </h2>
        <ToggleButton
          isIconOnly
          variant="ghost"
          isSelected={task.important}
          onChange={() => onToggleImportant(task.id)}
          aria-label={intl.formatMessage({
            description: "TaskDetailsSheet - aria-label for the important toggle",
            defaultMessage: "Important",
            id: "GpFoIQ",
          })}
          data-testid="task-details__important"
          className={clsx(
            "bg-surface-secondary data-[selected=true]:bg-surface-secondary size-10 shrink-0 rounded-full",
            task.important ? "text-(--star)" : "text-muted"
          )}
        >
          {task.important ? <StarIcon className="size-[19px]" /> : <StarOutlineIcon className="size-[19px]" />}
        </ToggleButton>
      </div>

      <div className="flex flex-wrap gap-1.5 pl-11">
        <span className={clsx(PILL, "bg-(--ctx)/16 text-(--ctx)")}>
          <span className="size-1.5 rounded-full bg-(--ctx)" aria-hidden />
          {task.contextName}
        </span>
        {task.due && (
          <span
            className={clsx(
              PILL,
              DUE_TONE_CLASS[getDueTone(task.due, today)],
              DUE_PILL_CLASS[getDueTone(task.due, today)]
            )}
          >
            {formatDue(intl, task.due, today)}
          </span>
        )}
        {task.remindAt && (
          <span className={clsx(PILL, "bg-surface-tertiary text-foreground/85")}>
            <BellIcon className="size-3" aria-hidden />
            {formatReminder(intl, task.remindAt, today)}
          </span>
        )}
        {task.tags.map((tag) => (
          <span
            key={tag}
            className="bg-surface-tertiary text-foreground/85 inline-flex h-[26px] items-center rounded-[7px] px-[9px] text-[13px]"
          >
            #{tag}
          </span>
        ))}
      </div>

      {task.links.length > 0 && (
        <section className="flex flex-col gap-1.5" data-testid="task-details__links">
          <h3 className={SECTION_HEADING}>
            {intl.formatMessage(
              {
                description: "TaskDetailsSheet - heading of a task's links, with their count",
                defaultMessage: "Links · {count}",
                id: "X5OrjG",
              },
              { count: task.links.length }
            )}
          </h3>
          <div className="bg-surface-secondary/60 divide-separator hero-card flex flex-col divide-y overflow-hidden rounded-[14px]">
            {task.links.map((link) => (
              <TaskLinkItem key={link} link={link} />
            ))}
          </div>
        </section>
      )}

      {notes && (
        <section className="flex flex-col gap-1.5" data-testid="task-details__note">
          <h3 className={SECTION_HEADING}>
            {intl.formatMessage({
              description: "TaskDetailsSheet - heading of a task's note",
              defaultMessage: "Note",
              id: "ZbM0B6",
            })}
          </h3>
          <p className="bg-surface-secondary/60 hero-card text-foreground/85 rounded-[14px] px-3.5 py-3 leading-relaxed whitespace-pre-line">
            {notes}
          </p>
        </section>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          onPress={() => {
            if (task.isInMyDay) {
              onRemoveFromMyDay(task.id);
              onClose();
            } else {
              onAddToMyDay(task.id);
            }
          }}
          className="h-[46px] flex-1 rounded-xl text-[15px] font-medium"
          data-testid="task-details__my-day"
        >
          {task.isInMyDay
            ? intl.formatMessage({
                description: "TaskDetailsSheet - button removing the task from My Day",
                defaultMessage: "Remove from My Day",
                id: "W5lUUE",
              })
            : intl.formatMessage({
                description: "TaskDetailsSheet - button adding the task to My Day",
                defaultMessage: "Add to My Day",
                id: "pyAY4d",
              })}
        </Button>
        <Button
          variant="primary"
          onPress={() => onEdit(task.id)}
          className="h-[46px] flex-1 rounded-xl text-[15px] font-semibold"
          data-testid="task-details__edit"
        >
          {intl.formatMessage({
            description: "TaskDetailsSheet - button opening the task editor",
            defaultMessage: "Edit",
            id: "I4wKm8",
          })}
        </Button>
      </div>
    </div>
  );
}
