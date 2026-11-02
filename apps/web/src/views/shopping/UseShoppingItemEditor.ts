import { useState } from "react";
import type { ShoppingEditorItem } from "./ShoppingTypes";
import type { ShoppingItemPatch } from "~/core/shopping/ShoppingData";
import { parseItemPrice, parseItemQty } from "~/core/shopping/ShoppingItemParse";
import { toTaskLink } from "~/core/tasks/TaskLink";

export interface ShoppingItemEditorDrafts {
  name: string;
  setName: (value: string) => void;
  commitName: () => void;
  qty: string;
  setQty: (value: string) => void;
  isQtyInvalid: boolean;
  commitQty: () => void;
  price: string;
  setPrice: (value: string) => void;
  isPriceInvalid: boolean;
  commitPrice: () => void;
  link: string;
  setLink: (value: string) => void;
  isLinkInvalid: boolean;
  commitLink: () => void;
  note: string;
  setNote: (value: string) => void;
  commitNote: () => void;
}

function formatNumber(value: number | null): string {
  return value === null ? "" : String(value);
}

/**
 * Text fields keep a local draft and save on blur (or Enter), so typing doesn't write the list file on every
 * keystroke. A draft that can't be read stays in its field, marked invalid, and isn't saved. Mount with
 * `key={item.id}` to reset drafts per item.
 */
export function useShoppingItemEditor(
  item: ShoppingEditorItem,
  onChange: (patch: ShoppingItemPatch) => void
): ShoppingItemEditorDrafts {
  const [name, setName] = useState(item.name);
  const [qty, setQty] = useState(formatNumber(item.qty));
  const [isQtyInvalid, setIsQtyInvalid] = useState(false);
  const [price, setPrice] = useState(formatNumber(item.price));
  const [isPriceInvalid, setIsPriceInvalid] = useState(false);
  const [link, setLink] = useState(item.link ?? "");
  const [isLinkInvalid, setIsLinkInvalid] = useState(false);
  const [note, setNote] = useState(item.note);

  function commitName(): void {
    const next = name.replace(/\s+/g, " ").trim();
    if (!next) {
      setName(item.name);
    } else if (next !== item.name) {
      onChange({ name: next });
    }
  }

  function commitQty(): void {
    const next = qty.trim() ? parseItemQty(qty) : null;
    const isInvalid = !!qty.trim() && next === null;
    setIsQtyInvalid(isInvalid);
    if (!isInvalid && next !== item.qty) {
      onChange({ qty: next });
    }
  }

  function commitPrice(): void {
    const next = price.trim() ? parseItemPrice(price) : null;
    const isInvalid = !!price.trim() && next === null;
    setIsPriceInvalid(isInvalid);
    if (!isInvalid && next !== item.price) {
      onChange({ price: next });
    }
  }

  function commitLink(): void {
    const next = link.trim() ? toTaskLink(link.trim()) : null;
    const isInvalid = !!link.trim() && next === null;
    setIsLinkInvalid(isInvalid);
    if (isInvalid) {
      return;
    }
    setLink(next ?? "");
    if (next !== item.link) {
      onChange({ link: next });
    }
  }

  function commitNote(): void {
    if (note !== item.note) {
      onChange({ note });
    }
  }

  return {
    name,
    setName,
    commitName,
    qty,
    setQty: (value) => {
      setQty(value);
      setIsQtyInvalid(false);
    },
    isQtyInvalid,
    commitQty,
    price,
    setPrice: (value) => {
      setPrice(value);
      setIsPriceInvalid(false);
    },
    isPriceInvalid,
    commitPrice,
    link,
    setLink: (value) => {
      setLink(value);
      setIsLinkInvalid(false);
    },
    isLinkInvalid,
    commitLink,
    note,
    setNote,
    commitNote,
  };
}
