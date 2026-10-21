import { z } from "zod";
import type { FolderFile } from "./FolderFs";
import { getFileHandle, listFiles, removeFile, writeTextFile } from "./FolderFs";
import { LLMS_TXT } from "./LlmsTxt";
import type { KlartContext } from "~/core/contexts/KlartContext";
import { CONTEXT_COLORS, findContext } from "~/core/contexts/KlartContext";
import { buildSuggestionsView, buildTodayView } from "~/core/tasks/AgentViews";
import type { DayFile } from "~/core/tasks/Day";
import { DayFileSchema } from "~/core/tasks/Day";
import type { KlartData } from "~/core/tasks/KlartData";
import { createTask } from "~/core/tasks/KlartData";
import { toUtcTimestamp } from "~/core/tasks/LocalDate";
import { parseQuickAdd } from "~/core/tasks/QuickAdd";
import type { Task } from "~/core/tasks/Task";
import { InboxTaskSchema, TaskFileSchema } from "~/core/tasks/Task";

export const CONFIG_FILE = "klart.json";
export const LLMS_FILE = "LLMS.txt";

const KlartConfigSchema = z.object({
  schema: z.string().optional(),
  contexts: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        color: z.enum(CONTEXT_COLORS).catch("blue"),
        tag: z.string().min(1),
      })
    )
    .min(1),
});

const DeviceFileSchema = z.object({
  name: z.string(),
  lastActiveAt: z.string(),
});

export interface DeviceInfo {
  id: string;
  name: string;
  lastActiveAt: string;
}

export interface AgentFileOptions {
  /** Write `views/today.json` and `views/suggestions.json`. */
  writeViews: boolean;
  /** Turn files dropped into `inbox/` into tasks. */
  acceptInbox: boolean;
  /** Keep `LLMS.txt` in the folder root. */
  keepLlmsTxt: boolean;
}

export interface PullResult {
  data: KlartData;
  changed: boolean;
  inboxCount: number;
}

interface KnownFile {
  content: string;
  lastModified: number;
}

export function serialize(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function taskPath(task: Task): string {
  return `tasks/${task.context}/${task.id}.json`;
}

export function dayPath(date: string): string {
  return `days/${date}.json`;
}

export function toDeviceId(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "device"
  );
}

function mergeDays(local: DayFile | undefined, remote: DayFile): DayFile {
  if (!local) {
    return remote;
  }
  const remoteIds = new Set(remote.items.map((item) => item.taskId));
  return { ...remote, items: [...remote.items, ...local.items.filter((item) => !remoteIds.has(item.taskId))] };
}

function mergeContexts(local: KlartContext[], remote: KlartContext[]): KlartContext[] {
  return [...remote, ...local.filter((context) => !findContext(remote, context.id))];
}

/**
 * Two-way sync between {@link KlartData} and a folder of plain files.
 *
 * The folder is the source of truth. Each file's last seen content and
 * `lastModified` are remembered, so a pull only reads what changed on disk and
 * a push only writes what changed in the app. Tasks resolve by `updatedAt`
 * (newest wins); a losing remote edit is kept in `.conflicts/`.
 */
export class FolderSync {
  private readonly known = new Map<string, KnownFile>();
  private readonly viewSignatures = new Map<string, string>();

  constructor(
    private readonly root: FileSystemDirectoryHandle,
    private readonly deviceName: string
  ) {}

  get folderName(): string {
    return this.root.name;
  }

  /** Reads a file only when it changed since last seen. Returns `null` when unchanged. */
  private async readChanged(
    path: string,
    handle: FileSystemFileHandle
  ): Promise<{ text: string; isNew: boolean } | null> {
    const file = await handle.getFile();
    const known = this.known.get(path);
    if (known && known.lastModified === file.lastModified) {
      return null;
    }
    const text = await file.text();
    this.known.set(path, { content: text, lastModified: file.lastModified });
    if (known && known.content === text) {
      return null;
    }
    return { text, isNew: !known };
  }

  private async write(path: string, content: string): Promise<void> {
    const lastModified = await writeTextFile(this.root, path, content);
    this.known.set(path, { content, lastModified });
  }

  async pull(local: KlartData, { today, acceptInbox }: { today: string; acceptInbox: boolean }): Promise<PullResult> {
    let data = local;
    let changed = false;

    const configHandle = await getFileHandle(this.root, CONFIG_FILE);
    if (configHandle) {
      const read = await this.readChangedSafely({ path: CONFIG_FILE, handle: configHandle });
      const parsed = read && KlartConfigSchema.safeParse(read.json);
      if (read && parsed?.success) {
        const contexts = read.isNew ? mergeContexts(data.contexts, parsed.data.contexts) : parsed.data.contexts;
        data = { ...data, contexts };
        changed = true;
      }
    }

    const taskFiles = (await listFiles(this.root, "tasks", 1)).filter((file) => file.path.endsWith(".json"));
    for (const file of taskFiles) {
      const read = await this.readChangedSafely(file);
      if (!read) {
        continue;
      }
      const parsed = TaskFileSchema.safeParse(read.json);
      if (!parsed.success) {
        continue;
      }
      const remote = parsed.data as Task;
      const current = data.tasks[remote.id];
      if (!current || remote.updatedAt > current.updatedAt) {
        data = { ...data, tasks: { ...data.tasks, [remote.id]: remote } };
        changed = true;
      } else if (remote.updatedAt < current.updatedAt && !read.isNew) {
        await this.write(`.conflicts/${remote.id}-${remote.updatedAt.replace(/[:]/g, "")}.json`, read.text);
      }
    }

    const dayFiles = (await listFiles(this.root, "days", 0)).filter((file) =>
      /\d{4}-\d{2}-\d{2}\.json$/.test(file.path)
    );
    for (const file of dayFiles) {
      const read = await this.readChangedSafely(file);
      const parsed = read && DayFileSchema.safeParse(read.json);
      if (read && parsed?.success) {
        const remote = parsed.data as DayFile;
        const day = read.isNew ? mergeDays(data.days[remote.date], remote) : remote;
        data = { ...data, days: { ...data.days, [remote.date]: day } };
        changed = true;
      }
    }

    let inboxCount = 0;
    if (acceptInbox) {
      const result = await this.pullInbox(data, today);
      data = result.data;
      inboxCount = result.count;
      changed = changed || result.count > 0;
    }

    return { data, changed, inboxCount };
  }

