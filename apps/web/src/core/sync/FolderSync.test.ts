import { beforeEach, describe, expect, it } from "vitest";
import { BrowserFolderBackend } from "./BrowserFolderBackend";
import type { SyncScope } from "./FolderSync";
import { FolderSync, serialize } from "./FolderSync";
import { LLMS_TXT } from "./LlmsTxt";
import {
  addItemToDay,
  addShoppingItem,
  createShoppingItem,
  createShoppingList,
  upsertList,
} from "~/core/shopping/ShoppingData";
import { parseShoppingItem } from "~/core/shopping/ShoppingItemParse";
import type { KlartData } from "~/core/tasks/KlartData";
import { addToDay, createEmptyData, createTask, updateTask } from "~/core/tasks/KlartData";
import { parseQuickAdd } from "~/core/tasks/QuickAdd";

const TODAY = "2026-10-21";
const OPTIONS = { writeViews: true, acceptInbox: true, keepLlmsTxt: true };

let clock = 1;

/** Minimal in-memory stand-in for the File System Access API. */
class FakeFile {
  readonly kind = "file";
  lastModified = clock++;
  constructor(
    readonly name: string,
    public content = ""
  ) {}

  async getFile(): Promise<{ lastModified: number; text: () => Promise<string> }> {
    return { lastModified: this.lastModified, text: async () => this.content };
  }

  async createWritable(): Promise<{ write: (text: string) => Promise<void>; close: () => Promise<void> }> {
    return {
      write: async (text) => {
        this.content = text;
      },
      close: async () => {
        this.lastModified = clock++;
      },
    };
  }
}

class FakeDir {
  readonly kind = "directory";
  readonly children = new Map<string, FakeDir | FakeFile>();
  constructor(readonly name: string) {}

  private notFound(): DOMException {
    return new DOMException("not found", "NotFoundError");
  }

  async getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FakeDir> {
    let child = this.children.get(name);
    if (!child && options?.create) {
      child = new FakeDir(name);
      this.children.set(name, child);
    }
    if (!(child instanceof FakeDir)) {
      throw this.notFound();
    }
    return child;
  }

  async getFileHandle(name: string, options?: { create?: boolean }): Promise<FakeFile> {
    let child = this.children.get(name);
    if (!child && options?.create) {
      child = new FakeFile(name);
      this.children.set(name, child);
    }
    if (!(child instanceof FakeFile)) {
      throw this.notFound();
    }
    return child;
  }

  async removeEntry(name: string): Promise<void> {
    if (!this.children.delete(name)) {
      throw this.notFound();
    }
  }

  async *entries(): AsyncGenerator<[string, FakeDir | FakeFile]> {
    yield* [...this.children.entries()];
  }

  /** Test helper: reads a file by path, or `undefined`. */
  read(path: string): string | undefined {
    const [head, ...rest] = path.split("/");
    const child = this.children.get(head!);
    if (rest.length === 0) {
      return child instanceof FakeFile ? child.content : undefined;
    }
    return child instanceof FakeDir ? child.read(rest.join("/")) : undefined;
  }

  /** Test helper: writes a file by path, as another device or an agent would. */
  async write(path: string, content: string): Promise<void> {
    const [head, ...rest] = path.split("/");
    if (rest.length === 0) {
      const file = await this.getFileHandle(head!, { create: true });
      file.content = content;
      file.lastModified = clock++;
      return;
    }
    const dir = await this.getDirectoryHandle(head!, { create: true });
    await dir.write(rest.join("/"), content);
  }
}

function seed(): KlartData {
  const data = createEmptyData();
  const parsed = parseQuickAdd("#work review PR @today", {
    today: TODAY,
    contexts: data.contexts,
    currentContext: "all",
  });
  const task = createTask(parsed, new Date("2026-10-21T08:00:00Z"), "T1");
  return addToDay(
    { ...data, tasks: { T1: task } },
    TODAY,
    [{ taskId: "T1", addedBy: "user", reason: null }],
    new Date()
  );
}

