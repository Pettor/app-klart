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

    // The completed list starts folded; its button expands it.
    await expect(page.getByText("Completed 1")).toBeVisible();
    await expect(row).toHaveCount(0);
    await page.getByTestId("my-day__toggle-completed").click();
    await expect(row.getByRole("button", { name: "Mark not completed" })).toBeVisible();
  });

  test("hides dates through the Display menu and collapses the sidebar", async ({ page }) => {
    const input = page.getByTestId("quick-add__input");
    await input.fill("pay rent @tomorrow");
    await input.press("Enter");
    const row = page.getByTestId("task-row").filter({ hasText: "Pay rent" });
    await expect(row).toContainText("Tomorrow");

    await page.getByTestId("my-day__display").click();
    await page.getByTestId("my-day__display-details").click();
    await page.keyboard.press("Escape");
    await expect(row).not.toContainText("Tomorrow");

    await page.getByTestId("my-day__collapse-sidebar").click();
    await expect(page.getByTestId("my-day__sidebar-rail")).toBeVisible();
    await page.reload();
    await expect(page.getByTestId("my-day__sidebar-rail")).toBeVisible();
    await expect(row).not.toContainText("Tomorrow");
    await page.getByTestId("my-day__expand-sidebar").click();
    await expect(page.getByTestId("my-day__sidebar-rail")).toHaveCount(0);
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
    await page.goto("/#/settings?section=contexts");
    await page.getByTestId("settings__new-context-name").fill("Football club");
    await page.getByTestId("settings__new-context").click();

    await expect(page.getByTestId("settings-context-card").filter({ hasText: "Football club" })).toBeVisible();

    await page.getByTestId("settings__back").click();
    await page.getByTestId("context-switcher__trigger").first().click();
    await expect(page.getByRole("menuitemradio", { name: /Football club/ })).toBeVisible();
  });
  test("opens My Day in the context chosen under Start in", async ({ page }) => {
    await page.goto("/#/settings");
    await page.getByTestId("settings__start-context").click();
    await page.getByRole("option", { name: "Work" }).click();

    await page.goto("/#/settings?section=appearance");
    await page.getByTestId("settings__density").getByRole("radio", { name: "Compact" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-density", "compact");

    await page.goto("/");
    await page.reload();
    await expect(page.getByTestId("context-switcher__trigger").first()).toHaveAccessibleName("Context: Work");
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

  test("drags a task by pressing it and keeps the order after a reload", async ({ page }) => {
    const first = page.getByTestId("task-row").filter({ hasText: "First task" });
    const third = page.getByTestId("task-row").filter({ hasText: "Third task" });
    const start = await first.getByTestId("task-row__title").boundingBox();
    const target = await third.boundingBox();

    await page.mouse.move(start!.x + start!.width / 2, start!.y + start!.height / 2);
    await page.mouse.down();
    await page.mouse.move(start!.x + start!.width / 2, target!.y + target!.height - 4, { steps: 8 });
    await page.mouse.up();

    await expect.poll(() => titles(page)).toEqual(["Second task", "Third task", "First task"]);
    // The press that dragged doesn't also open the task.
    await expect(page.getByTestId("task-editor")).toHaveCount(0);
    await page.reload();
    await expect.poll(() => titles(page)).toEqual(["Second task", "Third task", "First task"]);
  });

  test("drops a dragged task between two others", async ({ page }) => {
    const first = page.getByTestId("task-row").filter({ hasText: "First task" });
    const second = page.getByTestId("task-row").filter({ hasText: "Second task" });
    const start = await first.getByTestId("task-row__title").boundingBox();
    const target = await second.boundingBox();

    await page.mouse.move(start!.x + start!.width / 2, start!.y + start!.height / 2);
    await page.mouse.down();
    await page.mouse.move(start!.x + start!.width / 2, target!.y + target!.height - 4, { steps: 8 });
    await page.mouse.up();

    await expect.poll(() => titles(page)).toEqual(["Second task", "First task", "Third task"]);
  });

  test("a click without moving still opens the task", async ({ page }) => {
    await page.getByTestId("task-row").filter({ hasText: "Second task" }).getByTestId("task-row__open").click();
    await expect(page.getByTestId("task-editor__title")).toHaveValue("Second task");
  });

  test("moves a task with Alt and the arrow keys", async ({ page }) => {
    await page.getByTestId("task-row").filter({ hasText: "Third task" }).getByTestId("task-row__open").focus();
    await page.keyboard.press("Alt+ArrowUp");

    await expect.poll(() => titles(page)).toEqual(["First task", "Third task", "Second task"]);
  });
});
