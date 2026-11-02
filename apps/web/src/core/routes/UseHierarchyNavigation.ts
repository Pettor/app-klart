import { useMemo } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import type { HistoryState, NavigateOptions } from "@tanstack/react-router";

/** History state naming the views each entry was pushed from, so going up can pop instead of push. */
interface HierarchyHistoryState {
  /** Paths of the parent views, outermost first; the last one is the entry right behind. */
  klartParents?: string[];
}

function toHistoryState(parents: string[]): HistoryState {
  return { klartParents: parents } satisfies HierarchyHistoryState as HistoryState;
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
  /**
   * Returns to the nearest parent view at `target.to`, popping every entry above it (Back from a shopping list opened
   * from the lists lands on the lists); with no such parent, replaces the entry with `target`.
   */
  upTo: (target: NavigateOptions & { to: string }) => void;
}

/**
 * Keeps the history stack shaped like the view hierarchy, the way a phone app's Back button works:
 * Back from a task or settings always lands on My Day, never on whatever route happened to come before.
 */
export function useHierarchyNavigation(): HierarchyNavigation {
  const router = useRouter();
  const navigate = useNavigate();

  return useMemo(() => {
    function getParents(): string[] {
      return (router.state.location.state as HierarchyHistoryState).klartParents ?? [];
    }

    return {
      down: (options) =>
        void navigate({ ...options, state: toHistoryState([...getParents(), router.state.location.pathname]) }),
      across: (options) => void navigate({ ...options, replace: true, state: toHistoryState(getParents()) }),
      up: (fallback) => {
        if (getParents().length > 0) {
          router.history.back();
        } else {
          void navigate({ ...fallback, replace: true });
        }
      },
      upTo: (target) => {
        const parents = getParents();
        const index = parents.lastIndexOf(target.to);
        if (index >= 0) {
          router.history.go(index - parents.length);
        } else {
          void navigate({ ...target, replace: true, state: toHistoryState(parents) });
        }
      },
    };
  }, [navigate, router]);
}
