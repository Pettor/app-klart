import { useState } from "react";
import { useLocalStorage } from "@package/react";

export interface UseResizableWidthOptions {
  /** localStorage key the chosen width is persisted under. */
  storageKey: string;
  defaultWidth: number;
  minWidth: number;
  /** Upper bound as a fraction of the viewport width. */
  maxViewportFraction?: number;
}

export interface UseResizableWidthResult {
  width: number;
  minWidth: number;
  maxWidth: number;
  isResizing: boolean;
  /** Updates the width while dragging without persisting it. */
  onResize: (width: number) => void;
  /** Persists the width once the drag (or key press) is done. */
  onResizeEnd: (width: number) => void;
  onReset: () => void;
}

/** Width state for a resizable panel; persisted to localStorage when a resize ends. */
export function useResizableWidth({
  storageKey,
  defaultWidth,
  minWidth,
  maxViewportFraction = 0.6,
}: UseResizableWidthOptions): UseResizableWidthResult {
  const [storedWidth, setStoredWidth] = useLocalStorage(storageKey, defaultWidth);
  const [draftWidth, setDraftWidth] = useState<number | null>(null);
  const maxWidth = Math.max(minWidth, Math.round(window.innerWidth * maxViewportFraction));

  function clamp(width: number): number {
    return Math.min(maxWidth, Math.max(minWidth, Math.round(width)));
  }

  return {
    width: clamp(draftWidth ?? storedWidth),
    minWidth,
    maxWidth,
    isResizing: draftWidth !== null,
    onResize: (width) => setDraftWidth(clamp(width)),
    onResizeEnd: (width) => {
      setStoredWidth(clamp(width));
      setDraftWidth(null);
    },
    onReset: () => {
      setStoredWidth(defaultWidth);
      setDraftWidth(null);
    },
  };
}
