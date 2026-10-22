import type { KeyboardEvent, PointerEvent } from "react";
import { useEffect, useRef, useState } from "react";

export type TaskDropPosition = "before" | "after";

/** What one row needs to be pressed and dragged, or moved with the arrow keys. */
export interface TaskRowReorder {
  /** The row follows the pointer. */
  isLifted: boolean;
  /** How far the lifted row has moved, in px. */
  offsetY: number;
  /** Where the lifted row would land, drawn as a line on this row. */
  dropIndicator: TaskDropPosition | null;
  /** The row just landed; plays the settle animation. */
  isSettled: boolean;
  /**
   * Spread on the row: a mouse or pen press that moves a few pixels lifts it. Capture-phase handlers, since
   * buttons in the row stop their pointer events, and they also follow a drag started by the grip.
   */
  rowProps: {
    onPointerDownCapture: (event: PointerEvent<HTMLElement>) => void;
    onPointerMoveCapture: (event: PointerEvent<HTMLElement>) => void;
    onPointerUpCapture: () => void;
    onPointerCancelCapture: () => void;
  };
  /** Spread on the element around the grip. Touch drags start there, since a swipe on the row scrolls. */
  gripProps: { onPointerDownCapture: (event: PointerEvent<HTMLElement>) => void };
  /** For the grip: arrow up and down move the row one step. */
  onGripKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  /** For the row's main button: Alt with arrow up or down moves the row one step. */
  onRowKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  /** True while a drag is being released, so the same press doesn't also open the task. */
  isDropping: () => boolean;
}

interface Drag {
  id: string;
  from: number;
  startY: number;
  offsetY: number;
  /** Vertical center of every row when the drag started, in `ids` order. */
  centers: number[];
}

interface Press {
  id: string;
  x: number;
  y: number;
}

const SETTLE_MS = 650;

/** How far a press on the row must move before it becomes a drag, so a click still opens the task. */
const DRAG_THRESHOLD_PX = 4;

/** Rows carry `data-reorder-id` so a drag can measure its siblings. */
export const REORDER_ID_ATTRIBUTE = "data-reorder-id";

/** Buttons inside a row ignore drags, except one carrying this attribute (the button covering the title). */
export const REORDER_HANDLE_ATTRIBUTE = "data-reorder-handle";

function isArrow(event: KeyboardEvent): boolean {
  return event.key === "ArrowUp" || event.key === "ArrowDown";
}

/** The index the dragged row would take if dropped now: how many other rows sit above the pointer. */
function getTargetIndex(drag: Drag): number {
  const y = drag.startY + drag.offsetY;
  return drag.centers.filter((center, index) => index !== drag.from && center < y).length;
}

/**
 * Drag-to-reorder for a list of task rows: press and drag the row with a mouse or pen, drag its grip
 * on touch screens, or use the keyboard. `onMove` gets the moved task and the task it now sits before or after.
 */
export function useTaskReorder(
  ids: string[],
  onMove: (taskId: string, targetId: string, position: TaskDropPosition) => void
): (taskId: string) => TaskRowReorder {
  const [drag, setDrag] = useState<Drag | null>(null);
  const [settledId, setSettledId] = useState<string | null>(null);
  const settleTimer = useRef<number | undefined>(undefined);
  const press = useRef<Press | null>(null);
  const dropping = useRef(false);

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

  /** Measures every row, then makes `element` (the row or its grip) follow the pointer. */
  function lift(taskId: string, from: number, element: HTMLElement, startY: number, event: PointerEvent): void {
    const row = element.closest<HTMLElement>(`[${REORDER_ID_ATTRIBUTE}]`);
    const rows = row?.parentElement?.querySelectorAll<HTMLElement>(`:scope > [${REORDER_ID_ATTRIBUTE}]`);
    const rectById = new Map(
      [...(rows ?? [])].map((other) => [other.getAttribute(REORDER_ID_ATTRIBUTE), other.getBoundingClientRect()])
    );
    const centers = ids.map((id) => {
      const rect = rectById.get(id);
      return rect ? rect.top + rect.height / 2 : 0;
    });
    element.setPointerCapture(event.pointerId);
    setDrag({ id: taskId, from, startY, offsetY: event.clientY - startY, centers });
  }

  function drop(current: Drag): void {
    setDrag(null);
    moveTo(current.id, current.from, getTargetIndex(current));
    // The pointerup also reaches the button under the pointer; `isDropping` tells it to ignore this one.
    dropping.current = true;
    window.setTimeout(() => (dropping.current = false));
  }

  function moveWithKeys(event: KeyboardEvent<HTMLElement>, taskId: string, index: number): void {
    event.preventDefault();
    const element = event.currentTarget;
    moveTo(taskId, index, index + (event.key === "ArrowUp" ? -1 : 1));
    // The row may be re-inserted in the DOM when it moves, which drops focus.
    requestAnimationFrame(() => element.focus());
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
      rowProps: {
        onPointerDownCapture: (event) => {
          if (event.pointerType === "touch" || event.button !== 0 || index < 0) {
            return;
          }
          const control = (event.target as Element).closest("button, a, input, textarea, [role='button']");
          if (control && !control.hasAttribute(REORDER_HANDLE_ATTRIBUTE)) {
            return;
          }
          press.current = { id: taskId, x: event.clientX, y: event.clientY };
        },
        onPointerMoveCapture: (event) => {
          const pressed = press.current;
          if (isLifted) {
            setDrag({ ...drag, offsetY: event.clientY - drag.startY });
          } else if (pressed?.id === taskId) {
            if (Math.hypot(event.clientX - pressed.x, event.clientY - pressed.y) > DRAG_THRESHOLD_PX) {
              press.current = null;
              lift(taskId, index, event.currentTarget, pressed.y, event);
            }
          }
        },
        onPointerUpCapture: () => {
          press.current = null;
          if (isLifted) {
            drop(drag);
          }
        },
        onPointerCancelCapture: () => {
          press.current = null;
          setDrag(null);
        },
      },
      gripProps: {
        onPointerDownCapture: (event) => {
          if (event.button !== 0 || index < 0) {
            return;
          }
          // Keeps the drag from selecting text.
          event.preventDefault();
          lift(taskId, index, event.currentTarget, event.clientY, event);
        },
      },
      onGripKeyDown: (event) => {
        if (isArrow(event)) {
          moveWithKeys(event, taskId, index);
        }
      },
      onRowKeyDown: (event) => {
        if (event.altKey && isArrow(event)) {
          moveWithKeys(event, taskId, index);
        }
      },
      isDropping: () => dropping.current,
    };
  };
}
