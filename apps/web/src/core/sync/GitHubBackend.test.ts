import { beforeEach, describe, expect, it } from "vitest";
import { FolderSync } from "./FolderSync";
import { GitHubBackend, GitHubError, gitBlobSha, parseRepository } from "./GitHubBackend";
import type { KlartData } from "~/core/tasks/KlartData";
import { createEmptyData, createTask, updateTask } from "~/core/tasks/KlartData";
import { parseQuickAdd } from "~/core/tasks/QuickAdd";

const TODAY = "2026-10-21";
const OPTIONS = { writeViews: false, acceptInbox: true, keepLlmsTxt: false };
const TOKEN = "github_pat_test";

interface FakeCommit {
  tree: Map<string, string>;
}

/** Just enough of GitHub's REST API, kept in memory. */
class FakeGitHub {
  readonly blobs = new Map<string, string>();
  readonly commits = new Map<string, FakeCommit>();
  readonly trees = new Map<string, Map<string, string>>();
  head: string | null = null;
  isPrivate = true;
  requests: string[] = [];
  private nextId = 1;

  private id(prefix: string): string {
    return `${prefix}${String(this.nextId++).padStart(39, "0")}`;
  }

  private respond(status: number, body?: unknown, headers: Record<string, string> = {}): Response {
    return new Response(body === undefined ? null : JSON.stringify(body), { status, headers });
  }

  /** Test helper: the file at `path` on the branch, or `undefined`. */
  file(path: string): string | undefined {
    const sha = this.head ? this.commits.get(this.head)!.tree.get(path) : undefined;
    return sha ? this.blobs.get(sha) : undefined;
  }

  /** Test helper: commits a change as another device would. */
  async push(files: Record<string, string>): Promise<void> {
    const tree = new Map(this.head ? this.commits.get(this.head)!.tree : []);
    for (const [path, content] of Object.entries(files)) {
      const sha = await gitBlobSha(content);
      this.blobs.set(sha, content);
      tree.set(path, sha);
    }
    this.head = this.commit(tree);
  }

  private commit(tree: Map<string, string>): string {
    const sha = this.id("c");
    this.commits.set(sha, { tree });
    return sha;
  }

