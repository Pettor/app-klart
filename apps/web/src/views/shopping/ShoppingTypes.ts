import type { ShoppingItemRowItem } from "~/components/display/shopping-item-row/ShoppingItemRow";
import type { ShoppingListCardList } from "~/components/display/shopping-list-card/ShoppingListCard";
import type { ContextColor } from "~/core/contexts/KlartContext";
import type { ShoppingCategory } from "~/core/shopping/ShoppingCategory";
import type { ShoppingItemPatch } from "~/core/shopping/ShoppingData";
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

/** Everything the item editor shows and edits. Built by the route hook from a domain `ShoppingItem`. */
export interface ShoppingEditorItem {
  id: string;
  name: string;
  qty: number | null;
  /** Per piece, in kronor. */
  price: number | null;
  link: string | null;
  note: string;
  category: ShoppingCategory;
  bought: boolean;
  important: boolean;
  isInMyDay: boolean;
}

export interface ShoppingItemEditorState {
  /** The item being edited; `null` when the editor is closed. */
  item: ShoppingEditorItem | null;
  /** The list's accent. */
  color: ContextColor;
  /** The list groups by store section, so the editor offers it. */
  showCategory: boolean;
  onChange: (patch: ShoppingItemPatch) => void;
  onClose: () => void;
}

export interface ShoppingListActions {
  /** Opens the item in the editor. */
  onOpenItem: (itemId: string) => void;
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
