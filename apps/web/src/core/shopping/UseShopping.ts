import { useMemo } from "react";
import { useAtomValue } from "jotai";
import type { ShoppingList } from "./ShoppingList";
import { getListContext, isListDeleted, isListOpen } from "./ShoppingList";
import type { KlartContext } from "~/core/contexts/KlartContext";
import { ALL_CONTEXTS } from "~/core/contexts/KlartContext";
import { currentContextAtom, klartDataAtom, todayAtom } from "~/core/tasks/KlartAtoms";

export interface ShoppingState {
  today: string;
  /** Open lists in the selected context (every context under "All contexts"), newest first. */
  openLists: ShoppingList[];
  /** Completed lists, most recently completed first. Deleted lists are in neither. */
  doneLists: ShoppingList[];
  /** Items not bought yet across those open lists. */
  itemsLeft: number;
  /** Ids of the tasks in today's My Day. */
  inTodayIds: Set<string>;
  contexts: KlartContext[];
  /** "All contexts" is selected, so the lists come from every context. */
  isAllContexts: boolean;
}

/** Everything the Shopping page derives from the data. */
export function useShopping(): ShoppingState {
  const data = useAtomValue(klartDataAtom);
  const today = useAtomValue(todayAtom);
  const currentContext = useAtomValue(currentContextAtom);

  return useMemo(() => {
    const lists = Object.values(data.lists).filter(
      (list) => currentContext === ALL_CONTEXTS || getListContext(list, data.contexts) === currentContext
    );
    const openLists = lists.filter(isListOpen).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const doneLists = lists
      .filter((list) => !isListOpen(list) && !isListDeleted(list))
      .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""));
    const inTodayIds = new Set(data.days[today]?.items.map((entry) => entry.taskId));

    return {
      today,
      openLists,
      doneLists,
      itemsLeft: openLists.reduce((sum, list) => sum + list.items.filter((item) => !item.bought).length, 0),
      inTodayIds,
      contexts: data.contexts,
      isAllContexts: currentContext === ALL_CONTEXTS,
    };
  }, [data, today, currentContext]);
}
