import { useState } from "react";

export interface StarPop {
  /** Key for the filled star, so its pop replays each time. `0` until starred here, so stars don't pop on load. */
  pops: number;
  toggle: () => void;
}

/** Starring a task pops its star. Unstarring doesn't. */
export function useStarPop(taskId: string, important: boolean, onToggleImportant: (taskId: string) => void): StarPop {
  const [pops, setPops] = useState(0);
  return {
    pops,
    toggle: () => {
      if (!important) {
        setPops(pops + 1);
      }
      onToggleImportant(taskId);
    },
  };
}