describe("FolderSync", () => {
  let root: FakeDir;
  let sync: FolderSync;

  beforeEach(() => {
    root = new FakeDir("Klart");
    sync = new FolderSync(new BrowserFolderBackend(root as unknown as FileSystemDirectoryHandle), "MacBook Air");
  });

  it("writes the documented folder layout", async () => {
    await sync.push(seed(), { today: TODAY, options: OPTIONS });

    expect(JSON.parse(root.read("klart.json")!)).toMatchObject({ schema: "klart.config/v1" });
    expect(JSON.parse(root.read("tasks/work/T1.json")!)).toMatchObject({ id: "T1", title: "Review PR" });
    expect(JSON.parse(root.read(`days/${TODAY}.json`)!).items[0].taskId).toBe("T1");
    expect(JSON.parse(root.read("views/today.json")!).items[0].task.id).toBe("T1");
    expect(JSON.parse(root.read("views/suggestions.json")!).schema).toBe("klart.suggestions/v1");
    expect(JSON.parse(root.read("views/shopping.json")!).schema).toBe("klart.view.shopping/v1");
    expect(root.read("LLMS.txt")).toBe(LLMS_TXT);
  });

  it("updates an LLMS.txt written by an older version, and leaves a current one alone", async () => {
    await root.write("LLMS.txt", "# Klart\n\nOld rules.\n");
    const data = await sync.pull(createEmptyData(), { today: TODAY, acceptInbox: true });
    await sync.push(data.data, { today: TODAY, options: { ...OPTIONS, writeViews: false } });
    expect(root.read("LLMS.txt")).toBe(LLMS_TXT);

    const nextSession = new FolderSync(new BrowserFolderBackend(root as unknown as FileSystemDirectoryHandle), "Mac");
    const pulled = await nextSession.pull(createEmptyData(), { today: TODAY, acceptInbox: true });
    const written = await nextSession.push(pulled.data, { today: TODAY, options: { ...OPTIONS, writeViews: false } });
    expect(written).toBe(0);
  });

  it("rewrites task files from an older version in the current format", async () => {
    await root.write(
      "tasks/work/OLD.json",
      JSON.stringify({
        id: "OLD",
        title: "Read the news",
        context: "work",
        links: ["www.fz.se", "ftp://host"],
        createdAt: "2026-10-01T08:00:00Z",
        updatedAt: "2026-10-01T08:00:00Z",
      })
    );
    const pulled = await sync.pull(createEmptyData(), { today: TODAY, acceptInbox: true });
    await sync.push(pulled.data, { today: TODAY, options: OPTIONS });

    expect(JSON.parse(root.read("tasks/work/OLD.json")!)).toMatchObject({
      schema: "klart.task/v1",
      links: ["https://www.fz.se"],
      status: "open",
      notes: "",
      updatedAt: "2026-10-01T08:00:00Z",
    });
  });

  it("only writes files that changed", async () => {
    const data = seed();
    expect(await sync.push(data, { today: TODAY, options: OPTIONS })).toBeGreaterThan(0);
    expect(await sync.push(data, { today: TODAY, options: OPTIONS })).toBe(0);
  });

  it("moves a task's file when its context changes", async () => {
    const data = seed();
    await sync.push(data, { today: TODAY, options: OPTIONS });
    await sync.push(updateTask(data, "T1", { context: "personal" }, new Date()), { today: TODAY, options: OPTIONS });

    expect(root.read("tasks/work/T1.json")).toBeUndefined();
    expect(root.read("tasks/personal/T1.json")).toBeDefined();
  });

  it("pulls newer task edits from disk and keeps local ones that are newer", async () => {
    const data = seed();
    await sync.push(data, { today: TODAY, options: OPTIONS });

    const remote = { ...data.tasks.T1!, title: "Edited by agent", updatedAt: "2026-10-21T09:00:00Z" };
    await root.write("tasks/work/T1.json", serialize(remote));
    const pulled = await sync.pull(data, { today: TODAY, acceptInbox: false });
    expect(pulled.changed).toBe(true);
    expect(pulled.data.tasks.T1?.title).toBe("Edited by agent");

    const older = { ...remote, title: "Stale edit", updatedAt: "2026-10-21T07:00:00Z" };
    await root.write("tasks/work/T1.json", serialize(older));
    const kept = await sync.pull(pulled.data, { today: TODAY, acceptInbox: false });
    expect(kept.data.tasks.T1?.title).toBe("Edited by agent");
    const conflicts = (root.children.get(".conflicts") as FakeDir | undefined)?.children;
    expect(conflicts?.size).toBe(1);
  });

  it("does nothing when nothing changed on disk", async () => {
    const data = seed();
    await sync.push(data, { today: TODAY, options: OPTIONS });
    const pulled = await sync.pull(data, { today: TODAY, acceptInbox: true });
    expect(pulled.changed).toBe(false);
    expect(pulled.data).toBe(data);
  });

  it("merges an existing folder with local data on first connect", async () => {
    const other = new FolderSync(new BrowserFolderBackend(root as unknown as FileSystemDirectoryHandle), "Work PC");
    const remoteData = createEmptyData();
    const remoteTask = createTask(
      parseQuickAdd("from the other computer", {
        today: TODAY,
        contexts: remoteData.contexts,
        currentContext: "personal",
      }),
      new Date("2026-10-20T08:00:00Z"),
      "R1"
    );
    await other.push(
      addToDay(
        { ...remoteData, tasks: { R1: remoteTask } },
        TODAY,
        [{ taskId: "R1", addedBy: "user", reason: null }],
        new Date()
      ),
      { today: TODAY, options: OPTIONS }
    );

    const pulled = await sync.pull(seed(), { today: TODAY, acceptInbox: false });
    expect(Object.keys(pulled.data.tasks).sort()).toEqual(["R1", "T1"]);
    expect(pulled.data.days[TODAY]?.items.map((item) => item.taskId)).toEqual(["R1", "T1"]);
  });

  it("turns inbox files into tasks and removes them", async () => {
    await root.write("inbox/plan.txt", "#work #acme @2026-07-08 find more tasks\n\nbuy milk #köp\n");
    await root.write("inbox/agent.json", JSON.stringify({ title: "From an agent", tags: ["club"], due: "2026-10-23" }));
    await root.write("inbox/notes.pdf", "binary");

    const pulled = await sync.pull(createEmptyData(), { today: TODAY, acceptInbox: true });
    const titles = Object.values(pulled.data.tasks).map((t) => [t.title, t.context]);
    expect(titles).toEqual(
      expect.arrayContaining([
        ["Find more tasks", "work"],
        ["Buy milk", "personal"],
        ["From an agent", "personal"],
      ])
    );
    expect(pulled.inboxCount).toBe(3);
    expect(root.read("inbox/plan.txt")).toBeUndefined();
    expect(root.read("inbox/agent.json")).toBeUndefined();
    expect(root.read("inbox/notes.pdf")).toBe("binary");
  });

  it("keeps only web links from agent files", async () => {
    await root.write(
      "inbox/agent.json",
      JSON.stringify({ title: "Read the RFC", links: ["https://example.com/rfc", "javascript:alert(1)", "notes"] })
    );
    await root.write(
      "tasks/work/T9.json",
      JSON.stringify({
        id: "T9",
        title: "Old file",
        context: "work",
        links: ["file:///etc/passwd", "https://example.com/a"],
        createdAt: "2026-10-01T08:00:00Z",
        updatedAt: "2026-10-01T08:00:00Z",
      })
    );

    const pulled = await sync.pull(createEmptyData(), { today: TODAY, acceptInbox: true });
    const fromInbox = Object.values(pulled.data.tasks).find((t) => t.title === "Read the RFC");
    expect(fromInbox?.links).toEqual(["https://example.com/rfc"]);
    expect(pulled.data.tasks.T9?.links).toEqual(["https://example.com/a"]);
  });

  it("ignores malformed files", async () => {
    await root.write("tasks/work/bad.json", "{ not json");
    await root.write("days/2026-10-21.json", JSON.stringify({ nope: true }));
    const pulled = await sync.pull(createEmptyData(), { today: TODAY, acceptInbox: false });
    expect(Object.keys(pulled.data.tasks)).toEqual([]);
  });

  it("records devices", async () => {
    await sync.touchDevice("2026-10-21T08:00:00Z");
    await new FolderSync(new BrowserFolderBackend(root as unknown as FileSystemDirectoryHandle), "Work PC").touchDevice(
      "2026-10-21T09:00:00Z"
    );
    expect((await sync.listDevices()).map((device) => device.id)).toEqual(["work-pc", "macbook-air"]);
  });

  it("writes shopping lists and carries a task completed elsewhere back to its item", async () => {
    const T0 = new Date("2026-10-21T08:00:00Z");
    let data = upsertList(seed(), createShoppingList("L1", "Week", "grocery", "personal", null, T0));
    data = addShoppingItem(data, "L1", createShoppingItem("milk", parseShoppingItem("2x mjölk"), T0), T0);
    data = addItemToDay(data, "L1", "milk", { id: "B1", title: "Buy: mjölk", context: "personal" }, TODAY, T0);
    await sync.push(data, { today: TODAY, options: OPTIONS });

    const file = JSON.parse(root.read("lists/L1.json")!);
    expect(file).toMatchObject({
      schema: "klart.list/v1",
      name: "Week",
      items: [{ id: "milk", qty: 2, taskId: "B1" }],
    });
    expect(JSON.parse(root.read("tasks/personal/B1.json")!).shopping).toEqual({ listId: "L1", itemId: "milk" });

    // An agent completes the task file.
    const task = JSON.parse(root.read("tasks/personal/B1.json")!);
    await root.write(
      "tasks/personal/B1.json",
      JSON.stringify({
        ...task,
        status: "done",
        completedAt: "2026-10-21T09:00:00Z",
        updatedAt: "2026-10-21T09:00:00Z",
      })
    );
    const pulled = await sync.pull(data, { today: TODAY, acceptInbox: false });
    expect(pulled.data.lists.L1!.items[0]!.bought).toBe(true);
  });

  it("takes a newer list file from the folder", async () => {
    const list = createShoppingList("L9", "Gifts", "gift", "personal", "2026-11-07", new Date("2026-10-21T08:00:00Z"));
    await root.write("lists/L9.json", JSON.stringify(list));
    const pulled = await sync.pull(seed(), { today: TODAY, acceptInbox: false });
    expect(pulled.data.lists.L9).toEqual(list);
  });

  it("reads a list file without a context", async () => {
    const { context: _, ...list } = createShoppingList("L9", "Gifts", "gift", "personal", null, new Date());
    await root.write("lists/L9.json", JSON.stringify(list));
    const pulled = await sync.pull(seed(), { today: TODAY, acceptInbox: false });
    expect(pulled.data.lists.L9?.context).toBeNull();
  });
});

