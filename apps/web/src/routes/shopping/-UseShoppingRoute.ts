import { useState } from "react";
import { useBreakpoint } from "@package/react";
import { useAtom } from "jotai";
import type { IntlShape } from "react-intl";
import { useIntl } from "react-intl";
import type { ShoppingItemRowItem } from "~/components/display/shopping-item-row/ShoppingItemRow";
import { getShoppingKindLabel } from "~/components/display/shopping-list-card/ShoppingKind";
import type {
  ShoppingListCardList,
  ShoppingListContext,
} from "~/components/display/shopping-list-card/ShoppingListCard";
import type { KlartContext } from "~/core/contexts/KlartContext";
import { findContext } from "~/core/contexts/KlartContext";
import { useHierarchyNavigation } from "~/core/routes/UseHierarchyNavigation";
import { shoppingItemSortsAtom, shoppingListSortAtom } from "~/core/shopping/ShoppingAtoms";
import { parseShoppingItem } from "~/core/shopping/ShoppingItemParse";
import type { ShoppingItem, ShoppingList } from "~/core/shopping/ShoppingList";
import { getListContext, itemTotal, SHOPPING_KIND_COLORS } from "~/core/shopping/ShoppingList";
import type { ShoppingItemSort, ShoppingListBucket, ShoppingListSort } from "~/core/shopping/ShoppingSort";
import {
  SHOPPING_ITEM_SORTS,
  SHOPPING_LIST_SORTS,
  sortShoppingItems,
  sortShoppingLists,
} from "~/core/shopping/ShoppingSort";
import { useShopping } from "~/core/shopping/UseShopping";
import { useShoppingActions } from "~/core/shopping/UseShoppingActions";
import { formatTaskLink } from "~/core/tasks/TaskLink";
import { getItemTaskTitle } from "~/views/shopping/ShoppingLabels";
import type {
  ShoppingEditorItem,
  ShoppingItemGroup,
  ShoppingListGroup,
  ShoppingSelectedList,
} from "~/views/shopping/ShoppingTypes";
import type { ShoppingViewProps } from "~/views/shopping/ShoppingView";

/** The list's context, or `null` when one context is selected and every list shown is in it. */
function toListContext(
  list: ShoppingList,
  contexts: KlartContext[],
  isAllContexts: boolean
): ShoppingListContext | null {
  if (!isAllContexts) {
    return null;
  }
  const id = getListContext(list, contexts);
  const context = findContext(contexts, id);
  return { name: context?.name ?? id, color: context?.color ?? "blue" };
}

function toCard(list: ShoppingList, context: ShoppingListContext | null): ShoppingListCardList {
  return {
    id: list.id,
    name: list.name,
    kind: list.kind,
    color: SHOPPING_KIND_COLORS[list.kind],
    date: list.date,
    total: list.items.length,
    bought: list.items.filter((item) => item.bought).length,
    isCompleted: !!list.completedAt,
    context,
  };
}

function toRow(item: ShoppingItem, inTodayIds: Set<string>): ShoppingItemRowItem {
  return {
    id: item.id,
    name: item.name,
    qty: item.qty,
    total: itemTotal(item),
    link: item.link,
    note: item.note,
    bought: item.bought,
    important: item.important,
    isInMyDay: !!item.taskId && inTodayIds.has(item.taskId),
  };
}

function toEditorItem(item: ShoppingItem, inTodayIds: Set<string>): ShoppingEditorItem {
  return {
    id: item.id,
    name: item.name,
    qty: item.qty,
    price: item.price,
    link: item.link,
    note: item.note,
    category: item.category,
    bought: item.bought,
    important: item.important,
    isInMyDay: !!item.taskId && inTodayIds.has(item.taskId),
  };
}

/** Items to buy, starred first, in the chosen order; by category splits them by store section. */
function toGroups(list: ShoppingList, sort: ShoppingItemSort, inTodayIds: Set<string>): ShoppingItemGroup[] {
  return sortShoppingItems(
    list.items.filter((item) => !item.bought),
    sort
  ).map((bucket) => ({ category: bucket.category, items: bucket.items.map((item) => toRow(item, inTodayIds)) }));
}

/** A heading over the lists of one context or kind. */
function toListGroupHeading(
  intl: IntlShape,
  bucket: ShoppingListBucket,
  sort: ShoppingListSort,
  contexts: KlartContext[]
): Pick<ShoppingListGroup, "label" | "color"> {
  if (bucket.key === null) {
    return { label: null, color: null };
  }
  if (sort === "kind") {
    return { label: getShoppingKindLabel(intl, bucket.key as ShoppingList["kind"]), color: null };
  }
  const context = findContext(contexts, bucket.key);
  return { label: context?.name ?? bucket.key, color: context?.color ?? "blue" };
}

function toSelected(
  list: ShoppingList,
  context: ShoppingListContext | null,
  sort: ShoppingItemSort,
  inTodayIds: Set<string>
): ShoppingSelectedList {
  const totals = list.items.map(itemTotal).filter((total) => total !== null);
  return {
    ...toCard(list, context),
    completedAt: list.completedAt,
    sum: totals.length ? totals.reduce((sum, total) => sum + total, 0) : null,
    groups: toGroups(list, sort, inTodayIds),
    boughtItems: list.items.filter((item) => item.bought).map((item) => toRow(item, inTodayIds)),
  };
}

