import { useMemo } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import type { HistoryState, NavigateOptions } from "@tanstack/react-router";

/** History-state flag set on entries pushed from their parent view, so going up can pop instead of push. */
interface HierarchyHistoryState {
  klartHasParent?: boolean;
}

function toHistoryState(hasParent: boolean): HistoryState {
  return { klartHasParent: hasParent } satisfies HierarchyHistoryState as HistoryState;
}

export interface HierarchyNavigation {
  /** Opens a child view (settings, a task); Back returns to the current view. */
  down: (options: NavigateOptions) => void;
  /** Swaps the current view for a sibling (another task) without adding a history entry. */
  across: (options: NavigateOptions) => void;
  /**
   * Returns to the parent view. Pops the history entry when the parent is right behind it, so Back
   * never cycles between views like a browser would; otherwise (a deep link, a reload) replaces it.
   */
  up: (fallback: NavigateOptions) => void;
}

/**
 * Keeps the history stack shaped like the view hierarchy, the way a phone app's Back button works:
 * Back from a task or settings always lands on My Day, never on whatever route happened to come before.
 */
export function useHierarchyNavigation(): HierarchyNavigation {
  const router = useRouter();
  const navigate = useNavigate();

  return useMemo(() => {
    function hasParent(): boolean {
      return (router.state.location.state as HierarchyHistoryState).klartHasParent === true;
    }

    return {
      down: (options) => void navigate({ ...options, state: toHistoryState(true) }),
      across: (options) => void navigate({ ...options, replace: true, state: toHistoryState(hasParent()) }),
      up: (fallback) => {
        if (hasParent()) {
          router.history.back();
        } else {
          void navigate({ ...fallback, replace: true });
        }
      },
    };
  }, [navigate, router]);
}
