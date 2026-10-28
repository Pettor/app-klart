import type { ShoppingItemRowItem } from "~/components/display/shopping-item-row/ShoppingItemRow";
import type { ShoppingListCardList } from "~/components/display/shopping-list-card/ShoppingListCard";
import type { ShoppingCategory } from "~/core/shopping/ShoppingCategory";
import type { ShoppingListKind } from "~/core/shopping/ShoppingList";

/** Items not bought yet under one heading: a store section on grocery lists, or `null` for one plain group. */
export interface ShoppingItemGroup {
  category: ShoppingCategory | null;
  items: ShoppingItemRowItem[];
}

export interface ShoppingSelectedList extends ShoppingListCardList {
  /** UTC timestamp the list was completed. */
  completedAt: string | null;
  /** Price times quantity over every item that has a price; `null` when none has. */
  sum: number | null;
  groups: ShoppingItemGroup[];
  /** Items checked off, shown under "In the cart". */
  boughtItems: ShoppingItemRowItem[];
}

/** What the typed item line will become, shown live under the input. */
export interface ShoppingItemPreview {
  name: string;
  qty: number | null;
  price: number | null;
  linkHost: string | null;
  /** The store section it lands in, on grocery lists. */
  category: ShoppingCategory | null;
}

export interface ShoppingDraftProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  preview: ShoppingItemPreview | null;
}

export interface ShoppingListActions {
  onToggleBought: (itemId: string, bought: boolean) => void;
  onToggleImportant: (itemId: string) => void;
  onToggleItemMyDay: (itemId: string) => void;
  onRemoveItem: (itemId: string) => void;
  /** Completes the list; items not bought move to `moveTo`, or stay when it's `null`. */
  onComplete: (moveTo: string | null) => void;
  onReopen: () => void;
  /** Renames the list; a blank name keeps the old one. */
  onRename: (name: string) => void;
  /** Deletes the list, once confirmed. */
  onDelete: () => void;
}

/** Another open list items can move to when a list is completed. */
export interface ShoppingMoveTarget {
  id: string;
  name: string;
}

export interface ShoppingNewListProps {
  onCreate: (name: string, kind: ShoppingListKind) => void;
}