describe("FolderSync with contexts split across syncs", () => {
  /** Personal in the primary folder, Work in its own. */
  const PERSONAL: SyncScope = { ownsContext: (id) => id !== "work", isPrimary: true };
  const WORK: SyncScope = { ownsContext: (id) => id === "work", isPrimary: false };

  let personalRoot: FakeDir;
  let workRoot: FakeDir;
  let personal: FolderSync;
  let work: FolderSync;

  function folderSync(root: FakeDir): FolderSync {
    return new FolderSync(new BrowserFolderBackend(root as unknown as FileSystemDirectoryHandle), "MacBook Air");
  }

  /** T1 in Work and P1 in Personal, both in today's My Day, plus a shopping list in each. */
  function splitSeed(): KlartData {
    const data = seed();
    const task = createTask(
      parseQuickAdd("water the plants", { today: TODAY, contexts: data.contexts, currentContext: "personal" }),
      new Date("2026-10-21T08:30:00Z"),
      "P1"
    );
    const withTask = addToDay(
      { ...data, tasks: { ...data.tasks, P1: task } },
      TODAY,
      [{ taskId: "P1", addedBy: "user", reason: null }],
      new Date()
    );
    const withList = upsertList(
      withTask,
      createShoppingList("L1", "Groceries", "grocery", "personal", null, new Date())
    );
    return upsertList(withList, createShoppingList("L2", "Office", "other", "work", null, new Date()));
  }

  beforeEach(() => {
    personalRoot = new FakeDir("Personal");
    workRoot = new FakeDir("Work");
    personal = folderSync(personalRoot);
    work = folderSync(workRoot);
  });

  it("writes each context's tasks, config entry and My Day items only to its own folder", async () => {
    const data = splitSeed();
    await personal.push(data, { today: TODAY, options: OPTIONS, scope: PERSONAL });
    await work.push(data, { today: TODAY, options: OPTIONS, scope: WORK });

    expect(personalRoot.read("tasks/personal/P1.json")).toBeDefined();
    expect(personalRoot.read("tasks/work/T1.json")).toBeUndefined();
    expect(workRoot.read("tasks/work/T1.json")).toBeDefined();
    expect(workRoot.read("tasks/personal/P1.json")).toBeUndefined();

    function ids(root: FakeDir): string[] {
      return (JSON.parse(root.read("klart.json")!) as { contexts: { id: string }[] }).contexts.map(
        (context) => context.id
      );
    }
    expect(ids(personalRoot)).toEqual(["personal"]);
    expect(ids(workRoot)).toEqual(["work"]);

    function dayItems(root: FakeDir): string[] {
      return (JSON.parse(root.read(`days/${TODAY}.json`)!) as { items: { taskId: string }[] }).items.map(
        (item) => item.taskId
      );
    }
    expect(dayItems(personalRoot)).toEqual(["P1"]);
    expect(dayItems(workRoot)).toEqual(["T1"]);

    expect(personalRoot.read("lists/L1.json")).toBeDefined();
    expect(personalRoot.read("lists/L2.json")).toBeUndefined();
    expect(workRoot.read("lists/L2.json")).toBeDefined();
    expect(workRoot.read("lists/L1.json")).toBeUndefined();
  });

  it("moves a list's file to the folder of its new context", async () => {
    const data = splitSeed();
    await personal.push(data, { today: TODAY, options: OPTIONS, scope: PERSONAL });
    await work.push(data, { today: TODAY, options: OPTIONS, scope: WORK });

    const moved = upsertList(data, { ...data.lists.L1!, context: "work" });
    await personal.push(moved, { today: TODAY, options: OPTIONS, scope: PERSONAL });
    await work.push(moved, { today: TODAY, options: OPTIONS, scope: WORK });
    expect(personalRoot.read("lists/L1.json")).toBeUndefined();
    expect(JSON.parse(workRoot.read("lists/L1.json")!).context).toBe("work");
  });

  it("removes a context's tasks from a folder once the context moves to another sync", async () => {
    const data = splitSeed();
    await personal.push(data, { today: TODAY, options: OPTIONS, scope: { ...PERSONAL, ownsContext: () => true } });
    expect(personalRoot.read("tasks/work/T1.json")).toBeDefined();

    await personal.push(data, { today: TODAY, options: OPTIONS, scope: PERSONAL });
    expect(personalRoot.read("tasks/work/T1.json")).toBeUndefined();
    expect(personalRoot.read("tasks/personal/P1.json")).toBeDefined();
  });

  it("brings in one folder's changes without dropping the other folder's contexts and My Day items", async () => {
    const data = splitSeed();
    await personal.push(data, { today: TODAY, options: OPTIONS, scope: PERSONAL });
    await work.push(data, { today: TODAY, options: OPTIONS, scope: WORK });
    // First reads of each folder.
    await personal.pull(data, { today: TODAY, acceptInbox: false, scope: PERSONAL });
    await work.pull(data, { today: TODAY, acceptInbox: false, scope: WORK });

    // Another device renames Work and empties its My Day in the work folder.
    await workRoot.write(
      "klart.json",
      serialize({ schema: "klart.config/v1", contexts: [{ id: "work", name: "Acme", color: "orange", tag: "work" }] })
    );
    await workRoot.write(`days/${TODAY}.json`, serialize({ schema: "klart.day/v1", date: TODAY, items: [] }));

    const pulled = await work.pull(data, { today: TODAY, acceptInbox: false, scope: WORK });
    expect(pulled.contextIds).toEqual(["work"]);
    expect(pulled.data.contexts.map((context) => context.name)).toEqual(["Personal", "Acme"]);
    expect(pulled.data.days[TODAY]?.items.map((item) => item.taskId)).toEqual(["P1"]);
  });

  it("puts tasks from a folder's inbox in a context that folder holds", async () => {
    await workRoot.write("inbox/agent.txt", "prepare the slides\n");
    const pulled = await work.pull(createEmptyData(), { today: TODAY, acceptInbox: true, scope: WORK });
    expect(Object.values(pulled.data.tasks).map((task) => task.context)).toEqual(["work"]);
  });
});
