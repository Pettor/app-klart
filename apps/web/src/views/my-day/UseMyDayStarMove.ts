import { useLayoutEffect, useRef } from "react";
import type { RefObject } from "react";
import { REORDER_ID_ATTRIBUTE } from "~/components/display/task-row/UseTaskReorder";
import { isMotionReduced } from "~/core/theme/Motion";

/** The starred card holds its place while the star pops, then glides to where it now sorts. */
const LIFT_MS = 180;
const GLIDE_MS = 440;

interface PendingMove {
  taskId: string;
  /** Each row's top before the star changed the order. */
  tops: Map<string, number>;
}

function measure(list: HTMLElement): Map<HTMLElement, string> {
  const rows = new Map<HTMLElement, string>();
  for (const row of list.querySelectorAll<HTMLElement>(`[${REORDER_ID_ATTRIBUTE}]`)) {
    rows.set(row, row.getAttribute(REORDER_ID_ATTRIBUTE)!);
  }
  return rows;
}

/**
 * Starred tasks lead My Day, so starring one moves it. Wraps `onToggleImportant` to animate the move: the card
 * lifts, then glides up (or down when unstarred) while the cards it passes slide out of its way.
 */
export function useMyDayStarMove(
  listRef: RefObject<HTMLElement | null>,
  onToggleImportant: (taskId: string) => void
): (taskId: string) => void {
  const pending = useRef<PendingMove | null>(null);

  // No dependencies: the first commit after a star is the one with the new order.
  useLayoutEffect(() => {
    const move = pending.current;
    const list = listRef.current;
    pending.current = null;
    if (!move || !list || isMotionReduced()) {
      return;
    }
    for (const [row, id] of measure(list)) {
      const before = move.tops.get(id);
      const dy = before === undefined ? 0 : before - row.getBoundingClientRect().top;
      if (Math.abs(dy) < 1) {
        continue;
      }
      if (id === move.taskId) {
        const total = LIFT_MS + GLIDE_MS;
        row.style.zIndex = "5";
        row
          .animate(
            [
              { transform: `translateY(${dy}px)`, easing: "ease-out" },
              {
                transform: `translateY(${dy}px) scale(1.03)`,
                offset: LIFT_MS / total,
                easing: "cubic-bezier(0.2, 0.9, 0.25, 1.1)",
              },
              { transform: "none" },
            ],
            { duration: total }
          )
          .finished.then(
            () => row.style.removeProperty("z-index"),
            () => row.style.removeProperty("z-index")
          );
      } else {
        row.animate([{ transform: `translateY(${dy}px)` }, { transform: "none" }], {
          duration: GLIDE_MS,
          delay: LIFT_MS,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          fill: "backwards",
        });
      }
    }
  });

  return (taskId) => {
    const list = listRef.current;
    if (list) {
      const tops = new Map<string, number>();
      for (const [row, id] of measure(list)) {
        tops.set(id, row.getBoundingClientRect().top);
      }
      pending.current = { taskId, tops };
    }
    onToggleImportant(taskId);
  };
}
