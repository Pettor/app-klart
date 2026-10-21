import { expect, test } from "../fixtures";

test.describe("myday.quickadd", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("quick-add__input")).toBeVisible();
  });

  test("adds a task with quick-add syntax and routes it to its context", async ({ page }) => {
    const input = page.getByTestId("quick-add__input");
    await input.fill("#work #acme @tomorrow ! prepare sprint planning");

    const preview = page.getByTestId("quick-add__preview");
    await expect(preview).toContainText("Prepare sprint planning");
    await expect(preview).toContainText("Work");
    await expect(preview).toContainText("Important");

    await input.press("Enter");
    await expect(input).toHaveValue("");

    const row = page.getByTestId("task-row").filter({ hasText: "Prepare sprint planning" });
    await expect(row).toBeVisible();
    await expect(row).toContainText("Tomorrow");
    await expect(row).toContainText("#acme");
  });

  test("completes a task and keeps it under Completed", async ({ page }) => {
    const input = page.getByTestId("quick-add__input");
    await input.fill("water the plants");
    await input.press("Enter");

    const row = page.getByTestId("task-row").filter({ hasText: "Water the plants" });
    await row.getByRole("button", { name: "Complete task" }).click();

    await expect(page.getByText("Completed 1")).toBeVisible();
    await expect(row.getByRole("button", { name: "Mark not completed" })).toBeVisible();
  });

  test("keeps tasks after a reload", async ({ page }) => {
    const input = page.getByTestId("quick-add__input");
    await input.fill("#personal remember me");
    await input.press("Enter");
    await page.reload();

    await expect(page.getByTestId("task-row").filter({ hasText: "Remember me" })).toBeVisible();
  });

  test("filters to a context from the switcher", async ({ page }) => {
    const input = page.getByTestId("quick-add__input");
    await input.fill("#work work item");
    await input.press("Enter");
    await input.fill("#personal home item");
    await input.press("Enter");

    await page.getByTestId("context-switcher__trigger").first().click();
    await page.getByRole("menuitemradio", { name: /Work/ }).click();

    await expect(page.getByTestId("task-row").filter({ hasText: "Work item" })).toBeVisible();
    await expect(page.getByTestId("task-row").filter({ hasText: "Home item" })).toHaveCount(0);
  });
});

test.describe("myday.settings", () => {
  test("creates a context in settings", async ({ page }) => {
    await page.goto("/#/settings");
    await page.getByTestId("settings__new-context-name").fill("BRF board");
    await page.getByTestId("settings__new-context").click();

    await expect(page.getByTestId("settings-context-card").filter({ hasText: "BRF board" })).toBeVisible();

    await page.getByTestId("settings__back").click();
    await page.getByTestId("context-switcher__trigger").first().click();
    await expect(page.getByRole("menuitemradio", { name: /BRF board/ })).toBeVisible();
  });
});
