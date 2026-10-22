import type { KeyboardEvent, PointerEvent } from "react";
import { useEffect, useRef, useState } from "react";

export type TaskDropPosition = "before" | "after";

/** What one row needs to be dragged by its grip, or moved with the arrow keys. */
export interface TaskRowReorder {
  /** The row follows the pointer. */
  isLifted: boolean;
  /** How far the lifted row has moved, in px. */
  offsetY: number;
  /** Where the lifted row would land, drawn as a line on this row. */
  dropIndicator: TaskDropPosition | null;
  /** The row just landed; plays the settle animation. */
  isSettled: boolean;
  /** Spread on the element around the grip. */
  gripProps: {
    onPointerDownCapture: (event: PointerEvent<HTMLElement>) => void;
    onPointerMove: (event: PointerEvent<HTMLElement>) => void;
    onPointerUp: (event: PointerEvent<HTMLElement>) => void;
    onPointerCancel: () => void;
  };
  /** For the grip button: arrow up and down move the row one step. */
  onGripKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

interface Drag {
  id: string;
  from: number;
  startY: number;
  offsetY: number;
  /** Vertical center of every row when the drag started, in `ids` order. */
  centers: number[];
}

const SETTLE_MS = 650;

/** Rows carry `data-reorder-id` so a drag can measure its siblings. */
export const REORDER_ID_ATTRIBUTE = "data-reorder-id";

/** The index the dragged row would take if dropped now: how many other rows sit above the pointer. */
function getTargetIndex(drag: Drag): number {
  const y = drag.startY + drag.offsetY;
  return drag.centers.filter((center, index) => index !== drag.from && center < y).length;
}

/**
 * Drag-to-reorder for a list of task rows, with the pointer (mouse, pen or touch, by a grip) or the
 * keyboard. `onMove` gets the moved task and the task it now sits before or after.
 */
export function useTaskReorder(
  ids: string[],
  onMove: (taskId: string, targetId: string, position: TaskDropPosition) => void
): (taskId: string) => TaskRowReorder {
  const [drag, setDrag] = useState<Drag | null>(null);
  const [settledId, setSettledId] = useState<string | null>(null);
  const settleTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(settleTimer.current), []);

  function settle(taskId: string): void {
    setSettledId(taskId);
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => setSettledId(null), SETTLE_MS);
  }

  function moveTo(taskId: string, from: number, to: number): void {
    const target = ids[to];
    if (to === from || !target) {
      return;
    }
    onMove(taskId, target, to < from ? "before" : "after");
    settle(taskId);
  }

  const target = drag ? getTargetIndex(drag) : -1;

  return (taskId) => {
    const index = ids.indexOf(taskId);
    const isLifted = drag?.id === taskId;

    return {
      isLifted,
      offsetY: isLifted ? drag.offsetY : 0,
      dropIndicator: drag && !isLifted && index === target ? (target < drag.from ? "before" : "after") : null,
      isSettled: settledId === taskId,
      gripProps: {
        onPointerDownCapture: (event) => {
          if (event.button !== 0 || index < 0) {
            return;
          }
          const row = event.currentTarget.closest<HTMLElement>(`[${REORDER_ID_ATTRIBUTE}]`);
          const rows = row?.parentElement?.querySelectorAll<HTMLElement>(`:scope > [${REORDER_ID_ATTRIBUTE}]`);
          const rectById = new Map(
            [...(rows ?? [])].map((element) => [
              element.getAttribute(REORDER_ID_ATTRIBUTE),
              element.getBoundingClientRect(),
            ])
          );
          const centers = ids.map((id) => {
            const rect = rectById.get(id);
            return rect ? rect.top + rect.height / 2 : 0;
          });
          // Keeps the drag from selecting text.
          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
          setDrag({ id: taskId, from: index, startY: event.clientY, offsetY: 0, centers });
        },
        onPointerMove: (event) => {
          if (isLifted) {
            setDrag({ ...drag, offsetY: event.clientY - drag.startY });
          }
        },
        onPointerUp: () => {
          if (isLifted) {
            setDrag(null);
            moveTo(taskId, drag.from, getTargetIndex(drag));
          }
        },
        onPointerCancel: () => setDrag(null),
      },
      onGripKeyDown: (event) => {
        if (event.key !== "ArrowUp" && event.key !== "ArrowDown") {
          return;
        }
        event.preventDefault();
        const grip = event.currentTarget;
        moveTo(taskId, index, index + (event.key === "ArrowUp" ? -1 : 1));
        // The row may be re-inserted in the DOM when it moves, which drops focus.
        requestAnimationFrame(() => grip.focus());
      },
    };
  };
}
