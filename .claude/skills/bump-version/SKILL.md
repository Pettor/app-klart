---
name: bump-version
description: Work out whether the unreleased changes call for a patch, minor or major release, then run bump-patch, bump-minor or bump-major. Use when the user says "bump version", "bump the version", "cut a release", "release", or "new version" without naming the level.
---

# Bump version

Pick the right release level from what changed, then hand off to the matching skill.

## Input

$ARGUMENTS

If the user names a level ("patch", "minor", "major") or an exact version, skip the analysis and use that.

## Steps

1. **Find the unreleased changes** since the last version bump:

   ```sh
   BASE=$(git log -1 --format=%H -G'"version":' -- apps/web/package.json)
   git log --oneline --no-merges "$BASE"..HEAD
   git diff --stat "$BASE"..HEAD
   ```

   Include uncommitted work from `git status --short` if the user means to release it. If there's nothing since the last bump, say so and stop.

2. **Classify** — the highest level any change needs wins:

   | Level     | When                                                                                                                                                                                                                            | Typical commits                        |
   | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
   | **patch** | Only fixes and small tweaks: bug fixes, copy changes, styling polish, performance, CI, docs, dependencies, refactors, tests.                                                                                                    | `fix:`, `chore:`, `docs:`, `refactor:` |
   | **minor** | Anything new people can use: a feature, a new setting, a new view, a noticeable improvement — as long as nothing breaks. Backwards-compatible data changes (new optional fields, older files the app still reads and rewrites). | `feat:`                                |
   | **major** | Breaking changes: data files older app versions can't read, sync changes people must act on, removed features, a core workflow that works differently — or a milestone the user wants to celebrate (e.g. `1.0.0`).              | `feat!:`, `BREAKING CHANGE:` in a body |

   Read the diffs, not just the messages — a `fix:` that adds a setting is a minor, a `feat:` that changes the data format incompatibly is a major. Look closely at `core/tasks/` (`KlartData.ts`, `Task.ts`, `Day.ts`), `core/contexts/`, `core/sync/` (`FolderSync.ts`, `LlmsTxt.ts`, the backends) and `apps/desktop/src-tauri/src/`. This repo's history uses `feat: <version>` for every bump, so don't infer the level from earlier bump commits.

3. **Say what you picked and why** in a sentence or two, listing the commits that decided it. If it's a major, or the call is genuinely borderline (e.g. minor vs major), ask the user to confirm before bumping.
4. **Run the matching skill** and follow it fully:
   - patch → `/bump-patch` (release notes when something is user-visible)
   - minor → `/bump-minor` (release notes required)
   - major → `/bump-major` (release notes required)

   Pass along anything the user said, such as "with release notes" or "no release notes".

5. **Don't commit.** Report what the chosen skill reports.
