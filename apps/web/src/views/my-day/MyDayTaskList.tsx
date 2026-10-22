import type { ReactElement } from "react";
import { Chip } from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import type { MyDayTask, MyDayTaskActions } from "./MyDayTypes";
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
}: MyDayTaskListProps): ReactElement {
  const intl = useIntl();
  // Only My Day has an order of its own; the other views sort by due date.
  const canReorder = smartView === "day";
  const getReorder = useTaskReorder(
    tasks.map((task) => task.id),
    actions.onMoveInMyDay
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
        onToggleImportant={actions.onToggleImportant}
        onAddToMyDay={actions.onAddToMyDay}
        onRemoveFromMyDay={actions.onRemoveFromMyDay}
        onArchive={actions.onArchive}
        onOpen={actions.onOpen}
        isSelected={task.id === selectedTaskId}
        reorder={canReorder && !task.done ? getReorder(task.id) : undefined}
      />
    );
  }

  return (
    <>
      <section
        aria-label={intl.formatMessage({
          description: "MyDayTaskList - aria-label of the open tasks",
          defaultMessage: "Tasks",
          id: "EvrxWO",
        })}
        className={clsx("flex flex-col gap-3", showTags && "slab-tags-on")}
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
          <Chip
            size="sm"
            variant="soft"
            className="text-foreground h-auto self-start rounded-md bg-white/75 px-2.5 py-1 text-[13px] font-semibold dark:bg-black/30"
          >
            {intl.formatMessage(
              {
                description: "MyDayTaskList - completed section heading with count",
                defaultMessage: "Completed {count}",
                id: "6737j1",
              },
              { count: doneTasks.length }
            )}
          </Chip>
          {doneTasks.map(renderRow)}
        </section>
      )}
    </>
  );
}
