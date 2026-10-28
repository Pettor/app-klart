import { useState } from "react";
import type { ShoppingListActions, ShoppingMoveTarget, ShoppingSelectedList } from "./ShoppingTypes";

export interface ShoppingListPanelState {
  isCartOpen: boolean;
  toggleCart: () => void;
  isCompleting: boolean;
  /** Completes right away when everything is bought; otherwise asks what to do with what's left. */
  askComplete: () => void;
  cancelComplete: () => void;
  moveTarget: string | null;
  setMoveTarget: (listId: string) => void;
  completeMoving: () => void;
  completeAnyway: () => void;
  /** Names of the items not bought, for the complete dialog. */
  leftNames: string[];
  /** The list name being typed while renaming, or `null` when not renaming. */
  nameDraft: string | null;
  startRename: () => void;
  setNameDraft: (name: string) => void;
  commitRename: () => void;
  cancelRename: () => void;
  isDeleting: boolean;
  askDelete: () => void;
  cancelDelete: () => void;
  confirmDelete: () => void;
}

/** The list panel's own state: the cart, renaming, and the complete and delete dialogs. Remount it (`key`) per list. */
export function useShoppingListPanel(
  list: ShoppingSelectedList,
  moveTargets: ShoppingMoveTarget[],
  actions: ShoppingListActions
): ShoppingListPanelState {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const left = list.groups.flatMap((group) => group.items);
  const moveTarget = moveTargets.some((target) => target.id === picked) ? picked : (moveTargets[0]?.id ?? null);

  function complete(moveTo: string | null): void {
    setIsCompleting(false);
    actions.onComplete(moveTo);
  }

  return {
    // A completed list shows what was bought.
    isCartOpen: isCartOpen || list.isCompleted,
    toggleCart: () => setIsCartOpen(!isCartOpen),
    isCompleting: isCompleting && !list.isCompleted,
    askComplete: () => {
      setIsDeleting(false);
      if (left.length === 0) {
        complete(null);
      } else {
        setIsCompleting(true);
      }
    },
    cancelComplete: () => setIsCompleting(false),
    moveTarget,
    setMoveTarget: setPicked,
    completeMoving: () => complete(moveTarget),
    completeAnyway: () => complete(null),
    leftNames: left.map((item) => item.name),
    nameDraft,
    startRename: () => setNameDraft(list.name),
    setNameDraft,
    commitRename: () => {
      if (nameDraft !== null) {
        actions.onRename(nameDraft);
        setNameDraft(null);
      }
    },
    cancelRename: () => setNameDraft(null),
    isDeleting,
    askDelete: () => {
      setIsCompleting(false);
      setIsDeleting(true);
    },
    cancelDelete: () => setIsDeleting(false),
    confirmDelete: () => {
      setIsDeleting(false);
      actions.onDelete();
    },
  };
}
