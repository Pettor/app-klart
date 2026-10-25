import type { Page } from "@playwright/test";
import { expect, test } from "../fixtures";

/** Headless Chromium always reports notifications as denied; stand in a page API that records what it shows. */
async function stubNotifications(page: Page, permission: NotificationPermission): Promise<void> {
  await page.addInitScript((initial) => {
    const shown: string[] = [];
    let current = initial;
    class FakeNotification {
      static get permission(): NotificationPermission {
        return current;
      }
      static async requestPermission(): Promise<NotificationPermission> {
        current = "granted";
        return current;
      }
      onclick: (() => void) | null = null;
      constructor(title: string) {
        shown.push(title);
      }
      close(): void {}
    }
    Object.assign(window, { Notification: FakeNotification, __shown: shown });
  }, permission);
}

test.describe("settings.sections", () => {
  test("walks through every section from the nav", async ({ page }) => {
    await page.goto("/#/settings");
    for (const [id, heading] of [
      ["appearance", "Appearance"],
      ["contexts", "Contexts"],
      ["sync", "Sync"],
      ["notifications", "Notifications"],
      ["suggestions", "Suggestions"],
      ["agents", "Agents & files"],
      ["about", "About"],
      ["general", "General"],
    ]) {
      await page.getByTestId(`settings__nav-${id}`).click();
      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    }
  });

  test("goes back to My Day", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("quick-add__input")).toBeVisible();
    await page.goto("/#/settings?section=about");
    await page.getByTestId("settings__back").click();
    await expect(page.getByTestId("quick-add__input")).toBeVisible();
  });
});

test.describe("settings.contexts", () => {
  test("renames, recolors, reorders and removes a context", async ({ page }) => {
    await page.goto("/#/settings?section=contexts");
    await page.getByTestId("settings__new-context-name").fill("Side project");
    await page.getByTestId("settings__new-context").click();
    const cards = page.getByTestId("settings-context-card");
    const card = cards.filter({ hasText: "Side project" });
    await expect(card).toBeVisible();

    const name = card.getByRole("textbox", { name: "Name" });
    await name.fill("Garden");
    await name.blur();
    const garden = cards.filter({ hasText: "Garden" });
    await expect(garden).toBeVisible();

    const tag = garden.getByRole("textbox", { name: "Routing tag" });
    await tag.fill("yard");
    await tag.blur();
    await expect(tag).toHaveValue("yard");

    await garden.getByRole("radio", { name: "green" }).click({ force: true });
    await expect(garden.getByRole("radio", { name: "green" })).toBeChecked();
    await garden.getByRole("button", { name: "Move up" }).click();
    await expect(cards.last()).not.toContainText("Garden");
    await garden.getByRole("button", { name: "Move down" }).click();
    await expect(cards.last()).toContainText("Garden");

    await page.getByRole("button", { name: "Remove Garden" }).click();
    await expect(garden).toHaveCount(0);
  });
});

test.describe("settings.notifications", () => {
  test("toggles notifications and sends a test", async ({ page }) => {
    await stubNotifications(page, "granted");
    await page.goto("/#/settings?section=notifications");
    await expect(page.getByText("System permission: allowed")).toBeVisible();

    const reminders = page.getByRole("switch", { name: /Task reminders/ });
    const wasOn = await reminders.isChecked();
    await page.getByText("Task reminders", { exact: true }).click();
    await expect(reminders).toBeChecked({ checked: !wasOn });

    await page.getByText("Plan your day", { exact: true }).click();
    await page.getByText("Overdue nudge", { exact: true }).click();
    await page.getByText("End of day wrap-up", { exact: true }).click();
    await page.getByText("Due today without a time", { exact: true }).click();

    await page.getByText("Always on this device").click();
    await expect(page.getByRole("radio", { name: /Always on this device/ })).toBeChecked();

    await page.getByRole("checkbox", { name: "Mon–Fri" }).first().click({ force: true });
    await expect(page.getByRole("checkbox", { name: "Mon–Fri" }).first()).toBeChecked();
    const work = page.getByRole("switch", { name: "Work" });
    await work.click({ force: true });
    await expect(work).not.toBeChecked();
    await expect(page.getByRole("textbox", { name: "Work from" })).toBeDisabled();

    await page.getByRole("button", { name: "Send test notification" }).click();
  });

  test("asks for permission when it hasn't been asked yet", async ({ page }) => {
    await stubNotifications(page, "default");
    await page.goto("/#/settings?section=notifications");
    await expect(page.getByText(/System permission: not asked yet/)).toBeVisible();
    await page.getByTestId("settings__allow-notifications").click();
    await expect(page.getByText("System permission: allowed")).toBeVisible();
    await page.getByRole("button", { name: "Send test notification" }).click();
    await expect.poll(() => page.evaluate(() => (window as unknown as { __shown: string[] }).__shown.length)).toBe(1);
  });
});

test.describe("settings.suggestions", () => {
  test("turns a suggestion source off and changes the coming-up window", async ({ page }) => {
    await page.goto("/#/settings?section=suggestions");
    const overdue = page.getByRole("switch", { name: /Overdue/ });
    await expect(overdue).toBeChecked();
    await page.getByText("Overdue", { exact: true }).click();
    await expect(overdue).not.toBeChecked();

    await page.getByRole("button", { name: /Coming up within/ }).click();
    await page.getByRole("option", { name: "Within a week" }).click();
    await expect(page.getByRole("button", { name: /Coming up within/ })).toContainText("Within a week");
  });
});

test.describe("settings.agents", () => {
  test("toggles agent file options and shows LLMS.txt", async ({ page }) => {
    await page.goto("/#/settings?section=agents");
    const switches = page.getByRole("switch");
    await expect(switches).toHaveCount(3);
    for (let index = 0; index < 3; index += 1) {
      const toggle = switches.nth(index);
      const wasOn = await toggle.isChecked();
      await toggle.locator("xpath=ancestor::label[1]").click();
      await expect(toggle).toBeChecked({ checked: !wasOn });
    }

    await page.getByRole("button", { name: "Show LLMS.txt" }).click();
    await expect(page.getByText(/klart\.json/).first()).toBeVisible();
  });
});

test.describe("settings.appearance", () => {
  test("changes theme, tint and motion", async ({ page }) => {
    await page.goto("/#/settings?section=appearance");
    await page.getByRole("radio", { name: "Dark" }).click({ force: true });
    await expect(page.locator("html")).toHaveClass(/dark/);
    await page.getByRole("radio", { name: "Reduced" }).click({ force: true });
    const tint = page.getByRole("switch").first();
    const wasOn = await tint.isChecked();
    await tint.locator("xpath=ancestor::label[1]").click();
    await expect(tint).toBeChecked({ checked: !wasOn });
  });
});

test.describe("settings.sync", () => {
  test("renames this device", async ({ page }) => {
    await page.goto("/#/settings?section=sync");
    const name = page.getByRole("textbox", { name: "This device's name" });
    await name.fill("Test laptop");
    await page.reload();
    await expect(page.getByRole("textbox", { name: "This device's name" })).toHaveValue("Test laptop");
  });
});
