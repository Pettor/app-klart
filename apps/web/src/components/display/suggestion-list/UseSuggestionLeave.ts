import { useState } from "react";
import type { SuggestionItem } from "./SuggestionList";
import type { SuggestionReason } from "~/core/tasks/Day";

/** The + turns into a check, then the card slides out and the list closes the gap. */
const LEAVE_MS = 460;

/** The reasons "Add all due" takes in. */
const DUE_REASONS: SuggestionReason[] = ["overdue", "due_today"];

export interface SuggestionLeave {
  /** Suggestions on their way out of the panel. */
  leavingIds: ReadonlySet<string>;
  /** Suggestions leaving because they were completed: their checkbox is checked. */
  completingIds: ReadonlySet<string>;
  add: (taskId: string, reason: SuggestionReason) => void;
  addAllDue: () => void;
  complete: (taskId: string) => void;
}

/** Adding or completing a suggestion lets its card leave the panel first, then makes the change. */
export function useSuggestionLeave(
  items: SuggestionItem[],
  onAdd: (taskId: string, reason: SuggestionReason) => void,
  onAddAllDue: () => void,
  onComplete?: (taskId: string) => void
): SuggestionLeave {
  const [leavingIds, setLeavingIds] = useState<ReadonlySet<string>>(new Set());
  const [completingIds, setCompletingIds] = useState<ReadonlySet<string>>(new Set());

  function leave(ids: string[], then: () => void): void {
    setLeavingIds((current) => new Set([...current, ...ids]));
    // Not cleared on unmount: a sheet closed mid-animation still makes the change.
    setTimeout(() => {
      then();
      setLeavingIds((current) => new Set([...current].filter((id) => !ids.includes(id))));
      setCompletingIds((current) => new Set([...current].filter((id) => !ids.includes(id))));
    }, LEAVE_MS);
  }

  return {
    leavingIds,
    completingIds,
    add: (taskId, reason) => {
      if (!leavingIds.has(taskId)) {
        leave([taskId], () => onAdd(taskId, reason));
      }
    },
    addAllDue: () => {
      const ids = items.filter((item) => DUE_REASONS.includes(item.reason)).map((item) => item.id);
      leave(ids, onAddAllDue);
    },
    complete: (taskId) => {
      if (onComplete && !leavingIds.has(taskId)) {
        setCompletingIds((current) => new Set([...current, taskId]));
        leave([taskId], () => onComplete(taskId));
      }
    },
  };
}
