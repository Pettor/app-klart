import { useState } from "react";
import type { MyDayTask } from "./MyDayTypes";

export interface MyDayTaskDetails {
  /** The task whose details sheet is open, kept current as the list changes. */
  task: MyDayTask | null;
  open: (taskId: string) => void;
  close: () => void;
}

/** Which task's details sheet is open on phones. It closes by itself when the task leaves the list. */
export function useMyDayTaskDetails(tasks: MyDayTask[]): MyDayTaskDetails {
  const [taskId, setTaskId] = useState<string | null>(null);

  return {
    task: (taskId && tasks.find((task) => task.id === taskId)) || null,
    open: setTaskId,
    close: () => setTaskId(null),
  };
}
