import { describe, expect, it } from "vitest";
import { parseItemPrice, parseItemQty, parseShoppingItem } from "./ShoppingItemParse";

describe("parseItemQty", () => {
  it("reads whole numbers of at least one", () => {
    expect(parseItemQty(" 3 ")).toBe(3);
    expect(parseItemQty("0")).toBeNull();
    expect(parseItemQty("1.5")).toBeNull();
    expect(parseItemQty("two")).toBeNull();
  });
});

describe("parseItemPrice", () => {
  it("reads either decimal mark, and free", () => {
    expect(parseItemPrice("25,50")).toBe(25.5);
    expect(parseItemPrice("25.5")).toBe(25.5);
    expect(parseItemPrice("0")).toBe(0);
    expect(parseItemPrice("-1")).toBeNull();
    expect(parseItemPrice("cheap")).toBeNull();
  });
});

describe("parseShoppingItem", () => {
  it("reads a plain name and guesses its store section", () => {
    expect(parseShoppingItem("Mjölk")).toEqual({
      name: "Mjölk",
      qty: null,
      price: null,
      link: null,
      category: "dairy",
    });
  });

  it.each([
    ["2x mjölk", 2],
    ["mjölk x3", 3],
    ["4st glödlampor", 4],
  ])("reads the quantity in %s", (text, qty) => {
    expect(parseShoppingItem(text).qty).toBe(qty);
  });

  it.each([
    ["Pysselbok 149kr", 149],
    ["Pysselbok 149 kr", 149],
    ["Pysselbok 149:-", 149],
    ["Pysselbok 12,50 kr", 12.5],
  ])("reads the price in %s", (text, price) => {
    const parsed = parseShoppingItem(text);
    expect(parsed.price).toBe(price);
    expect(parsed.name).toBe("Pysselbok");
  });

  it("keeps a link and names a bare link after its site", () => {
    expect(parseShoppingItem("Hyllplan https://www.ikea.com/se/sv/p/123").link).toBe(
      "https://www.ikea.com/se/sv/p/123"
    );
    expect(parseShoppingItem("www.ikea.com/se").name).toBe("ikea.com");
  });

  it("leaves numbers that aren't quantities or prices in the name", () => {
    expect(parseShoppingItem("Jord 6 kg").name).toBe("Jord 6 kg");
  });

  it("returns an empty name for an empty line", () => {
    expect(parseShoppingItem("   ").name).toBe("");
  });
});
