import type { Page } from "@playwright/test";
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
    await page.getByTestId("settings__new-context-name").fill("Football club");
    await page.getByTestId("settings__new-context").click();

    await expect(page.getByTestId("settings-context-card").filter({ hasText: "Football club" })).toBeVisible();

    await page.getByTestId("settings__back").click();
    await page.getByTestId("context-switcher__trigger").first().click();
    await expect(page.getByRole("menuitemradio", { name: /Football club/ })).toBeVisible();
  });
});

test.describe("myday.back", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    const input = page.getByTestId("quick-add__input");
    await input.fill("first task");
    await input.press("Enter");
    await input.fill("second task");
    await input.press("Enter");
  });

  test("goes from a task back to the list, not to the previous route", async ({ page }) => {
    await page.goto("/#/settings");
    await page.getByTestId("settings__back").click();
    await expect(page.getByTestId("quick-add__input")).toBeVisible();

    await page.getByTestId("task-row").filter({ hasText: "First task" }).getByTestId("task-row__open").click();
    await expect(page.getByTestId("task-editor")).toBeVisible();

    await page.goBack();
    await expect(page.getByTestId("task-editor")).toHaveCount(0);
    await expect(page.getByTestId("quick-add__input")).toBeVisible();
    await expect(page).not.toHaveURL(/settings/);
  });

  test("switching tasks doesn't stack history entries", async ({ page }) => {
    await page.getByTestId("task-row").filter({ hasText: "First task" }).getByTestId("task-row__open").click();
    await page.getByTestId("task-row").filter({ hasText: "Second task" }).getByTestId("task-row__open").click();
    await expect(page.getByTestId("task-editor__title")).toHaveValue("Second task");

    await page.goBack();
    await expect(page.getByTestId("task-editor")).toHaveCount(0);
  });
});

test.describe("myday.reorder", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    const input = page.getByTestId("quick-add__input");
    for (const title of ["first task", "second task", "third task"]) {
      await input.fill(title);
      await input.press("Enter");
    }
  });

  function titles(page: Page): Promise<string[]> {
    return page.getByTestId("my-day__tasks").getByTestId("task-row__title").allTextContents();
  }

  test("drags a task by its grip and keeps the order after a reload", async ({ page }) => {
    const first = page.getByTestId("task-row").filter({ hasText: "First task" });
    const third = page.getByTestId("task-row").filter({ hasText: "Third task" });
    await first.hover();
    const grip = await first.getByTestId("task-row__grip").boundingBox();
    const target = await third.boundingBox();

    await page.mouse.move(grip!.x + grip!.width / 2, grip!.y + grip!.height / 2);
    await page.mouse.down();
    await page.mouse.move(grip!.x + grip!.width / 2, target!.y + target!.height - 4, { steps: 8 });
    await page.mouse.up();

    await expect.poll(() => titles(page)).toEqual(["Second task", "Third task", "First task"]);
    await page.reload();
    await expect.poll(() => titles(page)).toEqual(["Second task", "Third task", "First task"]);
  });

  test("moves a task with the arrow keys", async ({ page }) => {
    await page.getByTestId("task-row").filter({ hasText: "Third task" }).getByTestId("task-row__grip").focus();
    await page.keyboard.press("ArrowUp");

    await expect.poll(() => titles(page)).toEqual(["First task", "Third task", "Second task"]);
  });
});