  readonly fetch = async (input: string, init: RequestInit = {}): Promise<Response> => {
    const headers = init.headers as Record<string, string>;
    if (headers.Authorization !== `Bearer ${TOKEN}`) {
      return this.respond(401, { message: "Bad credentials" });
    }
    const url = new URL(input);
    const method = init.method ?? "GET";
    const path = url.pathname.replace("/repos/you/klart-data", "");
    this.requests.push(`${method} ${path}`);
    const body = init.body ? JSON.parse(init.body as string) : undefined;

    if (!url.pathname.startsWith("/repos/you/klart-data")) {
      return this.respond(404, { message: "Not Found" });
    }
    if (path === "") {
      return this.respond(200, { private: this.isPrivate, default_branch: "main", permissions: { push: true } });
    }
    if (path === "/git/ref/heads/main") {
      if (!this.head) {
        return this.respond(409, { message: "Git Repository is empty." });
      }
      if (headers["If-None-Match"] === `"${this.head}"`) {
        return this.respond(304);
      }
      return this.respond(200, { object: { sha: this.head } }, { etag: `"${this.head}"` });
    }
    const commitMatch = /^\/git\/commits\/(\w+)$/.exec(path);
    if (commitMatch) {
      const treeSha = this.id("t");
      this.trees.set(treeSha, this.commits.get(commitMatch[1]!)!.tree);
      return this.respond(200, { tree: { sha: treeSha } });
    }
    const treeMatch = /^\/git\/trees\/(\w+)$/.exec(path);
    if (treeMatch && method === "GET") {
      const tree = this.trees.get(treeMatch[1]!)!;
      return this.respond(200, {
        truncated: false,
        tree: [...tree].map(([entryPath, sha]) => ({ path: entryPath, type: "blob", sha })),
      });
    }
    const blobMatch = /^\/git\/blobs\/(\w+)$/.exec(path);
    if (blobMatch) {
      const content = this.blobs.get(blobMatch[1]!)!;
      const bytes = new TextEncoder().encode(content);
      return this.respond(200, { encoding: "base64", content: btoa(String.fromCharCode(...bytes)) });
    }
    if (path.startsWith("/contents/") && method === "PUT") {
      if (this.head) {
        return this.respond(422, { message: "sha wasn't supplied" });
      }
      const bytes = Uint8Array.from(atob(body.content), (char) => char.charCodeAt(0));
      const content = new TextDecoder().decode(bytes);
      const sha = await gitBlobSha(content);
      this.blobs.set(sha, content);
      const tree = new Map([[decodeURIComponent(path.slice("/contents/".length)), sha]]);
      this.head = this.commit(tree);
      const treeSha = this.id("t");
      this.trees.set(treeSha, tree);
      return this.respond(201, { content: { sha }, commit: { sha: this.head, tree: { sha: treeSha } } });
    }
    if (path === "/git/trees" && method === "POST") {
      const tree = new Map(this.trees.get(body.base_tree)!);
      for (const entry of body.tree as { path: string; sha?: string | null; content?: string }[]) {
        if (entry.content === undefined) {
          tree.delete(entry.path);
        } else {
          const sha = await gitBlobSha(entry.content);
          this.blobs.set(sha, entry.content);
          tree.set(entry.path, sha);
        }
      }
      const sha = this.id("t");
      this.trees.set(sha, tree);
      return this.respond(201, { sha });
    }
    if (path === "/git/commits" && method === "POST") {
      const sha = this.id("c");
      this.commits.set(sha, { tree: this.trees.get(body.tree)! });
      (this.commits.get(sha) as FakeCommit & { parent?: string }).parent = body.parents[0];
      return this.respond(201, { sha });
    }
    if (path === "/git/refs/heads/main" && method === "PATCH") {
      const parent = (this.commits.get(body.sha) as FakeCommit & { parent?: string }).parent;
      if (parent !== this.head) {
        return this.respond(422, { message: "Update is not a fast forward" });
      }
      this.head = body.sha;
      return this.respond(200, { object: { sha: body.sha } });
    }
    return this.respond(404, { message: "Not Found" });
  };
}

function seed(): KlartData {
  const data = createEmptyData();
  const parsed = parseQuickAdd("#work review PR @today", {
    today: TODAY,
    contexts: data.contexts,
    currentContext: "all",
  });
  return { ...data, tasks: { T1: createTask(parsed, new Date("2026-10-21T08:00:00Z"), "T1") } };
}

function backend(github: FakeGitHub, token = TOKEN): GitHubBackend {
  return new GitHubBackend({ owner: "you", repo: "klart-data", token }, github.fetch);
}

describe("parseRepository", () => {
  it("accepts a name, owner/name or a URL", () => {
    expect(parseRepository("you", "klart-data")).toEqual({ owner: "you", repo: "klart-data" });
    expect(parseRepository("you", "team/klart-data")).toEqual({ owner: "team", repo: "klart-data" });
    expect(parseRepository("", "https://github.com/team/klart-data.git")).toEqual({
      owner: "team",
      repo: "klart-data",
    });
    expect(parseRepository("", "git@github.com:team/klart-data.git")).toEqual({ owner: "team", repo: "klart-data" });
  });
});

