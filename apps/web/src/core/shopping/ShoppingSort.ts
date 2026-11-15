import type { ShoppingCategory } from "./ShoppingCategory";
import { SHOPPING_CATEGORIES } from "./ShoppingCategory";
import type { ShoppingItem, ShoppingList, ShoppingListKind } from "./ShoppingList";
import { getListContext, SHOPPING_LIST_KINDS } from "./ShoppingList";
import type { KlartContext } from "~/core/contexts/KlartContext";

/** How the lists column orders the open lists. `context` and `kind` also group them under headings. */
export const SHOPPING_LIST_SORTS = ["newest", "name", "context", "kind"] as const;

export type ShoppingListSort = (typeof SHOPPING_LIST_SORTS)[number];

/** How a list orders the items left to buy. `category` groups them by store section. */
export const SHOPPING_ITEM_SORTS = ["category", "name", "added"] as const;

export type ShoppingItemSort = (typeof SHOPPING_ITEM_SORTS)[number];

/** Lists under one heading: a context id, a kind, or `null` for one plain group. */
export interface ShoppingListBucket {
  key: string | null;
  lists: ShoppingList[];
}

/** Items under one heading: a store section, or `null` for one plain group. */
export interface ShoppingItemBucket {
  category: ShoppingCategory | null;
  items: ShoppingItem[];
}

/** Groceries walk the store by section; other lists keep the order things were added. */
export function getDefaultItemSort(kind: ShoppingListKind): ShoppingItemSort {
  return kind === "grocery" ? "category" : "added";
}

function byName<T extends { name: string }>(a: T, b: T): number {
  return a.name.localeCompare(b.name, undefined, { sensitivity: "base", numeric: true });
}

/**
 * Orders open lists for the lists column. `lists` come newest first; grouping keeps that order inside each group,
 * with contexts in their own order and kinds in {@link SHOPPING_LIST_KINDS} order. Empty groups are left out.
 */
export function sortShoppingLists(
  lists: ShoppingList[],
  sort: ShoppingListSort,
  contexts: KlartContext[]
): ShoppingListBucket[] {
  if (!lists.length) {
    return [];
  }
  switch (sort) {
    case "newest":
      return [{ key: null, lists }];
    case "name":
      return [{ key: null, lists: [...lists].sort(byName) }];
    case "context": {
      const ids = [
        ...new Set([...contexts.map((context) => context.id), ...lists.map((list) => getListContext(list, contexts))]),
      ];
      return ids
        .map((id) => ({ key: id, lists: lists.filter((list) => getListContext(list, contexts) === id) }))
        .filter((bucket) => bucket.lists.length > 0);
    }
    case "kind":
      return SHOPPING_LIST_KINDS.map((kind) => ({
        key: kind,
        lists: lists.filter((list) => list.kind === kind),
      })).filter((bucket) => bucket.lists.length > 0);
  }
}

/** Orders the items left to buy, starred first in every order. `category` groups them in walking order. */
export function sortShoppingItems(items: ShoppingItem[], sort: ShoppingItemSort): ShoppingItemBucket[] {
  const sorted = sort === "name" ? [...items].sort(byName) : items;
  const ordered = [...sorted.filter((item) => item.important), ...sorted.filter((item) => !item.important)];
  if (!ordered.length) {
    return [];
  }
  if (sort !== "category") {
    return [{ category: null, items: ordered }];
  }
  return SHOPPING_CATEGORIES.map((category) => ({
    category,
    items: ordered.filter((item) => item.category === category),
  })).filter((bucket) => bucket.items.length > 0);
}
