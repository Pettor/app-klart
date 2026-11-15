import { describe, expect, it } from "vitest";
import { createShoppingItem, createShoppingList } from "./ShoppingData";
import { parseShoppingItem } from "./ShoppingItemParse";
import type { ShoppingItem } from "./ShoppingList";
import { getDefaultItemSort, sortShoppingItems, sortShoppingLists } from "./ShoppingSort";
import type { KlartContext } from "~/core/contexts/KlartContext";

const T0 = new Date("2026-10-28T08:00:00Z");
const CONTEXTS: KlartContext[] = [
  { id: "personal", name: "Personal", color: "blue", tag: "personal" },
  { id: "work", name: "Work", color: "orange", tag: "work" },
];

function item(id: string, line: string, important = false): ShoppingItem {
  return { ...createShoppingItem(id, parseShoppingItem(line), T0), important };
}

// Newest first, as the lists column gets them.
const LISTS = [
  createShoppingList("L1", "week", "grocery", "work", null, T0),
  createShoppingList("L2", "Birthday", "gift", "personal", null, T0),
  createShoppingList("L3", "Apartment", "home", "work", null, T0),
  // From before lists had a context.
  { ...createShoppingList("L4", "Old list", "grocery", "work", null, T0), context: null },
];

function ids(buckets: { key: string | null; lists: { id: string }[] }[]): [string | null, string[]][] {
  return buckets.map((bucket) => [bucket.key, bucket.lists.map((list) => list.id)]);
}

describe("sortShoppingLists", () => {
  it("keeps newest first in one group", () => {
    expect(ids(sortShoppingLists(LISTS, "newest", CONTEXTS))).toEqual([[null, ["L1", "L2", "L3", "L4"]]]);
  });

  it("sorts by name, ignoring case", () => {
    expect(ids(sortShoppingLists(LISTS, "name", CONTEXTS))).toEqual([[null, ["L3", "L2", "L4", "L1"]]]);
  });

  it("groups by context in the contexts' order; lists without one go to the first context", () => {
    expect(ids(sortShoppingLists(LISTS, "context", CONTEXTS))).toEqual([
      ["personal", ["L2", "L4"]],
      ["work", ["L1", "L3"]],
    ]);
  });

  it("groups by kind, leaving out kinds with no list", () => {
    expect(ids(sortShoppingLists(LISTS, "kind", CONTEXTS))).toEqual([
      ["grocery", ["L1", "L4"]],
      ["gift", ["L2"]],
      ["home", ["L3"]],
    ]);
  });

  it("returns no groups without lists", () => {
    expect(sortShoppingLists([], "kind", CONTEXTS)).toEqual([]);
  });
});

describe("sortShoppingItems", () => {
  const items = [item("a", "Tomater"), item("b", "Bröd"), item("c", "Mjölk", true), item("d", "Bananer")];

  function names(sort: Parameters<typeof sortShoppingItems>[1]): [string | null, string[]][] {
    return sortShoppingItems(items, sort).map((bucket) => [bucket.category, bucket.items.map((entry) => entry.id)]);
  }

  it("keeps the order added, starred first", () => {
    expect(names("added")).toEqual([[null, ["c", "a", "b", "d"]]]);
  });

  it("sorts by name, starred first", () => {
    expect(names("name")).toEqual([[null, ["c", "d", "b", "a"]]]);
  });

  it("groups by store section in walking order", () => {
    expect(names("category")).toEqual([
      ["produce", ["a", "d"]],
      ["dairy", ["c"]],
      ["bread", ["b"]],
    ]);
  });

  it("defaults groceries to store sections and other lists to the order added", () => {
    expect(getDefaultItemSort("grocery")).toBe("category");
    expect(getDefaultItemSort("gift")).toBe("added");
  });
});
