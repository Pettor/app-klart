---
name: bump-patch
description: Bump the patch version (x.y.Z) of the app (every app package.json plus the desktop Cargo.toml/Cargo.lock) for bug fixes and small tweaks, and write "What's new" notes when anything is user-visible. Use when the user says "bump patch", "patch release", "release a fix", or when bump-version picks a patch.
---

# Bump patch version

Patch releases (`0.5.2` → `0.5.3`) ship fixes and small tweaks. In Klart, patches get their own "What's new" entry too (see `0.5.1`, `0.5.2`) — but only when there's something people would notice.

## Input

$ARGUMENTS

## Steps

1. **Check the tree.** Run `git status --short`. If there are uncommitted changes unrelated to a release, mention them before going on.
2. **Gather what changed** since the last version bump:

   ```sh
   BASE=$(git log -1 --format=%H -G'"version":' -- apps/web/package.json)
   git log --oneline --no-merges "$BASE"..HEAD
   ```

   If anything there is a new feature or a breaking change, stop and suggest `/bump-minor` or `/bump-major` instead.

3. **Bump the version** everywhere it lives:

   ```sh
   node scripts/bump-version.mjs patch
   ```

   This updates the root and `apps/*` `package.json` files plus `apps/desktop/src-tauri/Cargo.toml` and `Cargo.lock` (`tauri.conf.json` reads `apps/desktop/package.json`). Shared libraries in `configs/`, `packages/` and `design/` keep their own versions. The script refuses to run if the app versions disagree — fix that first rather than editing by hand.

4. **Release notes** — write an entry for the new `x.y.z` by following `/add-release-notes` (`.claude/commands/add-release-notes.md`) if:
   - the user asked for release notes, **or**
   - any change is user-visible (a fix people hit, a visible tweak, a small improvement).

   Skip it if the user said not to, or if everything is internal (CI, deps, refactors, tests, docs) — a version without an entry is skipped quietly. Say which you chose in the report.

   A patch entry is usually small: one or two highlights and/or fixes, `highlights: []` if it's fixes only. Use `id: ""` placeholders, then run `pnpm --filter=@app/web lint:fix` to fill them.

5. **Verify**: `pnpm lint`, and if release notes changed, `pnpm --filter=@app/storybook exec vitest run --project=unit` (runs `WhatsNew.test.ts`).
6. **Don't commit.** Stage nothing unless asked. Report the old → new version, the files changed, whether release notes were written (and why or why not), and suggest the commit message `feat: <new version>` (the repo's convention for version bumps).
