import { useState } from "react";
import { useIntl } from "react-intl";
import type { ShoppingItemRowItem } from "~/components/display/shopping-item-row/ShoppingItemRow";
import type {
  ShoppingListCardList,
  ShoppingListContext,
} from "~/components/display/shopping-list-card/ShoppingListCard";
import type { KlartContext } from "~/core/contexts/KlartContext";
import { findContext } from "~/core/contexts/KlartContext";
import { useHierarchyNavigation } from "~/core/routes/UseHierarchyNavigation";
import { SHOPPING_CATEGORIES } from "~/core/shopping/ShoppingCategory";
import { parseShoppingItem } from "~/core/shopping/ShoppingItemParse";
import type { ShoppingItem, ShoppingList } from "~/core/shopping/ShoppingList";
import { getListContext, itemTotal, SHOPPING_KIND_COLORS } from "~/core/shopping/ShoppingList";
import { useShopping } from "~/core/shopping/UseShopping";
import { useShoppingActions } from "~/core/shopping/UseShoppingActions";
import { formatTaskLink } from "~/core/tasks/TaskLink";
import { getItemTaskTitle } from "~/views/shopping/ShoppingLabels";
import type { ShoppingItemGroup, ShoppingSelectedList } from "~/views/shopping/ShoppingTypes";
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

/** Items to buy, starred first. Grocery lists split them by store section, in walking order. */
function toGroups(list: ShoppingList, inTodayIds: Set<string>): ShoppingItemGroup[] {
  const left = list.items.filter((item) => !item.bought);
  const ordered = [...left.filter((item) => item.important), ...left.filter((item) => !item.important)];
  if (list.kind !== "grocery") {
    return ordered.length ? [{ category: null, items: ordered.map((item) => toRow(item, inTodayIds)) }] : [];
  }
  return SHOPPING_CATEGORIES.map((category) => ({
    category,
    items: ordered.filter((item) => item.category === category).map((item) => toRow(item, inTodayIds)),
  })).filter((group) => group.items.length > 0);
}

function toSelected(
  list: ShoppingList,
  context: ShoppingListContext | null,
  inTodayIds: Set<string>
): ShoppingSelectedList {
  const totals = list.items.map(itemTotal).filter((total) => total !== null);
  return {
    ...toCard(list, context),
    completedAt: list.completedAt,
    sum: totals.length ? totals.reduce((sum, total) => sum + total, 0) : null,
    groups: toGroups(list, inTodayIds),
    boughtItems: list.items.filter((item) => item.bought).map((item) => toRow(item, inTodayIds)),
  };
}

export function useShoppingRoute(listId: string | null): ShoppingViewProps {
  const intl = useIntl();
  const navigation = useHierarchyNavigation();
  const shopping = useShopping();
  const actions = useShoppingActions();
  const [draft, setDraft] = useState("");

  const { openLists, doneLists, inTodayIds, contexts, isAllContexts } = shopping;
  // Wide screens always show a list: the one in the URL, or the newest open one.
  const list =
    [...openLists, ...doneLists].find((candidate) => candidate.id === listId) ?? openLists[0] ?? doneLists[0] ?? null;
  const parsed = draft.trim() ? parseShoppingItem(draft) : null;

  function card(other: ShoppingList): ShoppingListCardList {
    return toCard(other, toListContext(other, contexts, isAllContexts));
  }

  function selectList(id: string): void {
    setDraft("");
    // Shopping is one entry in the history like a smart view, so Back from any list returns to My Day.
    navigation.across({ to: "/shopping", search: { list: id } });
  }

  function findItem(itemId: string): ShoppingItem | undefined {
    return list?.items.find((item) => item.id === itemId);
  }

  return {
    today: shopping.today,
    openLists: openLists.map(card),
    doneLists: doneLists.map(card),
    selected: list ? toSelected(list, toListContext(list, contexts, isAllContexts), inTodayIds) : null,
    isListShownOnPhone: !!listId,
    onSelectList: selectList,
    onBackToLists: () => navigation.across({ to: "/shopping" }),
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
            category: list?.kind === "grocery" ? parsed.category : null,
          }
        : null,
    },
    moveTargets: openLists
      .filter((other) => other.id !== list?.id)
      // Lists of the same kind first: leftover groceries most likely go on the next grocery run.
      .sort((a, b) => Number(b.kind === list?.kind) - Number(a.kind === list?.kind))
      .map((other) => ({ id: other.id, name: other.name })),
    listActions: {
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
          navigation.across({ to: "/shopping" });
        }
      },
    },
  };
}
