import { useState } from "react";

/**
 * Counts how often the Completed count has gone up, to key the badge so its bump animation replays each time a
 * task lands. `0` until the first one, so the badge doesn't bump on load.
 */
export function useCompletedBump(count: number): number {
  const [seen, setSeen] = useState(count);
  const [bumps, setBumps] = useState(0);
  if (count !== seen) {
    setSeen(count);
    if (count > seen) {
      setBumps(bumps + 1);
    }
  }
  return bumps;
}
