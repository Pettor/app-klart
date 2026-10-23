import { useRef, useState } from "react";

/** Long enough for the checkbox to fill and draw its check before the task moves to Completed. */
const COMPLETE_DELAY_MS = 450;

export interface TaskCompletion {
  /** True while the check animates, before the task is marked done. */
  isChecking: boolean;
  toggle: () => void;
}

/**
 * Completing a task fills the checkbox, draws the check and fades the row, then calls `onToggleDone`.
 * Un-completing is immediate. `onCompleted` runs once the task is done, e.g. to close a sheet.
 */
export function useTaskCompletion(
  taskId: string,
  done: boolean,
  onToggleDone: (taskId: string, done: boolean) => void,
  onCompleted?: () => void
): TaskCompletion {
  const [isChecking, setIsChecking] = useState(false);
  const pending = useRef(false);

  return {
    isChecking,
    toggle: () => {
      if (done) {
        onToggleDone(taskId, false);
        return;
      }
      if (pending.current) {
        return;
      }
      pending.current = true;
      setIsChecking(true);
      // Not cleared on unmount: a sheet closing mid-animation still completes the task.
      setTimeout(() => {
        pending.current = false;
        setIsChecking(false);
        onToggleDone(taskId, true);
        onCompleted?.();
      }, COMPLETE_DELAY_MS);
    },
  };
}
