import type { ReactElement } from "react";
import { Chip } from "@heroui/react";
import { useIntl } from "react-intl";
import type { MyDayTask, MyDayTaskActions } from "./MyDayTypes";
import { TaskRow } from "~/components/display/task-row/TaskRow";
import type { SmartView } from "~/core/tasks/KlartAtoms";

export interface MyDayTaskListProps {
  today: string;
  smartView: SmartView;
  tasks: MyDayTask[];
  doneTasks: MyDayTask[];
  showContext: boolean;
  actions: MyDayTaskActions;
}

export function MyDayTaskList({
  today,
  smartView,
  tasks,
  doneTasks,
  showContext,
  actions,
}: MyDayTaskListProps): ReactElement {
  const intl = useIntl();

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
        className="flex flex-col gap-1"
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
          className="flex flex-col gap-1"
        >
          <Chip size="sm" variant="soft" className="self-start bg-black/10 font-semibold dark:bg-black/30">
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