describe("GitHubBackend", () => {
  let github: FakeGitHub;

  beforeEach(() => {
    github = new FakeGitHub();
  });

  it("computes the same blob sha as git", async () => {
    // `printf 'hello\n' | git hash-object --stdin`
    expect(await gitBlobSha("hello\n")).toBe("ce013625030ba8dba906f756967f9e9ca394464a");
  });

  it("pushes the first sync into an empty repository as one commit after the first file", async () => {
    const repo = backend(github);
    const sync = new FolderSync(repo, "Phone");
    await repo.refresh();
    await sync.push(seed(), { today: TODAY, options: OPTIONS });

    expect(await repo.commit("klart: sync")).toBe(true);
    expect(JSON.parse(github.file("klart.json")!)).toMatchObject({ schema: "klart.config/v1" });
    expect(JSON.parse(github.file("tasks/work/T1.json")!)).toMatchObject({ id: "T1" });
    expect(repo.hasChanges).toBe(false);
    expect(github.requests.filter((request) => request.startsWith("PUT"))).toHaveLength(1);
  });

  it("brings another device's changes in and doesn't download its own files again", async () => {
    const phone = backend(github);
    const phoneSync = new FolderSync(phone, "Phone");
    await phone.refresh();
    await phoneSync.push(seed(), { today: TODAY, options: OPTIONS });
    await phone.commit("klart: sync");

    const desktop = backend(github);
    const desktopSync = new FolderSync(desktop, "Mac");
    await desktop.refresh();
    const pulled = await desktopSync.pull(createEmptyData(), { today: TODAY, acceptInbox: true });
    expect(pulled.data.tasks.T1?.title).toBe("Review PR");

    github.requests = [];
    expect(await phone.refresh()).toBe(false);
    expect(github.requests).toEqual(["GET /git/ref/heads/main"]);
    const again = await phoneSync.pull(seed(), { today: TODAY, acceptInbox: true });
    expect(again.changed).toBe(false);
  });

  it("drops a staged file another device changed, so the pull merges it by updatedAt", async () => {
    const phone = backend(github);
    const phoneSync = new FolderSync(phone, "Phone");
    let phoneData = seed();
    await phone.refresh();
    await phoneSync.push(phoneData, { today: TODAY, options: OPTIONS });
    await phone.commit("klart: sync");

    // The desktop renames the task and pushes first.
    const remote = updateTask(phoneData, "T1", { title: "Remote title" }, new Date("2026-10-21T09:00:00Z"));
    await github.push({ "tasks/work/T1.json": `${JSON.stringify(remote.tasks.T1, null, 2)}\n` });

    // Meanwhile the phone marks it important, a bit later.
    phoneData = updateTask(phoneData, "T1", { important: true }, new Date("2026-10-21T09:05:00Z"));
    await phoneSync.push(phoneData, { today: TODAY, options: OPTIONS });
    await expect(phone.commit("klart: sync")).rejects.toMatchObject({ kind: "conflict" });

    await phone.refresh();
    const pulled = await phoneSync.pull(phoneData, { today: TODAY, acceptInbox: true });
    await phoneSync.push(pulled.data, { today: TODAY, options: OPTIONS });
    expect(await phone.commit("klart: sync")).toBe(true);

    expect(JSON.parse(github.file("tasks/work/T1.json")!)).toMatchObject({ important: true });
    const conflicts = [...github.commits.get(github.head!)!.tree.keys()].filter((path) =>
      path.startsWith(".conflicts/")
    );
    expect(conflicts).toHaveLength(1);
  });

  it("turns inbox files into tasks and removes them in the next commit", async () => {
    await github.push({ "klart.json": "{}\n", "inbox/plan.txt": "#work call the bank\n" });
    const phone = backend(github);
    const sync = new FolderSync(phone, "Phone");
    await phone.refresh();
    const pulled = await sync.pull(createEmptyData(), { today: TODAY, acceptInbox: true });
    expect(pulled.inboxCount).toBe(1);

    await sync.push(pulled.data, { today: TODAY, options: OPTIONS });
    await phone.commit("klart: sync");
    expect(github.file("inbox/plan.txt")).toBeUndefined();
  });

  it("reports a wrong token and a missing repository", async () => {
    await expect(backend(github, "wrong").info()).rejects.toMatchObject({ kind: "unauthorized" });
    const missing = new GitHubBackend({ owner: "you", repo: "nope", token: TOKEN }, github.fetch);
    await expect(missing.info()).rejects.toBeInstanceOf(GitHubError);
    await expect(missing.info()).rejects.toMatchObject({ kind: "not-found" });
  });
});
