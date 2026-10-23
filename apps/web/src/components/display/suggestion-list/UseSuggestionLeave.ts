import { useState } from "react";
import type { SuggestionListGroup } from "./SuggestionList";
import type { SuggestionReason } from "~/core/tasks/Day";

/** The + turns into a check, then the card slides out and the list closes the gap. */
const LEAVE_MS = 460;

/** The groups "Add all due" takes in. */
const DUE_REASONS: SuggestionReason[] = ["overdue", "due_today"];

export interface SuggestionLeave {
  /** Suggestions on their way to My Day. */
  leavingIds: ReadonlySet<string>;
  add: (taskId: string, reason: SuggestionReason) => void;
  addAllDue: () => void;
}

/** Adding a suggestion lets its card leave the panel first, then adds it to My Day. */
export function useSuggestionLeave(
  groups: SuggestionListGroup[],
  onAdd: (taskId: string, reason: SuggestionReason) => void,
  onAddAllDue: () => void
): SuggestionLeave {
  const [leavingIds, setLeavingIds] = useState<ReadonlySet<string>>(new Set());

  function leave(ids: string[], then: () => void): void {
    setLeavingIds((current) => new Set([...current, ...ids]));
    // Not cleared on unmount: a sheet closed mid-animation still adds the task.
    setTimeout(() => {
      then();
      setLeavingIds((current) => new Set([...current].filter((id) => !ids.includes(id))));
    }, LEAVE_MS);
  }

  return {
    leavingIds,
    add: (taskId, reason) => {
      if (!leavingIds.has(taskId)) {
        leave([taskId], () => onAdd(taskId, reason));
      }
    },
    addAllDue: () => {
      const ids = groups
        .filter((group) => DUE_REASONS.includes(group.reason))
        .flatMap((group) => group.items.map((item) => item.id));
      leave(ids, onAddAllDue);
    },
  };
}
