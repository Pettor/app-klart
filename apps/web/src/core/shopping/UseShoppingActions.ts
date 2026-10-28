import { useCallback, useMemo } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import type { ShoppingItemPatch } from "./ShoppingData";
import {
  addItemToDay,
  addShoppingItem,
  completeShoppingList,
  createShoppingItem,
  createShoppingList,
  deleteShoppingList,
  reconcileShoppingTasks,
  removeItemFromDay,
  removeShoppingItem,
  renameShoppingList,
  reopenShoppingList,
  setItemBought,
  toggleItemImportant,
  updateShoppingItem,
  upsertList,
} from "./ShoppingData";
import { parseShoppingItem } from "./ShoppingItemParse";
import type { ShoppingList, ShoppingListKind } from "./ShoppingList";
import { ALL_CONTEXTS, getDefaultContextId } from "~/core/contexts/KlartContext";
import { currentContextAtom, klartDataAtom, todayAtom } from "~/core/tasks/KlartAtoms";
import type { KlartData } from "~/core/tasks/KlartData";
import { createTaskId } from "~/core/tasks/TaskId";

export interface ShoppingActions {
  createList: (name: string, kind: ShoppingListKind) => ShoppingList;
  /** Parses a quick-add line (`2x milk`, `199 kr`, a link) and adds the item. Returns `false` for an empty name. */
  addItem: (listId: string, text: string) => boolean;
  updateItem: (listId: string, itemId: string, patch: ShoppingItemPatch) => void;
  setBought: (listId: string, itemId: string, bought: boolean) => void;
  toggleImportant: (listId: string, itemId: string) => void;
  removeItem: (listId: string, itemId: string) => void;
  /** Makes the item a task in today's My Day, titled `title`. */
  addItemToDay: (listId: string, itemId: string, title: string) => void;
  removeItemFromDay: (listId: string, itemId: string) => void;
  /** Completes the list; items not bought move to `moveTo`, or stay behind when it's `null`. */
  completeList: (listId: string, moveTo: string | null) => void;
  reopenList: (listId: string) => void;
  /** Renames the list; a blank name is ignored. */
  renameList: (listId: string, name: string) => void;
  /** Deletes the list and archives the My Day tasks made from it. */
  deleteList: (listId: string) => void;
}

/** All mutations of shopping lists. Linked My Day tasks follow along. */
export function useShoppingActions(): ShoppingActions {
  const setData = useSetAtom(klartDataAtom);
  const data = useAtomValue(klartDataAtom);
  const currentContext = useAtomValue(currentContextAtom);
  const today = useAtomValue(todayAtom);

  const change = useCallback(
    (fn: (current: KlartData, now: Date) => KlartData) => {
      setData((current) => reconcileShoppingTasks(fn(current, new Date())));
    },
    [setData]
  );

  // Tasks made from a list land in the selected context, or the first one under "All contexts".
  const taskContext =
    currentContext !== ALL_CONTEXTS && data.contexts.some((context) => context.id === currentContext)
      ? currentContext
      : getDefaultContextId(data.contexts);

  return useMemo(
    () => ({
      createList: (name, kind) => {
        const now = new Date();
        const list = createShoppingList(createTaskId(now.getTime()), name.trim(), kind, null, now);
        change((current) => upsertList(current, list));
        return list;
      },
      addItem: (listId, text) => {
        const parsed = parseShoppingItem(text);
        if (!parsed.name) {
          return false;
        }
        change((current, now) =>
          addShoppingItem(current, listId, createShoppingItem(createTaskId(now.getTime()), parsed, now), now)
        );
        return true;
      },
      updateItem: (listId, itemId, patch) =>
        change((current, now) => updateShoppingItem(current, listId, itemId, patch, now)),
      setBought: (listId, itemId, bought) =>
        change((current, now) => setItemBought(current, listId, itemId, bought, now)),
      toggleImportant: (listId, itemId) => change((current, now) => toggleItemImportant(current, listId, itemId, now)),
      removeItem: (listId, itemId) => change((current, now) => removeShoppingItem(current, listId, itemId, today, now)),
      addItemToDay: (listId, itemId, title) =>
        change((current, now) =>
          addItemToDay(
            current,
            listId,
            itemId,
            { id: createTaskId(now.getTime()), title, context: taskContext },
            today,
            now
          )
        ),
      removeItemFromDay: (listId, itemId) =>
        change((current, now) => removeItemFromDay(current, listId, itemId, today, now)),
      completeList: (listId, moveTo) =>
        change((current, now) => completeShoppingList(current, listId, moveTo, today, now)),
      reopenList: (listId) => change((current, now) => reopenShoppingList(current, listId, now)),
      renameList: (listId, name) => change((current, now) => renameShoppingList(current, listId, name, now)),
      deleteList: (listId) => change((current, now) => deleteShoppingList(current, listId, today, now)),
    }),
    [change, taskContext, today]
  );
}
