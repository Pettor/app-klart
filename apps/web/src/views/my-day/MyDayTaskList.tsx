import { useRef } from "react";
import type { ReactElement } from "react";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { Button } from "@heroui/react";
import { useBreakpoint } from "@package/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import { keepStarredFirst } from "./MyDayTaskOrder";
import type { MyDayTask, MyDayTaskActions } from "./MyDayTypes";
import { useCompletedBump } from "./UseCompletedBump";
import { useMyDayStarMove } from "./UseMyDayStarMove";
import { useMyDayTaskDetails } from "./UseMyDayTaskDetails";
import { TaskDetailsSheet } from "~/components/display/task-details-sheet/TaskDetailsSheet";
import { TaskRow } from "~/components/display/task-row/TaskRow";
import { useTaskReorder } from "~/components/display/task-row/UseTaskReorder";
import type { SmartView } from "~/core/tasks/KlartAtoms";

export interface MyDayTaskListProps {
  today: string;
  smartView: SmartView;
  tasks: MyDayTask[];
  doneTasks: MyDayTask[];
  showContext: boolean;
  actions: MyDayTaskActions;
  /** The task open in the editor, highlighted in the list. */
  selectedTaskId?: string | null;
  /** Shows every task's tags; otherwise they appear on hover or focus. */
  showTags?: boolean;
  /** Shows due dates, reminders and note markers under titles. */
  showMeta?: boolean;
  /** Shows a button per task link. */
  showLinks?: boolean;
  /** Lists the completed tasks; otherwise only their count shows, as a button that expands them. */
  isCompletedExpanded?: boolean;
  onToggleCompleted?: () => void;
  /** Tasks just added from Suggestions, which animate into the list. */
  arrivingIds?: ReadonlySet<string>;
}

export function MyDayTaskList({
  today,
  smartView,
  tasks,
  doneTasks,
  showContext,
  actions,
  selectedTaskId = null,
  showTags = false,
  showMeta = true,
  showLinks = true,
  isCompletedExpanded = true,
  onToggleCompleted,
  arrivingIds,
}: MyDayTaskListProps): ReactElement {
  const intl = useIntl();
  // On phones a tap shows the task's details first; the editor is one more tap away.
  const isPhone = !useBreakpoint("sm");
  const details = useMyDayTaskDetails([...tasks, ...doneTasks]);
  const completedBump = useCompletedBump(doneTasks.length);
  const listRef = useRef<HTMLElement>(null);
  const toggleImportant = useMyDayStarMove(listRef, actions.onToggleImportant);
  // Only My Day has an order of its own; the other views sort by due date.
  const canReorder = smartView === "day";
  const getReorder = useTaskReorder(
    tasks.map((task) => task.id),
    (taskId, targetId, position) => {
      const move = keepStarredFirst(tasks, taskId, targetId, position);
      if (move) {
        actions.onMoveInMyDay(taskId, move.targetId, move.position);
      }
    }
  );

  function renderRow(task: MyDayTask): ReactElement {
    return (
      <TaskRow
        key={task.id}
        task={task}
        today={today}
        showContext={showContext}
        isInMyDay={task.isInMyDay}
        onToggleDone={actions.onToggleDone}
        onToggleImportant={toggleImportant}
        onAddToMyDay={actions.onAddToMyDay}
        onRemoveFromMyDay={actions.onRemoveFromMyDay}
        onArchive={actions.onArchive}
        onOpen={isPhone ? details.open : actions.onOpen}
        isSelected={task.id === selectedTaskId}
        isArriving={arrivingIds?.has(task.id)}
        showMeta={showMeta}
        showLinks={showLinks}
        reorder={canReorder && !task.done ? getReorder(task.id) : undefined}
      />
    );
  }

  return (
    <>
      <section
        ref={listRef}
        aria-label={intl.formatMessage({
          description: "MyDayTaskList - aria-label of the open tasks",
          defaultMessage: "Tasks",
          id: "EvrxWO",
        })}
        className={clsx(
          "compact:gap-2 compact:[--slab-gap:--spacing(2)] flex flex-col gap-3 [--slab-gap:--spacing(3)]",
          showTags && "slab-tags-on"
        )}
        data-testid="my-day__tasks"
      >
        {tasks.length === 0 && (
          <div className="text-foreground/80 rounded-xl bg-black/5 p-8 text-center dark:bg-black/25">
            {smartView === "day"
              ? intl.formatMessage({
                  description: "MyDayTaskList - empty My Day",
                  defaultMessage:
                    "Nothing planned here yet. Open Suggestions to pull in what's due, or add a task below.",
                  id: "p0JS/m",
                })
              : intl.formatMessage({
                  description: "MyDayTaskList - empty smart view",
                  defaultMessage: "No open tasks here.",
                  id: "Lw128w",
                })}
          </div>
        )}
        {tasks.map(renderRow)}
      </section>

      {doneTasks.length > 0 && (
        <section
          aria-label={intl.formatMessage({
            description: "MyDayTaskList - aria-label of the completed tasks",
            defaultMessage: "Completed",
            id: "/gk/jd",
          })}
          className="flex flex-col gap-2"
        >
          <span
            // Remounts on each completion, replaying the bump.
            key={completedBump}
            className={clsx("flex self-start", completedBump > 0 && "slab-bump")}
            data-testid="my-day__completed-count"
          >
            <Button
              variant="ghost"
              onPress={onToggleCompleted}
              aria-expanded={isCompletedExpanded}
              data-testid="my-day__toggle-completed"
              className="text-foreground h-[30px] min-w-0 gap-1.5 self-start rounded-lg bg-white/75 pr-2.5 pl-1.5 text-[13px] font-semibold hover:bg-white dark:bg-black/30 dark:hover:bg-black/40"
            >
              <ChevronRightIcon
                aria-hidden
                className={clsx("size-3.5 transition-transform", isCompletedExpanded && "rotate-90")}
              />
              {intl.formatMessage(
                {
                  description: "MyDayTaskList - completed section heading with count",
                  defaultMessage: "Completed {count}",
                  id: "6737j1",
                },
                { count: doneTasks.length }
              )}
            </Button>
          </span>
          {isCompletedExpanded && doneTasks.map(renderRow)}
        </section>
      )}

      {isPhone && (
        <TaskDetailsSheet
          task={details.task}
          today={today}
          onClose={details.close}
          onToggleDone={actions.onToggleDone}
          onToggleImportant={toggleImportant}
          onAddToMyDay={actions.onAddToMyDay}
          onRemoveFromMyDay={actions.onRemoveFromMyDay}
          onEdit={(taskId) => {
            details.close();
            actions.onOpen(taskId);
          }}
        />
      )}
    </>
  );
}
