import type { MyDayTask } from "./MyDayTypes";
import type { TaskDropPosition } from "~/components/display/task-row/UseTaskReorder";

export interface MyDayMove {
  targetId: string;
  position: TaskDropPosition;
}

/**
 * Starred tasks lead My Day, so a drop across the line between starred and unstarred lands at the edge of the
 * task's own group instead. `null` when the task is alone in its group and has nowhere to go.
 */
export function keepStarredFirst(
  tasks: MyDayTask[],
  taskId: string,
  targetId: string,
  position: TaskDropPosition
): MyDayMove | null {
  const task = tasks.find((candidate) => candidate.id === taskId);
  const target = tasks.find((candidate) => candidate.id === targetId);
  if (!task || !target || task.important === target.important) {
    return { targetId, position };
  }
  const group = tasks.filter((candidate) => candidate.important === task.important && candidate.id !== taskId);
  if (group.length === 0) {
    return null;
  }
  return task.important
    ? { targetId: group[group.length - 1]!.id, position: "after" }
    : { targetId: group[0]!.id, position: "before" };
}
