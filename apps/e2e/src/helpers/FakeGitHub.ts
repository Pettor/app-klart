import { createHash } from "node:crypto";
import type { Page, Route } from "@playwright/test";

export const OWNER = "you";
export const REPO = "klart-data";
export const TOKEN = "github_pat_e2e";

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "access-control-expose-headers": "etag",
};

interface FakeCommit {
  tree: Map<string, string>;
  parent?: string | null;
}

function blobSha(content: string): string {
  const body = Buffer.from(content, "utf8");
  return createHash("sha1")
    .update(Buffer.concat([Buffer.from(`blob ${body.byteLength}\0`), body]))
    .digest("hex");
}

/**
 * Just enough of GitHub's REST API, kept in memory and served to the page
 * through Playwright's request routing. Mirrors the fake in GitHubBackend.test.ts.
 */
export class FakeGitHub {
  readonly blobs = new Map<string, string>();
  readonly commits = new Map<string, FakeCommit>();
  readonly trees = new Map<string, Map<string, string>>();
  head: string | null = null;
  isPrivate = true;
  canPush = true;
  private nextId = 1;

  private id(prefix: string): string {
    return `${prefix}${String(this.nextId++).padStart(39, "0")}`;
  }

  async install(page: Page): Promise<void> {
    await page.route("https://api.github.com/**", (route) => this.handle(route));
  }

  /** The file at `path` on the branch, or `undefined`. */
  file(path: string): string | undefined {
    const sha = this.head ? this.commits.get(this.head)!.tree.get(path) : undefined;
    return sha ? this.blobs.get(sha) : undefined;
  }

  /** Every file on the branch, joined. */
  allFiles(): string {
    const tree = this.head ? this.commits.get(this.head)!.tree : new Map<string, string>();
    return [...tree.values()].map((sha) => this.blobs.get(sha)).join("\n");
  }

  /** Commits a change as another device would. */
  push(files: Record<string, string>): void {
    const tree = new Map(this.head ? this.commits.get(this.head)!.tree : []);
    for (const [path, content] of Object.entries(files)) {
      const sha = blobSha(content);
      this.blobs.set(sha, content);
      tree.set(path, sha);
    }
    const sha = this.id("c");
    this.commits.set(sha, { tree, parent: this.head });
    this.head = sha;
  }

  private respond(route: Route, status: number, body?: unknown, headers: Record<string, string> = {}): Promise<void> {
    return route.fulfill({
      status,
      headers: { ...CORS_HEADERS, "content-type": "application/json", ...headers },
      body: body === undefined ? "" : JSON.stringify(body),
    });
  }

  private handle(route: Route): Promise<void> {
    const request = route.request();
    const method = request.method();
    if (method === "OPTIONS") {
      return route.fulfill({ status: 204, headers: CORS_HEADERS });
    }
    const headers = request.headers();
    if (headers.authorization !== `Bearer ${TOKEN}`) {
      return this.respond(route, 401, { message: "Bad credentials" });
    }
    const url = new URL(request.url());
    const prefix = `/repos/${OWNER}/${REPO}`;
    if (!url.pathname.startsWith(prefix)) {
      return this.respond(route, 404, { message: "Not Found" });
    }
    const path = url.pathname.slice(prefix.length);
    const body = request.postData() ? JSON.parse(request.postData()!) : undefined;

    if (path === "") {
      return this.respond(route, 200, {
        private: this.isPrivate,
        default_branch: "main",
        permissions: { push: this.canPush },
      });
    }
    if (path === "/git/ref/heads/main") {
      if (!this.head) {
        return this.respond(route, 409, { message: "Git Repository is empty." });
      }
      if (headers["if-none-match"] === `"${this.head}"`) {
        return this.respond(route, 304);
      }
      return this.respond(route, 200, { object: { sha: this.head } }, { etag: `"${this.head}"` });
    }
    const commitMatch = /^\/git\/commits\/(\w+)$/.exec(path);
    if (commitMatch) {
      const treeSha = this.id("t");
      this.trees.set(treeSha, this.commits.get(commitMatch[1]!)!.tree);
      return this.respond(route, 200, { tree: { sha: treeSha } });
    }
    const treeMatch = /^\/git\/trees\/(\w+)$/.exec(path);
    if (treeMatch && method === "GET") {
      const tree = this.trees.get(treeMatch[1]!)!;
      return this.respond(route, 200, {
        truncated: false,
        tree: [...tree].map(([entryPath, sha]) => ({ path: entryPath, type: "blob", sha })),
      });
    }
    const blobMatch = /^\/git\/blobs\/(\w+)$/.exec(path);
    if (blobMatch) {
      const content = this.blobs.get(blobMatch[1]!)!;
      return this.respond(route, 200, { encoding: "base64", content: Buffer.from(content).toString("base64") });
    }
    if (path.startsWith("/contents/") && method === "PUT") {
      if (this.head) {
        return this.respond(route, 422, { message: "sha wasn't supplied" });
      }
      const content = Buffer.from(body.content, "base64").toString("utf8");
      const sha = blobSha(content);
      this.blobs.set(sha, content);
      const tree = new Map([[decodeURIComponent(path.slice("/contents/".length)), sha]]);
      const commitSha = this.id("c");
      this.commits.set(commitSha, { tree, parent: null });
      this.head = commitSha;
      const treeSha = this.id("t");
      this.trees.set(treeSha, tree);
      return this.respond(route, 201, { content: { sha }, commit: { sha: commitSha, tree: { sha: treeSha } } });
    }
    if (path === "/git/trees" && method === "POST") {
      const tree = new Map(this.trees.get(body.base_tree)!);
      for (const entry of body.tree as { path: string; content?: string }[]) {
        if (entry.content === undefined) {
          tree.delete(entry.path);
        } else {
          const sha = blobSha(entry.content);
          this.blobs.set(sha, entry.content);
          tree.set(entry.path, sha);
        }
      }
      const sha = this.id("t");
      this.trees.set(sha, tree);
      return this.respond(route, 201, { sha });
    }
    if (path === "/git/commits" && method === "POST") {
      const sha = this.id("c");
      this.commits.set(sha, { tree: this.trees.get(body.tree)!, parent: body.parents[0] });
      return this.respond(route, 201, { sha });
    }
    if (path === "/git/refs/heads/main" && method === "PATCH") {
      if (this.commits.get(body.sha)!.parent !== this.head) {
        return this.respond(route, 422, { message: "Update is not a fast forward" });
      }
      this.head = body.sha;
      return this.respond(route, 200, { object: { sha: body.sha } });
    }
    return this.respond(route, 404, { message: "Not Found" });
  }
}
