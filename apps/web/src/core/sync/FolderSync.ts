import { z } from "zod";
import { DATA_VERSION, isNewerDataVersion, NewerDataVersionError } from "./DataVersion";
import type { FolderBackend, FolderFileInfo } from "./FolderBackend";
import { LLMS_TXT } from "./LlmsTxt";
import type { AutomationRequest } from "~/core/automations/Automations";
import { requestPath } from "~/core/automations/Automations";
import type { KlartContext } from "~/core/contexts/KlartContext";
import { ALL_CONTEXTS, CONTEXT_COLORS } from "~/core/contexts/KlartContext";
import { reconcileShoppingTasks } from "~/core/shopping/ShoppingData";
import type { ShoppingList } from "~/core/shopping/ShoppingList";
import { getListContext, ShoppingListFileSchema } from "~/core/shopping/ShoppingList";
import { buildShoppingView, buildSuggestionsView, buildTodayView } from "~/core/tasks/AgentViews";
import type { DayFile } from "~/core/tasks/Day";
import { DayFileSchema } from "~/core/tasks/Day";
import type { KlartData } from "~/core/tasks/KlartData";
import { createTask, reconcileRecurringTasks } from "~/core/tasks/KlartData";
import { toUtcTimestamp } from "~/core/tasks/LocalDate";
import { parseQuickAdd } from "~/core/tasks/QuickAdd";
import type { Task } from "~/core/tasks/Task";
import { InboxTaskSchema, TaskFileSchema } from "~/core/tasks/Task";
import { toTaskLinks } from "~/core/tasks/TaskLink";

export const CONFIG_FILE = "klart.json";
export const LLMS_FILE = "LLMS.txt";

