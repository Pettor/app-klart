import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { ShoppingListKind } from "./ShoppingList";
import type { ShoppingItemSort, ShoppingListSort } from "./ShoppingSort";
import { getDefaultItemSort, SHOPPING_ITEM_SORTS, SHOPPING_LIST_SORTS } from "./ShoppingSort";

const storedListSortAtom = atomWithStorage<string>("klart-shopping-list-sort", "newest", undefined, {
  getOnInit: true,
});

/** How the lists column orders the open lists. Remembered per device. */
export const shoppingListSortAtom = atom(
  (get): ShoppingListSort => {
    const stored = get(storedListSortAtom);
    return (SHOPPING_LIST_SORTS as readonly string[]).includes(stored) ? (stored as ShoppingListSort) : "newest";
  },
  (_get, set, sort: ShoppingListSort) => set(storedListSortAtom, sort)
);

const storedItemSortsAtom = atomWithStorage<Partial<Record<ShoppingListKind, string>>>(
  "klart-shopping-item-sort",
  {},
  undefined,
  { getOnInit: true }
);

/** How each kind of list orders its items, e.g. groceries by store section. Remembered per device. */
export const shoppingItemSortsAtom = atom(
  (get) => {
    const stored = get(storedItemSortsAtom);
    return (kind: ShoppingListKind): ShoppingItemSort => {
      const sort = stored[kind];
      return sort && (SHOPPING_ITEM_SORTS as readonly string[]).includes(sort)
        ? (sort as ShoppingItemSort)
        : getDefaultItemSort(kind);
    };
  },
  (get, set, kind: ShoppingListKind, sort: ShoppingItemSort) =>
    set(storedItemSortsAtom, { ...get(storedItemSortsAtom), [kind]: sort })
);
