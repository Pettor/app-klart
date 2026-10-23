import { useEffect, useState } from "react";
import type { MyDaySuggestionsProps } from "./MyDayTypes";

/** Long enough for the arrival animation; afterwards a remounted row no longer replays it. */
const ARRIVAL_MS = 1000;

const NONE: ReadonlySet<string> = new Set();

export interface MyDayArrivals {
  /** Tasks that just joined the list from Suggestions. */
  arrivingIds: ReadonlySet<string>;
  /** `suggestions` with adds that mark the tasks they bring in as arriving. */
  suggestions: MyDaySuggestionsProps;
}

/** Tasks added from Suggestions animate into the list: the ids new to it once an add lands. */
export function useMyDayArrivals(taskIds: string[], suggestions: MyDaySuggestionsProps): MyDayArrivals {
  const key = taskIds.join(" ");
  const [seenKey, setSeenKey] = useState(key);
  const [isExpecting, setIsExpecting] = useState(false);
  const [arrivingIds, setArrivingIds] = useState(NONE);

  if (key !== seenKey) {
    setSeenKey(key);
    if (isExpecting) {
      const seen = new Set(seenKey.split(" "));
      setArrivingIds(new Set(taskIds.filter((id) => !seen.has(id))));
      setIsExpecting(false);
    }
  }

  useEffect(() => {
    if (arrivingIds.size === 0) {
      return;
    }
    const timer = setTimeout(() => setArrivingIds(NONE), ARRIVAL_MS);
    return () => clearTimeout(timer);
  }, [arrivingIds]);

  return {
    arrivingIds,
    suggestions: {
      ...suggestions,
      onAdd: (taskId, reason) => {
        setIsExpecting(true);
        suggestions.onAdd(taskId, reason);
      },
      onAddAllDue: () => {
        setIsExpecting(true);
        suggestions.onAddAllDue();
      },
    },
  };
}
