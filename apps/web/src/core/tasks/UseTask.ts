import { useAtomValue } from "jotai";
import { klartDataAtom } from "./KlartAtoms";
import type { Task } from "./Task";

/** The task with this id, or `null` when there is none or it has been archived. */
export function useTask(taskId: string | null): Task | null {
  const data = useAtomValue(klartDataAtom);
  const task = taskId ? data.tasks[taskId] : undefined;
  return task && task.status !== "archived" ? task : null;
}
