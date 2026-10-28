import { expect, test } from "../fixtures";

test.describe("shopping", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("sidebar__shopping").click();
    await expect(page.getByRole("heading", { name: "Shopping" })).toBeVisible();
  });

  test("creates a list, adds items and links one to My Day both ways", async ({ page }) => {
    await page.getByTestId("shopping__new-list-name").fill("Week");
    await page.getByTestId("shopping__create-list").click();
    await expect(page.getByTestId("shopping__list-name")).toHaveText("Week");

    const input = page.getByTestId("shopping__item-input");
    await input.fill("2x mjölk 25 kr");
    await expect(page.getByTestId("shopping__item-preview")).toContainText("to Dairy");
    await input.press("Enter");
    await input.fill("Bröd");
    await input.press("Enter");

    const milk = page.getByTestId("shopping-item").filter({ hasText: "mjölk" });
    await expect(milk).toContainText("× 2");
    await expect(milk).toContainText("50 kr");
    await expect(page.getByRole("heading", { name: "Dairy" })).toBeVisible();

    // Shopping shares My Day's sidebar, with its own row marked as the current page.
    await expect(page.getByTestId("sidebar__shopping")).toHaveAttribute("aria-current", "page");
    await expect(page.getByTestId("sidebar__shopping")).toContainText("2");

    // The sun makes the item a task in My Day.
    await milk.hover();
    await milk.getByTestId("shopping-item__my-day").click();
    await expect(milk.getByTestId("shopping-item__my-day")).toHaveAttribute("aria-pressed", "true");

    // Completing the task in My Day marks the item bought.
    await page.getByTestId("sidebar__view-day").click();
    const row = page.getByTestId("task-row").filter({ hasText: "Buy: mjölk × 2" });
    await expect(row.getByTestId("task-row__shopping")).toHaveText("Week");
    await row.getByRole("button", { name: "Complete task" }).click();
    await expect(row).toHaveCount(0);

    await page.getByTestId("sidebar__shopping").click();
    await expect(page.getByTestId("shopping__progress")).toHaveText("1 of 2 bought");
    await page.getByTestId("shopping__toggle-cart").click();
    await expect(page.getByTestId("shopping__cart")).toContainText("mjölk");
  });

  test("completes a list, moving what's left to another list", async ({ page }) => {
    // With no lists yet the form starts open.
    await page.getByTestId("shopping__new-list-name").fill("Next week");
    await page.getByTestId("shopping__create-list").click();
    await page.getByTestId("shopping__open-new-list").click();
    await page.getByTestId("shopping__new-list-name").fill("Week");
    await page.getByTestId("shopping__create-list").click();
    await expect(page.getByTestId("shopping__list-name")).toHaveText("Week");
    await page.getByTestId("shopping__item-input").fill("Kaffe");
    await page.getByTestId("shopping__item-input").press("Enter");

    await page.getByTestId("shopping__complete-list").click();
    await expect(page.getByTestId("shopping__complete-dialog")).toContainText("1 not bought yet");
    await page.getByTestId("shopping__complete-move").click();
    await expect(page.getByTestId("shopping__reopen-list")).toBeVisible();

    await page.getByTestId("shopping-list-card").filter({ hasText: "Next week" }).click();
    await expect(page.getByTestId("shopping-item")).toContainText("Kaffe");
  });

  test("renames and deletes a list", async ({ page }) => {
    await page.getByTestId("shopping__new-list-name").fill("Week");
    await page.getByTestId("shopping__create-list").click();
    await page.getByTestId("shopping__item-input").fill("Kaffe");
    await page.getByTestId("shopping__item-input").press("Enter");
    await page.getByTestId("shopping-item").hover();
    await page.getByTestId("shopping-item__my-day").click();

    await page.getByTestId("shopping__list-menu").click();
    await page.getByTestId("shopping__rename-list").click();
    await page.getByTestId("shopping__rename-input").fill("Weekend");
    await page.getByTestId("shopping__rename-input").press("Enter");
    await expect(page.getByTestId("shopping__list-name")).toHaveText("Weekend");
    await expect(page.getByTestId("shopping-list-card")).toContainText("Weekend");

    // Renaming survives a reload.
    await page.reload();
    await expect(page.getByTestId("shopping__list-name")).toHaveText("Weekend");

    await page.getByTestId("shopping__list-menu").click();
    await page.getByTestId("shopping__delete-list").click();
    await expect(page.getByTestId("shopping__delete-dialog")).toContainText("Its item goes with it");
    await page.getByTestId("shopping__delete-confirm").click();
    await expect(page.getByTestId("shopping-list-card")).toHaveCount(0);
    await expect(page.getByTestId("sidebar__shopping")).not.toContainText("1");

    // The item's task leaves My Day with the list.
    await page.getByTestId("sidebar__view-day").click();
    await expect(page.getByTestId("task-row").filter({ hasText: "Kaffe" })).toHaveCount(0);
  });
});
