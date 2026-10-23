import type { PointerEvent, SyntheticEvent } from "react";
import { useEffect, useRef, useState } from "react";

export interface TagsLongPress {
  /** The row shows its tags. */
  isOpen: boolean;
  /** Spread on the element around the row's open button. Capture-phase, since the button stops its pointer events. */
  pressProps: {
    onPointerDownCapture: (event: PointerEvent<HTMLElement>) => void;
    onPointerMoveCapture: (event: PointerEvent<HTMLElement>) => void;
    onPointerUpCapture: () => void;
    onPointerCancelCapture: () => void;
    onContextMenu: (event: SyntheticEvent) => void;
  };
  /** True when the press just released was a long press, so it doesn't also open the task. */
  wasLongPress: () => boolean;
}

const LONG_PRESS_MS = 450;

/** How far a finger may drift while held before the press counts as a scroll instead. */
const MOVE_TOLERANCE_PX = 10;

/** On touch screens, holding a task row shows or hides its tags instead of opening the task. */
export function useTagsLongPress(isEnabled: boolean): TagsLongPress {
  const [isOpen, setIsOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const start = useRef<{ x: number; y: number } | null>(null);
  const fired = useRef(false);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function cancel(): void {
    window.clearTimeout(timer.current);
    start.current = null;
  }

  return {
    isOpen: isEnabled && isOpen,
    pressProps: {
      onPointerDownCapture: (event) => {
        fired.current = false;
        if (!isEnabled || event.pointerType !== "touch") {
          return;
        }
        start.current = { x: event.clientX, y: event.clientY };
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => {
          fired.current = true;
          start.current = null;
          setIsOpen((open) => !open);
        }, LONG_PRESS_MS);
      },
      onPointerMoveCapture: (event) => {
        const from = start.current;
        if (from && Math.hypot(event.clientX - from.x, event.clientY - from.y) > MOVE_TOLERANCE_PX) {
          cancel();
        }
      },
      onPointerUpCapture: cancel,
      onPointerCancelCapture: cancel,
      // Android opens a context menu on a long press.
      onContextMenu: (event) => {
        if (isEnabled) {
          event.preventDefault();
        }
      },
    },
    wasLongPress: () => fired.current,
  };
}
