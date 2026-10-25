import type { Page } from "@playwright/test";
import { expect, test } from "../fixtures";
import { FakeGitHub, OWNER, REPO, TOKEN } from "../helpers/FakeGitHub";

/**
 * Headless Chromium has no folder picker; hand the app a folder in the origin
 * private file system instead, which is the same handle type a picked folder is.
 */
async function stubFolderPicker(page: Page): Promise<void> {
  await page.addInitScript(() => {
    Object.assign(window, {
      showDirectoryPicker: async () => {
        const root = await navigator.storage.getDirectory();
        return root.getDirectoryHandle("Klart", { create: true });
      },
    });
  });
}

/** Reads a file from the synced folder, or `null` when it isn't there. */
function readFolderFile(page: Page, path: string): Promise<string | null> {
  return page.evaluate(async (filePath) => {
    let dir = await (await navigator.storage.getDirectory()).getDirectoryHandle("Klart", { create: true });
    const parts = filePath.split("/");
    try {
      for (const part of parts.slice(0, -1)) {
        dir = await dir.getDirectoryHandle(part);
      }
      return await (await (await dir.getFileHandle(parts.at(-1)!)).getFile()).text();
    } catch {
      return null;
    }
  }, path);
}

/** Every file under one folder of the synced folder, joined. */
function readFolderDir(page: Page, path: string): Promise<string> {
  return page.evaluate(async (dirPath) => {
    type Iterable = { values(): AsyncIterable<FileSystemHandle> };
    async function collect(dir: FileSystemDirectoryHandle): Promise<string[]> {
      const texts: string[] = [];
      for await (const handle of (dir as unknown as Iterable).values()) {
        texts.push(
          ...(handle.kind === "file"
            ? [await (await (handle as FileSystemFileHandle).getFile()).text()]
            : await collect(handle as FileSystemDirectoryHandle))
        );
      }
      return texts;
    }
    const root = await (await navigator.storage.getDirectory()).getDirectoryHandle("Klart", { create: true });
    try {
      return (await collect(await root.getDirectoryHandle(dirPath))).join("\n");
    } catch {
      return "";
    }
  }, path);
}

/** Writes a file into the synced folder, as another device or an agent would. */
function writeFolderFile(page: Page, path: string, content: string): Promise<void> {
  return page.evaluate(
    async ({ filePath, text }) => {
      let dir = await (await navigator.storage.getDirectory()).getDirectoryHandle("Klart", { create: true });
      const parts = filePath.split("/");
      for (const part of parts.slice(0, -1)) {
        dir = await dir.getDirectoryHandle(part, { create: true });
      }
      const writable = await (await dir.getFileHandle(parts.at(-1)!, { create: true })).createWritable();
      await writable.write(text);
      await writable.close();
    },
    { filePath: path, text: content }
  );
}

test.describe("sync.folder", () => {
  test.beforeEach(async ({ page }) => {
    await stubFolderPicker(page);
  });

  test("connects a folder, writes tasks to it and picks up files dropped into the inbox", async ({ page }) => {
    await page.goto("/");
    const input = page.getByTestId("quick-add__input");
    await input.fill("#work write the report");
    await input.press("Enter");

    await page.goto("/#/settings?section=sync");
    await page.getByTestId("settings__sync-folder").click({ force: true });
    await expect(page.getByText("Found klart.json. Watching for changes.")).toBeVisible();
    await expect.poll(() => readFolderFile(page, "klart.json")).not.toBeNull();
    await expect(page.getByText("(this)")).toBeVisible();

    await expect.poll(() => readFolderDir(page, "tasks")).toContain("Write the report");

    // An agent drops a file into inbox/: it becomes a task and the file is consumed.
    await writeFolderFile(page, "inbox/agent.txt", "#work call the plumber\n");
    await page.getByRole("button", { name: "Sync now" }).click();
    await expect.poll(() => readFolderFile(page, "inbox/agent.txt")).toBeNull();
    await expect.poll(() => readFolderDir(page, "tasks")).toContain("Call the plumber");
  });

  test("keeps the folder after a reload and stops syncing when disconnected", async ({ page }) => {
    await page.goto("/#/settings?section=sync");
    await page.getByTestId("settings__sync-folder").click({ force: true });
    await expect(page.getByText("Found klart.json. Watching for changes.")).toBeVisible();

    await page.reload();
    await expect(page.getByText("Found klart.json. Watching for changes.")).toBeVisible();

    const local = page.getByRole("radio", { name: /This browser only/ });
    await local.click({ force: true });
    await expect(local).toBeChecked();
    await page.reload();
    await expect(page.getByText("Found klart.json. Watching for changes.")).toHaveCount(0);
  });
});

test.describe("sync.github", () => {
  let github: FakeGitHub;

  test.beforeEach(async ({ page }) => {
    github = new FakeGitHub();
    await github.install(page);
  });

  async function connect(page: Page, token = TOKEN): Promise<void> {
    await page.goto("/#/settings?section=sync");
    await page.getByRole("radio", { name: /GitHub/ }).click({ force: true });
    await page.getByTestId("settings__github-owner").fill(OWNER);
    await page.getByTestId("settings__github-repository").fill(REPO);
    await page.getByTestId("settings__github-token").fill(token);
    await page.getByTestId("settings__github-connect").click();
  }

  test("connects a private repository and commits local changes to it", async ({ page }) => {
    await connect(page);
    await expect(page.getByTestId("settings__github-connected")).toBeVisible();
    await expect.poll(() => github.file("klart.json")).toBeDefined();

    await page.getByTestId("settings__back").click();
    const input = page.getByTestId("quick-add__input");
    await input.fill("#work review the pull request");
    await input.press("Enter");
    // Local changes are committed a few seconds after the last edit.
    await expect.poll(() => github.allFiles(), { timeout: 15_000 }).toContain("Review the pull request");
  });

  test("brings in another device's commit on Sync now and remembers the repository", async ({ page }) => {
    await connect(page);
    await expect.poll(() => github.file("klart.json")).toBeDefined();

    const config = JSON.parse(github.file("klart.json")!) as { contexts: { id: string }[] };
    github.push({
      "klart.json": JSON.stringify({
        ...config,
        contexts: [...config.contexts, { id: "garden", name: "Garden", color: "green", tag: "garden" }],
      }),
    });
    await page.getByTestId("settings__github-sync-now").click();
    await page.getByTestId("settings__nav-contexts").click();
    await expect(page.getByTestId("settings-context-card").filter({ hasText: "Garden" })).toBeVisible();

    await page.reload();
    await page.getByTestId("settings__nav-sync").click();
    await expect(page.getByTestId("settings__github-connected")).toBeVisible();
  });

  test("refuses a public repository", async ({ page }) => {
    github.isPrivate = false;
    await connect(page);
    await expect(page.getByText("That repository is public")).toBeVisible();
    await expect(page.getByTestId("settings__github-connected")).toHaveCount(0);
  });

  test("refuses a token that can only read", async ({ page }) => {
    github.canPush = false;
    await connect(page);
    await expect(page.getByText("The token can only read this repository")).toBeVisible();
  });

  test("explains a rejected token", async ({ page }) => {
    await connect(page, "github_pat_wrong");
    await expect(page.getByText("Couldn't connect to GitHub")).toBeVisible();
    await expect(page.getByText(/didn't accept the token/)).toBeVisible();
  });
});