const KlartConfigSchema = z.object({
  schema: z.string().optional(),
  /** The newest data version that wrote to this folder; older apps don't sync with it. */
  dataVersion: z.string().optional(),
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

/** Only the context ids, so a config this version can't fully read (e.g. no contexts) still says what it lists. */
const ListedContextsSchema = z.object({
  contexts: z.array(z.object({ id: z.string() }).catch({ id: "" })).catch([]),
});

function listedContextIds(text: string): string[] {
  try {
    const parsed = ListedContextsSchema.safeParse(JSON.parse(text));
    return parsed.success ? parsed.data.contexts.map((context) => context.id).filter(Boolean) : [];
  } catch {
    return [];
  }
}

/** Only the data version, so a folder whose config this version can't read still says what it needs. */
const DataVersionSchema = z.object({ dataVersion: z.string().catch("") });

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
  /** Write `views/today.json`, `views/suggestions.json` and `views/shopping.json`. */
  writeViews: boolean;
  /** Turn files dropped into `inbox/` into tasks. */
  acceptInbox: boolean;
  /** Keep `LLMS.txt` in the folder root. */
  keepLlmsTxt: boolean;
}

/**
 * Which part of the data a folder holds. With one sync it holds everything;
 * with several, each holds the contexts assigned to it.
 */
export interface SyncScope {
  /** The folder holds this context: its `klart.json` entry, its tasks and its shopping lists. */
  ownsContext: (contextId: string) => boolean;
  /** The primary folder also holds My Day entries whose task isn't known yet. */
  isPrimary: boolean;
}

/** Everything in one folder: the setup most people have. */
export const FULL_SCOPE: SyncScope = { ownsContext: () => true, isPrimary: true };

export interface PullResult {
  data: KlartData;
  changed: boolean;
  inboxCount: number;
  /** The context ids in the folder's `klart.json`, when it was read in this pull. */
  contextIds: string[] | null;
}

/**
 * What a folder held after this device last synced with it, kept between
 * sessions. It's the common ancestor that tells a file another device removed
 * apart from one this device hasn't written yet, so a device that was closed
 * for a while doesn't write removed contexts, tasks or lists back.
 */
export interface SyncBase {
  /** The context ids in the folder's `klart.json`. */
  contexts: string[];
  /** Task ids in the folder, with the `updatedAt` of the version it held. */
  tasks: Record<string, string>;
  /** Shopping list ids in the folder, with the `updatedAt` of the version it held. */
  lists: Record<string, string>;
}

/**
 * A folder that listed contexts last time now has no `klart.json`, or one that
 * lists none. That's a wiped folder or a broken write, not a decision to delete
 * everything, so this sync stops until someone fixes the folder.
 */
export class EmptiedFolderError extends Error {
  constructor() {
    super("This folder's klart.json is missing or lists no contexts. Restore it before syncing again.");
    this.name = "EmptiedFolderError";
  }
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

export function listPath(list: ShoppingList): string {
  return `lists/${list.id}.json`;
}

export function toDeviceId(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "device"
  );
}

/** The id a task or list file is named after: `tasks/work/T1.json` → `T1`. */
function fileId(path: string): string {
  return path.slice(path.lastIndexOf("/") + 1).replace(/\.json$/, "");
}

/** `data` without the task and its My Day items. */
function withoutTask(data: KlartData, taskId: string): KlartData {
  const tasks = { ...data.tasks };
  delete tasks[taskId];
  const days: Record<string, DayFile> = {};
  for (const [date, day] of Object.entries(data.days)) {
    days[date] = day.items.some((item) => item.taskId === taskId)
      ? { ...day, items: day.items.filter((item) => item.taskId !== taskId) }
      : day;
  }
  return { ...data, tasks, days };
}

function mergeDays(local: DayFile | undefined, remote: DayFile): DayFile {
  if (!local) {
    return remote;
  }
  const remoteIds = new Set(remote.items.map((item) => item.taskId));
  return { ...remote, items: [...remote.items, ...local.items.filter((item) => !remoteIds.has(item.taskId))] };
}

/**
 * Takes the folder's version of every context it lists and keeps the rest. A
 * pull never removes a context: one that left this folder may live in another
 * sync, and the sync lifecycle only drops it once no folder lists it.
 */
function mergeContexts(local: KlartContext[], remote: KlartContext[]): KlartContext[] {
  if (local.length === 0) {
    return remote;
  }
  return mergeOwned(
    local,
    remote,
    (context) => context.id,
    () => false
  );
}

/**
 * Replaces the entries a folder owns with the folder's, keeping the others where
 * they are: owned slots take the remote entries in order, leftovers go at the end.
 * When the folder owns everything this is just `remote`.
 */
function mergeOwned<T>(local: T[], remote: T[], keyOf: (item: T) => string, owns: (item: T) => boolean): T[] {
  const remoteKeys = new Set(remote.map(keyOf));
  const queue = [...remote];
  const merged: T[] = [];
  for (const item of local) {
    if (owns(item) || remoteKeys.has(keyOf(item))) {
      const next = queue.shift();
      if (next) {
        merged.push(next);
      }
    } else {
      merged.push(item);
    }
  }
  return [...merged, ...queue];
}

function ownsTaskId(data: KlartData, scope: SyncScope, taskId: string): boolean {
  const task = data.tasks[taskId];
  return task ? scope.ownsContext(task.context) : scope.isPrimary;
}

/** The part of `data` that belongs in a folder with this scope. */
export function scopeData(data: KlartData, scope: SyncScope): KlartData {
  if (scope === FULL_SCOPE) {
    return data;
  }
  const tasks: Record<string, Task> = {};
  for (const task of Object.values(data.tasks)) {
    if (scope.ownsContext(task.context)) {
      tasks[task.id] = task;
    }
  }
  const days: Record<string, DayFile> = {};
  for (const day of Object.values(data.days)) {
    days[day.date] = { ...day, items: day.items.filter((item) => ownsTaskId(data, scope, item.taskId)) };
  }
  const lists: Record<string, ShoppingList> = {};
  for (const list of Object.values(data.lists)) {
    if (scope.ownsContext(getListContext(list, data.contexts))) {
      lists[list.id] = list;
    }
  }
  return {
    contexts: data.contexts.filter((context) => scope.ownsContext(context.id)),
    tasks,
    days,
    lists,
  };
}

/**
 * Two-way sync between {@link KlartData} and a folder of plain files.
 *
 * The folder is the source of truth. Each file's last seen content and
 * `lastModified` are remembered, so a pull only reads what changed on disk and
 * a push only writes what changed in the app. Tasks resolve by `updatedAt`
 * (newest wins); a losing remote edit is kept in `.conflicts/`. File access
 * goes through a {@link FolderBackend}, so it works in the browser and the desktop app.
 */
export class FolderSync {
  private readonly known = new Map<string, KnownFile>();
  private readonly viewSignatures = new Map<string, string>();
  /** The data version last read from `klart.json`, by its `lastModified`. */
  private folderVersion: { lastModified: number; version: string } | null = null;
  /** The context ids in the folder's `klart.json` as last read or written; `null` when never seen. */
  private listed: string[] | null;
  /** Task and list ids the folder held, with the `updatedAt` it held them at; see {@link SyncBase}. */
  private readonly seenTasks: Map<string, string>;
  private readonly seenLists: Map<string, string>;
  private read = false;

  constructor(
    private readonly folder: FolderBackend,
    private readonly deviceName: string,
    /** This app's data version; injected in tests. */
    private readonly dataVersion = DATA_VERSION,
    /** What the folder held when this device last synced with it, from an earlier session. */
    base: SyncBase | null = null
  ) {
    this.listed = base ? [...base.contexts] : null;
    this.seenTasks = new Map(Object.entries(base?.tasks ?? {}));
    this.seenLists = new Map(Object.entries(base?.lists ?? {}));
  }

  get folderName(): string {
    return this.folder.name;
  }

  /** Whether this engine has read the folder; nothing should be written before it has. */
  get hasRead(): boolean {
    return this.read;
  }

  /** The context ids the folder's `klart.json` lists, or `null` before the first pull. */
  get listedContextIds(): string[] | null {
    return this.read ? this.listed : null;
  }

  /** What the folder holds as of the last pull or push, to keep for the next session. */
  get base(): SyncBase {
    return {
      contexts: [...(this.listed ?? [])],
      tasks: Object.fromEntries(this.seenTasks),
      lists: Object.fromEntries(this.seenLists),
    };
  }

  /** Reads a file only when it changed since last seen. Returns `null` when unchanged. */
  private async readChanged({ path, lastModified }: FolderFileInfo): Promise<{ text: string; isNew: boolean } | null> {
    const known = this.known.get(path);
    if (known && known.lastModified === lastModified) {
      return null;
    }
    const text = await this.folder.read(path);
    this.known.set(path, { content: text, lastModified });
    if (known && known.content === text) {
      return null;
    }
    return { text, isNew: !known };
  }

  /**
   * Throws {@link NewerDataVersionError} when a newer version of Klart wrote to
   * the folder. Reads `klart.json` on its own (only when it changed), so the
   * pull still sees the file as changed afterwards.
   */
  private async checkDataVersion(): Promise<void> {
    const lastModified = await this.folder.stat(CONFIG_FILE);
    if (lastModified === null) {
      return;
    }
    if (this.folderVersion?.lastModified !== lastModified) {
      let version = "";
      try {
        const parsed = DataVersionSchema.safeParse(JSON.parse(await this.folder.read(CONFIG_FILE)));
        version = parsed.success ? parsed.data.dataVersion : "";
      } catch {
        // An unreadable config is the pull's problem, not a version mismatch.
      }
      this.folderVersion = { lastModified, version };
    }
    const { version } = this.folderVersion;
    if (version && isNewerDataVersion(version, this.dataVersion)) {
      throw new NewerDataVersionError(version);
    }
  }

  private async write(path: string, content: string): Promise<void> {
    const lastModified = await this.folder.write(path, content);
    this.known.set(path, { content, lastModified });
    if (path === CONFIG_FILE) {
      this.folderVersion = { lastModified, version: this.dataVersion };
      this.listed = listedContextIds(content);
    }
  }

  async pull(
    local: KlartData,
    { today, acceptInbox, scope = FULL_SCOPE }: { today: string; acceptInbox: boolean; scope?: SyncScope }
  ): Promise<PullResult> {
    let data = local;
    let changed = false;
    let contextIds: string[] | null = null;

    await this.checkDataVersion();

    const listedBefore = this.listed ?? [];
    const configModified = await this.folder.stat(CONFIG_FILE);
    let listedNow: string[] = [];
    if (configModified !== null) {
      const read = await this.readChangedSafely({ path: CONFIG_FILE, lastModified: configModified });
      const parsed = read && KlartConfigSchema.safeParse(read.json);
      if (read && parsed?.success) {
        const remote = parsed.data.contexts;
        data = { ...data, contexts: mergeContexts(data.contexts, remote) };
        contextIds = remote.map((context) => context.id);
        changed = true;
      }
      const known = this.known.get(CONFIG_FILE);
      listedNow = known ? listedContextIds(known.content) : [];
    }
    if (listedNow.length === 0 && listedBefore.length > 0) {
      throw new EmptiedFolderError();
    }
    this.listed = listedNow;

    // Push compares against what's on disk, so a folder written by an older version gets this version's LLMS.txt.
    const llmsModified = await this.folder.stat(LLMS_FILE);
    if (llmsModified !== null) {
      await this.readChanged({ path: LLMS_FILE, lastModified: llmsModified });
    }

    const taskFiles = (await this.folder.list("tasks", 1)).filter((file) => file.path.endsWith(".json"));
    const taskIdsInFolder = new Set(taskFiles.map((file) => fileId(file.path)));
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
      this.seenTasks.set(remote.id, remote.updatedAt);
      const current = data.tasks[remote.id];
      if (!current || remote.updatedAt > current.updatedAt) {
        data = { ...data, tasks: { ...data.tasks, [remote.id]: remote } };
        changed = true;
      } else if (remote.updatedAt < current.updatedAt && !read.isNew) {
        await this.write(`.conflicts/${remote.id}-${remote.updatedAt.replace(/[:]/g, "")}.json`, read.text);
      }
    }
    // A task the folder held and no longer does was removed (or moved to another sync, which brings it back).
    // An edit made here since then wins over the removal and is written back.
    for (const [id, seenAt] of [...this.seenTasks]) {
      if (taskIdsInFolder.has(id)) {
        continue;
      }
      this.seenTasks.delete(id);
      const current = data.tasks[id];
      if (current && current.updatedAt <= seenAt) {
        data = withoutTask(data, id);
        changed = true;
      }
    }

    const dayFiles = (await this.folder.list("days", 0)).filter((file) => /\d{4}-\d{2}-\d{2}\.json$/.test(file.path));
    for (const file of dayFiles) {
      const read = await this.readChangedSafely(file);
      const parsed = read && DayFileSchema.safeParse(read.json);
      if (read && parsed?.success) {
        const remote = parsed.data as DayFile;
        const local = data.days[remote.date];
        const day =
          read.isNew || !local
            ? mergeDays(local, remote)
            : {
                ...remote,
                items: mergeOwned(
                  local.items,
                  remote.items,
                  (item) => item.taskId,
                  (item) => ownsTaskId(data, scope, item.taskId)
                ),
              };
        data = { ...data, days: { ...data.days, [remote.date]: day } };
        changed = true;
      }
    }

    const listFiles = (await this.folder.list("lists", 0)).filter((file) => file.path.endsWith(".json"));
    const listIdsInFolder = new Set(listFiles.map((file) => fileId(file.path)));
    for (const file of listFiles) {
      const read = await this.readChangedSafely(file);
      const parsed = read && ShoppingListFileSchema.safeParse(read.json);
      if (!read || !parsed?.success) {
        continue;
      }
      const remote = parsed.data as ShoppingList;
      this.seenLists.set(remote.id, remote.updatedAt);
      const current = data.lists[remote.id];
      if (!current || remote.updatedAt > current.updatedAt) {
        data = { ...data, lists: { ...data.lists, [remote.id]: remote } };
        changed = true;
      } else if (remote.updatedAt < current.updatedAt && !read.isNew) {
        await this.write(`.conflicts/list-${remote.id}-${remote.updatedAt.replace(/[:]/g, "")}.json`, read.text);
      }
    }
    for (const [id, seenAt] of [...this.seenLists]) {
      if (listIdsInFolder.has(id)) {
        continue;
      }
      this.seenLists.delete(id);
      const current = data.lists[id];
      if (current && current.updatedAt <= seenAt) {
        const lists = { ...data.lists };
        delete lists[id];
        data = { ...data, lists };
        changed = true;
      }
    }
    this.read = true;

    // A task completed in another app or by an agent marks its shopping item bought, or brings a recurring one back.
    if (changed) {
      data = reconcileRecurringTasks(reconcileShoppingTasks(data), new Date());
    }

    let inboxCount = 0;
    if (acceptInbox) {
      // Tasks dropped into this folder's inbox land in a context the folder holds.
      const home = data.contexts.find((context) => scope.ownsContext(context.id))?.id ?? ALL_CONTEXTS;
      const result = await this.pullInbox(data, today, home);
      data = result.data;
      inboxCount = result.count;
      changed = changed || result.count > 0;
    }

    return { data, changed, inboxCount, contextIds };
  }

  private async readChangedSafely(
    file: FolderFileInfo
  ): Promise<{ text: string; json: unknown; isNew: boolean } | null> {
    const read = await this.readChanged(file);
    if (!read) {
      return null;
    }
    try {
      return { ...read, json: JSON.parse(read.text) };
    } catch {
      return null;
    }
  }

  private async pullInbox(local: KlartData, today: string, home: string): Promise<{ data: KlartData; count: number }> {
    let data = local;
    let count = 0;
    const now = new Date();

    for (const file of await this.folder.list("inbox", 0)) {
      const text = await this.folder.read(file.path);
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
        const repeat = entry.repeat ? { ...entry.repeat, from: entry.repeat.from ?? entry.due ?? today } : null;
        const tags = (entry.tags ?? []).map((tag) => tag.toLowerCase().replace(/^#/, ""));
        const routed = parseQuickAdd(tags.map((tag) => `#${tag}`).join(" "), {
          today,
          contexts: data.contexts,
          currentContext: entry.context ?? home,
        });
        const task = createTask(
          {
            title: entry.title,
            context: routed.context,
            tags,
            due: entry.due ?? repeat?.from ?? null,
            remindAt: entry.remindAt ?? null,
            important: entry.important ?? false,
            links: toTaskLinks(entry.links ?? []),
            repeat,
            raw: "",
          },
          now
        );
        tasks.push({ ...task, notes: entry.notes ?? "" });
      } else if (file.path.endsWith(".txt") || file.path.endsWith(".md")) {
        for (const line of text.split(/\r?\n/)) {
          const parsed = parseQuickAdd(line, { today, contexts: data.contexts, currentContext: home });
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
      await this.folder.remove(file.path);
    }

    return { data, count };
  }

  async push(
    all: KlartData,
    { today, options, scope = FULL_SCOPE }: { today: string; options: AgentFileOptions; scope?: SyncScope }
  ): Promise<number> {
    await this.checkDataVersion();

    const data = scopeData(all, scope);
    const desired = new Map<string, string>();
    // Never empty a folder's klart.json: with no contexts left to list, this device is out of date, not the folder.
    if (data.contexts.length > 0 || !this.known.has(CONFIG_FILE)) {
      desired.set(
        CONFIG_FILE,
        serialize({ schema: "klart.config/v1", dataVersion: this.dataVersion, contexts: data.contexts })
      );
    }
    for (const task of Object.values(data.tasks)) {
      desired.set(taskPath(task), serialize(task));
    }
    for (const day of Object.values(data.days)) {
      // A folder that only holds some contexts gets a day file once it has something in it.
      if (scope.isPrimary || day.items.length > 0 || this.known.has(dayPath(day.date))) {
        desired.set(dayPath(day.date), serialize(day));
      }
    }
    for (const list of Object.values(data.lists)) {
      desired.set(listPath(list), serialize(list));
    }
    // A list without a context (from an older app) belongs to whichever context comes first, which can differ
    // between devices; it stays in the folder that has it rather than moving with that.
    for (const list of Object.values(all.lists)) {
      if (list.context === null && this.known.has(listPath(list))) {
        desired.set(listPath(list), serialize(list));
      }
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

    // A task that moved context (or to another sync) leaves its old file behind; remove it. So does a list.
    for (const path of [...this.known.keys()]) {
      if ((path.startsWith("tasks/") || path.startsWith("lists/")) && !desired.has(path)) {
        await this.folder.remove(path);
        this.known.delete(path);
      }
    }

    // The folder now holds exactly these tasks and lists, as far as this device knows.
    this.seenTasks.clear();
    for (const task of Object.values(data.tasks)) {
      this.seenTasks.set(task.id, task.updatedAt);
    }
    this.seenLists.clear();
    for (const [path, content] of desired) {
      if (path.startsWith("lists/")) {
        this.seenLists.set(fileId(path), (JSON.parse(content) as ShoppingList).updatedAt);
      }
    }

    if (options.writeViews) {
      const generatedAt = toUtcTimestamp(new Date());
      const views = {
        "views/today.json": buildTodayView(data, today, generatedAt),
        "views/suggestions.json": buildSuggestionsView(data, today, generatedAt),
        "views/shopping.json": buildShoppingView(data, today, generatedAt),
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

  /** Writes automation request files to `requests/`. Klart never reads them; whatever handles one deletes it. */
  async writeRequests(requests: AutomationRequest[]): Promise<number> {
    for (const request of requests) {
      await this.write(requestPath(request), serialize(request));
    }
    return requests.length;
  }

  /** Records that this device is in use, so "the computer I used last" can decide who notifies. */
  async touchDevice(lastActiveAt: string): Promise<void> {
    const path = `devices/${toDeviceId(this.deviceName)}/device.json`;
    await this.write(path, serialize({ name: this.deviceName, lastActiveAt }));
  }

  async listDevices(): Promise<DeviceInfo[]> {
    const files = (await this.folder.list("devices", 1)).filter((file) => file.path.endsWith("/device.json"));
    const devices: DeviceInfo[] = [];
    for (const file of files) {
      try {
        const parsed = DeviceFileSchema.safeParse(JSON.parse(await this.folder.read(file.path)));
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
