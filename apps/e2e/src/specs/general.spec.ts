import { expect, test } from "../fixtures";

test.describe("general.myday", () => {
  test("renders My Day", async ({ page }) => {
    await page.goto("/");

    await expect(async () => {
      expect(await page.title()).toBe("My Day · Klart");
    }).toPass();

    await expect(page.getByRole("heading", { name: "My Day" })).toBeVisible();
  });

  test("navigates home from the not found page", async ({ page }) => {
    await page.goto("/#/does-not-exist");

    await expect(page.getByText("Page could not be found")).toBeVisible();
    await page.getByRole("button", { name: "Go home" }).click();

    await expect(async () => {
      expect(await page.title()).toBe("My Day · Klart");
    }).toPass();
  });
});

test.describe("general.commandpalette", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");

    await expect(async () => {
      expect(await page.title()).toBe("My Day · Klart");
    }).toPass();

    await page.keyboard.press("ControlOrMeta+K");
    await expect(page.getByTestId("command-palette__search")).toBeVisible();
  });

  test("switches to dark theme via command palette", async ({ page }) => {
    await page.getByTestId("command-palette__search").fill("dark");
    const darkItem = page.getByTestId("command-palette__item-theme-dark");
    await expect(darkItem).toBeVisible();
    await darkItem.click();

    await expect(page.locator("html")).toHaveClass("dark");
  });

  test("shows no results for unmatched search query", async ({ page }) => {
    await page.getByTestId("command-palette__search").fill("zzznomatch");
    await expect(page.getByText("No commands found")).toBeVisible();
  });
});