export function useShoppingRoute(listId: string | null): ShoppingViewProps {
  const intl = useIntl();
  const navigation = useHierarchyNavigation();
  // Below `lg` the lists and the selected list are separate screens; wider, both show side by side.
  const isSplit = useBreakpoint("lg");
  const shopping = useShopping();
  const actions = useShoppingActions();
  const [draft, setDraft] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [storedListSort, setListSort] = useAtom(shoppingListSortAtom);
  const [getItemSort, setItemSort] = useAtom(shoppingItemSortsAtom);

  const { openLists, doneLists, inTodayIds, contexts, isAllContexts } = shopping;
  // By context only means something while lists from every context show.
  const listSort = storedListSort === "context" && !isAllContexts ? "newest" : storedListSort;
  const listBuckets = sortShoppingLists(openLists, listSort, contexts);
  const sortedOpenLists = listBuckets.flatMap((bucket) => bucket.lists);
  // Wide screens always show a list: the one in the URL, or the first open one.
  const list =
    [...openLists, ...doneLists].find((candidate) => candidate.id === listId) ??
    sortedOpenLists[0] ??
    doneLists[0] ??
    null;
  const itemSort = list ? getItemSort(list.kind) : "added";
  // Groceries, and any list grouped by store section, show an item's section and let the editor change it.
  const showsCategory = list?.kind === "grocery" || itemSort === "category";
  const parsed = draft.trim() ? parseShoppingItem(draft) : null;
  // Gone from the list (removed, moved, or another list picked) closes the editor.
  const editingItem = list?.items.find((item) => item.id === editingItemId) ?? null;

  function card(other: ShoppingList): ShoppingListCardList {
    return toCard(other, toListContext(other, contexts, isAllContexts));
  }

  function groupedCard(other: ShoppingList): ShoppingListCardList {
    // Under a context's heading the card doesn't repeat it.
    return listSort === "context" ? toCard(other, null) : card(other);
  }

  function selectList(id: string): void {
    setDraft("");
    setEditingItemId(null);
    // Opening a list from the lists screen is a step down, so Back returns to the lists. Side by side, or when
    // switching lists, it replaces the entry, so Back from any list returns to where Shopping was opened from.
    const open = !isSplit && !listId ? navigation.down : navigation.across;
    open({ to: "/shopping", search: { list: id } });
  }

  function findItem(itemId: string): ShoppingItem | undefined {
    return list?.items.find((item) => item.id === itemId);
  }

  return {
    today: shopping.today,
    openGroups: listBuckets.map((bucket) => ({
      id: bucket.key,
      ...toListGroupHeading(intl, bucket, listSort, contexts),
      lists: bucket.lists.map(groupedCard),
    })),
    doneLists: doneLists.map(card),
    listSort: {
      value: listSort,
      options: SHOPPING_LIST_SORTS.filter((sort) => sort !== "context" || isAllContexts),
      onChange: setListSort,
    },
    itemSort: {
      value: itemSort,
      options: SHOPPING_ITEM_SORTS,
      onChange: (sort) => list && setItemSort(list.kind, sort),
    },
    selected: list ? toSelected(list, toListContext(list, contexts, isAllContexts), itemSort, inTodayIds) : null,
    isListShownOnPhone: !!listId,
    onSelectList: selectList,
    onBackToLists: () => {
      setEditingItemId(null);
      navigation.upTo({ to: "/shopping" });
    },
    newList: {
      onCreate: (name, kind) => selectList(actions.createList(name, kind).id),
    },
    draft: {
      value: draft,
      onChange: setDraft,
      onSubmit: () => {
        if (list && actions.addItem(list.id, draft)) {
          setDraft("");
        }
      },
      preview: parsed?.name
        ? {
            name: parsed.name,
            qty: parsed.qty,
            price: parsed.price,
            linkHost: parsed.link ? formatTaskLink(parsed.link) : null,
            category: showsCategory ? parsed.category : null,
          }
        : null,
    },
    moveTargets: openLists
      .filter((other) => other.id !== list?.id)
      // Lists of the same kind first: leftover groceries most likely go on the next grocery run.
      .sort((a, b) => Number(b.kind === list?.kind) - Number(a.kind === list?.kind))
      .map((other) => ({ id: other.id, name: other.name })),
    itemEditor: {
      item: editingItem && toEditorItem(editingItem, inTodayIds),
      color: list ? SHOPPING_KIND_COLORS[list.kind] : "blue",
      showCategory: showsCategory,
      onChange: (patch) => {
        if (list && editingItem) {
          const qty = patch.qty !== undefined ? patch.qty : editingItem.qty;
          const title = getItemTaskTitle(intl, patch.name ?? editingItem.name, qty);
          actions.updateItem(list.id, editingItem.id, patch, title);
        }
      },
      onClose: () => setEditingItemId(null),
    },
    listActions: {
      onOpenItem: setEditingItemId,
      onToggleBought: (itemId, bought) => list && actions.setBought(list.id, itemId, bought),
      onToggleImportant: (itemId) => list && actions.toggleImportant(list.id, itemId),
      onToggleItemMyDay: (itemId) => {
        const item = findItem(itemId);
        if (!list || !item) {
          return;
        }
        if (item.taskId && inTodayIds.has(item.taskId)) {
          actions.removeItemFromDay(list.id, itemId);
        } else {
          actions.addItemToDay(list.id, itemId, getItemTaskTitle(intl, item.name, item.qty));
        }
      },
      onRemoveItem: (itemId) => list && actions.removeItem(list.id, itemId),
      onComplete: (moveTo) => list && actions.completeList(list.id, moveTo),
      onReopen: () => list && actions.reopenList(list.id),
      onRename: (name) => list && actions.renameList(list.id, name),
      onDelete: () => {
        if (list) {
          actions.deleteList(list.id);
          // Back to the lists, so phones don't jump to some other list.
          navigation.upTo({ to: "/shopping" });
        }
      },
    },
  };
}
