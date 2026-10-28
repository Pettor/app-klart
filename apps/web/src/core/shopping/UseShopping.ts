import { useMemo } from "react";
import { useAtomValue } from "jotai";
import type { ShoppingList } from "./ShoppingList";
import { isListDeleted, isListOpen } from "./ShoppingList";
import { klartDataAtom, todayAtom } from "~/core/tasks/KlartAtoms";

export interface ShoppingState {
  today: string;
  /** Open lists, newest first. */
  openLists: ShoppingList[];
  /** Completed lists, most recently completed first. Deleted lists are in neither. */
  doneLists: ShoppingList[];
  /** Items not bought yet across every open list. */
  itemsLeft: number;
  /** Ids of the tasks in today's My Day. */
  inTodayIds: Set<string>;
}

/** Everything the Shopping page derives from the data. */
export function useShopping(): ShoppingState {
  const data = useAtomValue(klartDataAtom);
  const today = useAtomValue(todayAtom);

  return useMemo(() => {
    const lists = Object.values(data.lists);
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
    };
  }, [data, today]);
}