  private async readChangedSafely(file: FolderFile): Promise<{ text: string; json: unknown; isNew: boolean } | null> {
    const read = await this.readChanged(file.path, file.handle);
    if (!read) {
      return null;
    }
    try {
      return { ...read, json: JSON.parse(read.text) };
    } catch {
      return null;
    }
  }

  private async pullInbox(local: KlartData, today: string): Promise<{ data: KlartData; count: number }> {
    let data = local;
    let count = 0;
    const now = new Date();

    for (const file of await listFiles(this.root, "inbox", 0)) {
      const text = await (await file.handle.getFile()).text();
      const tasks: Task[] = [];

      if (file.path.endsWith(".json")) {
        let json: unknown;
        try {
          json = JSON.parse(text);
        } catch {
          continue;
        }
        const parsed = InboxTaskSchema.safeParse(json);
        if (!parsed.success) {
          continue;
        }
        const entry = parsed.data;
        const tags = (entry.tags ?? []).map((tag) => tag.toLowerCase().replace(/^#/, ""));
        const routed = parseQuickAdd(tags.map((tag) => `#${tag}`).join(" "), {
          today,
          contexts: data.contexts,
          currentContext: entry.context ?? "all",
        });
        const task = createTask(
          {
            title: entry.title,
            context: routed.context,
            tags,
            due: entry.due ?? null,
            remindAt: entry.remindAt ?? null,
            important: entry.important ?? false,
            raw: "",
          },
          now
        );
        tasks.push({ ...task, notes: entry.notes ?? "" });
      } else if (file.path.endsWith(".txt") || file.path.endsWith(".md")) {
        for (const line of text.split(/\r?\n/)) {
          const parsed = parseQuickAdd(line, { today, contexts: data.contexts, currentContext: "all" });
          if (parsed.title) {
            tasks.push(createTask(parsed, now));
          }
        }
      } else {
        continue;
      }

      for (const task of tasks) {
        data = { ...data, tasks: { ...data.tasks, [task.id]: task } };
      }
      count += tasks.length;
      await removeFile(this.root, file.path);
    }

    return { data, count };
  }

  async push(data: KlartData, { today, options }: { today: string; options: AgentFileOptions }): Promise<number> {
    const desired = new Map<string, string>();
    desired.set(CONFIG_FILE, serialize({ schema: "klart.config/v1", contexts: data.contexts }));
    for (const task of Object.values(data.tasks)) {
      desired.set(taskPath(task), serialize(task));
    }
    for (const day of Object.values(data.days)) {
      desired.set(dayPath(day.date), serialize(day));
    }
    if (options.keepLlmsTxt) {
      desired.set(LLMS_FILE, LLMS_TXT);
    }

    let written = 0;
    for (const [path, content] of desired) {
      if (this.known.get(path)?.content !== content) {
        await this.write(path, content);
        written += 1;
      }
    }

    // A task that moved context leaves its old file behind; remove it.
    for (const path of [...this.known.keys()]) {
      if (path.startsWith("tasks/") && !desired.has(path)) {
        await removeFile(this.root, path);
        this.known.delete(path);
      }
    }

    if (options.writeViews) {
      const generatedAt = toUtcTimestamp(new Date());
      const views = {
        "views/today.json": buildTodayView(data, today, generatedAt),
        "views/suggestions.json": buildSuggestionsView(data, today, generatedAt),
      };
      for (const [path, view] of Object.entries(views)) {
        const signature = JSON.stringify({ ...view, generatedAt: null });
        if (this.viewSignatures.get(path) !== signature) {
          await this.write(path, serialize(view));
          this.viewSignatures.set(path, signature);
          written += 1;
        }
      }
    }

    return written;
  }

  /** Records that this device is in use, so "the computer I used last" can decide who notifies. */
  async touchDevice(lastActiveAt: string): Promise<void> {
    const path = `devices/${toDeviceId(this.deviceName)}/device.json`;
    await this.write(path, serialize({ name: this.deviceName, lastActiveAt }));
  }

  async listDevices(): Promise<DeviceInfo[]> {
    const files = (await listFiles(this.root, "devices", 1)).filter((file) => file.path.endsWith("/device.json"));
    const devices: DeviceInfo[] = [];
    for (const file of files) {
      try {
        const parsed = DeviceFileSchema.safeParse(JSON.parse(await (await file.handle.getFile()).text()));
        if (parsed.success) {
          devices.push({ id: file.path.split("/")[1]!, ...parsed.data });
        }
      } catch {
        // Ignore unreadable device files.
      }
    }
    return devices.sort((a, b) => b.lastActiveAt.localeCompare(a.lastActiveAt));
  }
}
