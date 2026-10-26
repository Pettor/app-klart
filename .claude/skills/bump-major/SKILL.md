---
name: bump-major
description: Bump the major version (X.0.0) of the app (every app package.json plus the desktop Cargo.toml/Cargo.lock) for breaking or headline changes, and write the matching "What's new" release notes. Use when the user says "bump major", "major release", "2.0", "1.0", or when bump-version picks a major.
---

# Bump major version

Major releases (`0.9.3` → `1.0.0`, `1.4.2` → `2.0.0`) mark a breaking or headline change. Every major version **must** have a "What's new" entry in `apps/web/src/core/whats-new/ReleaseNotes.ts`.

## Input

$ARGUMENTS

## When a major is right

Klart has no public API, but its data folder is a contract — with other devices running older versions and with agents reading `LLMS.txt`. "Breaking" means:

- the data format changes in a way older app versions can't read (a new `klart.task/v2`, `klart.day/v2`, or an incompatible `klart.json`),
- sync, storage or the folder layout changes so people must act (reconnect the folder, re-sync GitHub, update every device),
- a feature is removed or a core workflow (contexts, My Day, suggestions) works differently,
- a headline milestone the user wants to celebrate (e.g. `1.0.0`).

If none of these apply, confirm with the user before going on — it's probably a minor.

## Steps

1. **Check the tree.** Run `git status --short`. If there are uncommitted changes unrelated to a release, mention them before going on.
2. **Gather what changed** since the last version bump:

   ```sh
   BASE=$(git log -1 --format=%H -G'"version":' -- apps/web/package.json)
   git log --oneline --no-merges "$BASE"..HEAD
   ```

   Read the diffs for anything that changes data formats or sync (`core/tasks/KlartData.ts`, `Task.ts`, `Day.ts`, `core/contexts/`, `core/sync/`, `apps/desktop/src-tauri/src/`) — those are what make this a major.

3. **Bump the version** everywhere it lives:

   ```sh
   node scripts/bump-version.mjs major
   ```

   This updates the root and `apps/*` `package.json` files plus `apps/desktop/src-tauri/Cargo.toml` and `Cargo.lock`. The script refuses to run if the app versions disagree — fix that first rather than editing by hand.

4. **Write the release notes** for the new `X.0.0` by following `/add-release-notes` (`.claude/commands/add-release-notes.md`). In short:
   - If an entry for this version already exists, extend it; if a pre-written entry exists for a minor that's now being skipped (e.g. `0.10.0` when going to `1.0.0`), fold it into this entry and remove the skipped one.
   - Add a `const vX00 = defineMessages({ ... })` block and an object at the **top** of `RELEASE_NOTES`.
   - Make it feel like a big moment: 2–5 highlights with one emoji each, the headline change first.
   - If people need to do something (reconnect the folder, update other devices), say so plainly in a highlight — friendly, not alarming.
   - Use `id: ""` placeholders, then run `pnpm --filter=@app/web lint:fix` to fill them.

5. **Check the data contract**: if the data format changed, make sure `core/sync/LlmsTxt.ts` and `docs/klart.md` (Storage and sync) match the new schemas and layout.
6. **Verify**: `pnpm --filter=@app/storybook exec vitest run --project=unit` (runs `WhatsNew.test.ts`) and `pnpm lint`. If sync changed, also `pnpm --filter @app/desktop test`.
7. **Don't commit.** Stage nothing unless asked. Report the old → new version, why it's a major, the highlights you wrote, the files changed, and suggest the commit message `feat!: <new version>`.
