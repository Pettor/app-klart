import { z } from "zod";
import type { ShoppingCategory } from "./ShoppingCategory";
import { SHOPPING_CATEGORIES } from "./ShoppingCategory";
import type { ContextColor } from "~/core/contexts/KlartContext";
import { toTaskLink } from "~/core/tasks/TaskLink";

export const SHOPPING_LIST_SCHEMA = "klart.list/v1";

/** What a list is for. Groceries group their items by store section; the others keep the order added. */
export const SHOPPING_LIST_KINDS = ["grocery", "gift", "home", "other"] as const;

export type ShoppingListKind = (typeof SHOPPING_LIST_KINDS)[number];

/** Each kind's accent, as a context color so it gets the `.ctx-<color>` palette. */
export const SHOPPING_KIND_COLORS: Record<ShoppingListKind, ContextColor> = {
  grocery: "green",
  gift: "pink",
  home: "orange",
  other: "violet",
};

export interface ShoppingItem {
  id: string;
  name: string;
  /** How many; `null` means one. */
  qty: number | null;
  /** Price per piece, in kronor. */
  price: number | null;
  /** An `http(s)://` link to the product. */
  link: string | null;
  note: string;
  /** Store section, used to group grocery lists. */
  category: ShoppingCategory;
  bought: boolean;
  important: boolean;
  /** The My Day task made from this item, while it's linked. */
  taskId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** One shopping list with its items, stored as `lists/<id>.json` in the data folder. */
export interface ShoppingList {
  schema: typeof SHOPPING_LIST_SCHEMA;
  id: string;
  name: string;
  kind: ShoppingListKind;
  /** Local date `YYYY-MM-DD` the list is for, e.g. a birthday. */
  date: string | null;
  /** Set when the list is completed; completed lists are kept and can be reopened. */
  completedAt: string | null;
  /**
   * Set when the list is deleted. The file stays, so the deletion syncs to other devices instead of the list
   * coming back from them; deleted lists are hidden everywhere.
   */
  deletedAt: string | null;
  /** The My Day task that opens this list, while it's linked. */
  taskId: string | null;
  items: ShoppingItem[];
  createdAt: string;
  updatedAt: string;
}

const nullableString = z.string().nullable().catch(null);
const nullableCount = z.number().positive().nullable().catch(null);

export const ShoppingItemSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  qty: nullableCount,
  price: z.number().nonnegative().nullable().catch(null),
  link: z
    .string()
    .nullable()
    .transform((value) => (value ? toTaskLink(value.trim()) : null))
    .catch(null),
  note: z.string().catch(""),
  category: z.enum(SHOPPING_CATEGORIES).catch("other"),
  bought: z.boolean().catch(false),
  important: z.boolean().catch(false),
  taskId: nullableString,
  createdAt: z.string().catch(""),
  updatedAt: z.string().catch(""),
});

/** Lenient schema for list files written by people, scripts or agents. */
export const ShoppingListFileSchema = z.object({
  schema: z.literal(SHOPPING_LIST_SCHEMA).catch(SHOPPING_LIST_SCHEMA),
  id: z.string().min(1),
  name: z.string(),
  kind: z.enum(SHOPPING_LIST_KINDS).catch("other"),
  date: nullableString,
  completedAt: nullableString,
  deletedAt: nullableString,
  taskId: nullableString,
  items: z
    .array(z.unknown())
    .catch([])
    .transform((items) =>
      items.flatMap((item) => {
        const parsed = ShoppingItemSchema.safeParse(item);
        return parsed.success ? [parsed.data] : [];
      })
    ),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export function isListDeleted(list: ShoppingList): boolean {
  return !!list.deletedAt;
}

export function isListOpen(list: ShoppingList): boolean {
  return !list.completedAt && !list.deletedAt;
}

/** What the item costs in all, price times quantity; `null` without a price. */
export function itemTotal(item: ShoppingItem): number | null {
  return item.price === null ? null : item.price * (item.qty ?? 1);
}
