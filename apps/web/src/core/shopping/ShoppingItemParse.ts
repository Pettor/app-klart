import type { ShoppingCategory } from "./ShoppingCategory";
import { guessCategory } from "./ShoppingCategory";
import { formatTaskLink, toTaskLink } from "~/core/tasks/TaskLink";

export interface ParsedShoppingItem {
  name: string;
  qty: number | null;
  price: number | null;
  link: string | null;
  category: ShoppingCategory;
}

const QUANTITY = [/^(\d+)(?:x|st\.?|pcs)$/i, /^x(\d+)$/i];
const PRICE = /^(\d+(?:[.,]\d+)?)(?:kr|:-|sek)$/i;
const NUMBER = /^\d+(?:[.,]\d+)?$/;

function toNumber(value: string): number {
  return Number(value.replace(",", "."));
}

/**
 * Reads the shopping quick-add line: `2x` or `x2` or `2st` is the quantity, `199kr`, `199 kr` or `199:-` the
 * price, an `http(s)://` or `www.` word the product link. Everything else is the name; a bare link names the
 * item after its site.
 */
export function parseShoppingItem(text: string): ParsedShoppingItem {
  let qty: number | null = null;
  let price: number | null = null;
  let link: string | null = null;
  const words: string[] = [];

  for (const word of text.trim().split(/\s+/).filter(Boolean)) {
    const asLink = toTaskLink(word);
    const quantity = QUANTITY.map((pattern) => word.match(pattern)).find(Boolean);
    const priced = word.match(PRICE);
    if (asLink) {
      link = asLink;
    } else if (quantity) {
      qty = Number(quantity[1]);
    } else if (priced) {
      price = toNumber(priced[1]!);
    } else if (/^(kr|:-|sek)$/i.test(word) && NUMBER.test(words.at(-1) ?? "")) {
      price = toNumber(words.pop()!);
    } else {
      words.push(word);
    }
  }

  const name = words.join(" ") || (link ? formatTaskLink(link) : "");
  return { name, qty: qty && qty > 0 ? qty : null, price, link, category: guessCategory(name) };
}
