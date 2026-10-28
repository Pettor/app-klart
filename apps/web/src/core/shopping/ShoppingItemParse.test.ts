import { describe, expect, it } from "vitest";
import { parseShoppingItem } from "./ShoppingItemParse";

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
    expect(parseShoppingItem("Brandsläckare 6 kg").name).toBe("Brandsläckare 6 kg");
  });

  it("returns an empty name for an empty line", () => {
    expect(parseShoppingItem("   ").name).toBe("");
  });
});
