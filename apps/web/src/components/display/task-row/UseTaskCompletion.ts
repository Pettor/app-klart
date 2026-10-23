import { useRef, useState } from "react";

/** The box fills with a pop, the check draws in and the title is struck through. */
const CHECK_MS = 560;
/** The card sinks toward Completed while the list closes the gap. */
const LEAVE_MS = 470;

/** `checking` while the check animates, `leaving` while the card sinks away, before the task is marked done. */
export type TaskCompletionPhase = "idle" | "checking" | "leaving";

export interface TaskCompletion {
  phase: TaskCompletionPhase;
  /** True from the press until the task is marked done. */
  isChecking: boolean;
  toggle: () => void;
}

export interface TaskCompletionOptions {
  /** Runs once the task is done, e.g. to close a sheet. */
  onCompleted?: () => void;
  /** Lets the card sink and collapse after the check. Off where there's no card to move, like a sheet. */
  leave?: boolean;
}

/**
 * Completing a task checks it, lets its card sink away, then calls `onToggleDone`. Un-completing is immediate.
 */
export function useTaskCompletion(
  taskId: string,
  done: boolean,
  onToggleDone: (taskId: string, done: boolean) => void,
  { onCompleted, leave = true }: TaskCompletionOptions = {}
): TaskCompletion {
  const [phase, setPhase] = useState<TaskCompletionPhase>("idle");
  const pending = useRef(false);

  return {
    phase,
    isChecking: phase !== "idle",
    toggle: () => {
      if (done) {
        onToggleDone(taskId, false);
        return;
      }
      if (pending.current) {
        return;
      }
      pending.current = true;
      setPhase("checking");
      // Not cleared on unmount: a sheet closing mid-animation still completes the task.
      if (leave) {
        setTimeout(() => setPhase("leaving"), CHECK_MS);
      }
      setTimeout(
        () => {
          pending.current = false;
          setPhase("idle");
          onToggleDone(taskId, true);
          onCompleted?.();
        },
        leave ? CHECK_MS + LEAVE_MS : CHECK_MS
      );
    },
  };
}
