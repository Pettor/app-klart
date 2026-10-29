import { describe, expect, it } from "vitest";
import { buildShoppingView } from "./AgentViews";
import type { KlartData } from "./KlartData";
import { createEmptyData } from "./KlartData";
import {
  addItemToDay,
  addShoppingItem,
  completeShoppingList,
  createShoppingItem,
  createShoppingList,
  deleteShoppingList,
  setItemBought,
  toggleItemImportant,
  upsertList,
} from "~/core/shopping/ShoppingData";
import { parseShoppingItem } from "~/core/shopping/ShoppingItemParse";

const TODAY = "2026-10-28";
const T0 = new Date("2026-10-28T08:00:00Z");
const T1 = new Date("2026-10-28T09:00:00Z");
const GENERATED = "2026-10-28T10:00:00Z";

function seed(): KlartData {
  let data = upsertList(createEmptyData(), createShoppingList("L1", "Week", "grocery", "personal", null, T0));
  for (const [id, text] of [
    ["milk", "2x mjölk 25 kr"],
    ["bread", "Bröd"],
    ["coffee", "Kaffe 89 kr"],
  ] as const) {
    data = addShoppingItem(data, "L1", createShoppingItem(id, parseShoppingItem(text), T0), T0);
  }
  return data;
}

describe("buildShoppingView", () => {
  it("lists what's left to buy, starred first, with totals and My Day state", () => {
    let data = setItemBought(seed(), "L1", "bread", true, T1);
    data = toggleItemImportant(data, "L1", "coffee", T1);
    data = addItemToDay(data, "L1", "milk", { id: "T1", title: "Buy: mjölk × 2", context: "personal" }, TODAY, T1);

    const view = buildShoppingView(data, TODAY, GENERATED);

    expect(view).toMatchObject({ schema: "klart.view.shopping/v1", date: TODAY, generatedAt: GENERATED, itemsLeft: 2 });
    expect(view.lists[0]).toMatchObject({
      id: "L1",
      name: "Week",
      kind: "grocery",
      context: "personal",
      bought: 1,
      totalLeft: 139,
    });
    expect(view.lists[0]!.items.map((item) => item.id)).toEqual(["coffee", "milk"]);
    expect(view.lists[0]!.items[1]).toMatchObject({ qty: 2, price: 25, total: 50, taskId: "T1", inMyDay: true });
  });

  it("leaves out completed and deleted lists", () => {
    let data = upsertList(seed(), createShoppingList("L2", "Party", "other", "personal", null, T0));
    data = upsertList(data, createShoppingList("L3", "Old", "other", "personal", null, T0));
    data = completeShoppingList(data, "L2", null, TODAY, T1);
    data = deleteShoppingList(data, "L3", TODAY, T1);

    expect(buildShoppingView(data, TODAY, GENERATED).lists.map((list) => list.id)).toEqual(["L1"]);
  });
});
