import type { KeyboardEvent, PointerEvent, ReactElement } from "react";
import { useRef } from "react";
import clsx from "clsx";

const KEYBOARD_STEP = 16;

export interface ResizeHandleProps {
  /** Current width of the panel the handle resizes. */
  width: number;
  minWidth: number;
  maxWidth: number;
  /** Which edge of the panel the handle sits on; dragging away from the panel grows it. */
  edge: "left" | "right";
  ariaLabel: string;
  onResize: (width: number) => void;
  onResizeEnd: (width: number) => void;
  /** Called on double-click to restore the default width. */
  onReset?: () => void;
  className?: string;
}

/** A thin draggable strip on a panel's edge. Supports pointer drag, arrow keys and double-click to reset. */
export function ResizeHandle({
  width,
  minWidth,
  maxWidth,
  edge,
  ariaLabel,
  onResize,
  onResizeEnd,
  onReset,
  className,
}: ResizeHandleProps): ReactElement {
  const drag = useRef<{ startX: number; startWidth: number; lastWidth: number } | null>(null);
  const direction = edge === "left" ? -1 : 1;

  function handlePointerDown(event: PointerEvent<HTMLDivElement>): void {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { startX: event.clientX, startWidth: width, lastWidth: width };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>): void {
    if (!drag.current) {
      return;
    }
    const next = drag.current.startWidth + (event.clientX - drag.current.startX) * direction;
    drag.current.lastWidth = next;
    onResize(next);
  }

  function handlePointerUp(): void {
    if (!drag.current) {
      return;
    }
    onResizeEnd(drag.current.lastWidth);
    drag.current = null;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    const growKey = edge === "left" ? "ArrowLeft" : "ArrowRight";
    const shrinkKey = edge === "left" ? "ArrowRight" : "ArrowLeft";
    let next: number | null = null;
    if (event.key === growKey) next = width + KEYBOARD_STEP;
    else if (event.key === shrinkKey) next = width - KEYBOARD_STEP;
    else if (event.key === "Home") next = minWidth;
    else if (event.key === "End") next = maxWidth;
    if (next !== null) {
      event.preventDefault();
      onResizeEnd(next);
    }
  }

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={ariaLabel}
      aria-valuenow={width}
      aria-valuemin={minWidth}
      aria-valuemax={maxWidth}
      tabIndex={0}
      data-testid="resize-handle"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
      onDoubleClick={onReset}
      className={clsx(
        "group absolute inset-y-0 z-10 w-2 cursor-col-resize touch-none outline-none",
        edge === "left" ? "-left-1" : "-right-1",
        className
      )}
    >
      <span
        aria-hidden
        className="bg-accent absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100"
      />
    </div>
  );
}
