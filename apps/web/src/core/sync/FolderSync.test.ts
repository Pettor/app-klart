import { beforeEach, describe, expect, it } from "vitest";
import { BrowserFolderBackend } from "./BrowserFolderBackend";
import { FolderSync, serialize } from "./FolderSync";
import { LLMS_TXT } from "./LlmsTxt";
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
});
