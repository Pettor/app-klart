# Klart — product and data model

Klart is a to-do app built around **My Day**: each morning you pull in what's due from ranked suggestions, then work through the list. Its whole state is plain JSON, so people, scripts and LLM agents can read and write it.

The design lives in the Klart canvas artifact (My Day, Settings, Notifications, quick-add syntax / JSON / LLMS.txt, mobile screens, icon). This document records how the web app implements it.

## Concepts

| Concept     | Where                           | Notes                                                                                                                                                                                        |
| ----------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Context     | `core/contexts/KlartContext.ts` | Personal, Work, … Each task belongs to one. `"all"` is a view, never stored on a task. Switch with the dropdown or ⌥0–⌥9.                                                                    |
| Task        | `core/tasks/Task.ts`            | Schema `klart.task/v1`. Never deleted, only `archived`. Every change stamps `updatedAt`. Optional `links`: `http(s)` URLs; `www.` gets `https://` (`TaskLink.ts`).                           |
| Day         | `core/tasks/Day.ts`             | `klart.day/v1`: ordered task ids in My Day for one date. Completed tasks stay and show under "Completed".                                                                                    |
| Quick add   | `core/tasks/QuickAdd.ts`        | `#tag` (a context's tag also routes), `@date`, `^reminder`, `!` important, `https://…` or `www.…` link; everything else is the title.                                                        |
| Suggestions | `core/tasks/Suggestions.ts`     | Open tasks not in today, ranked: overdue, due today, left from yesterday, coming up (3 days), related (shares a non-context tag), recently added.                                            |
| Task editor | `components/input/task-editor/` | Click a task (in the list or Suggestions) to edit it in place. On wide screens the editor replaces the Suggestions panel; on phones it is a bottom sheet. Text fields save on blur or Enter. |

All mutations are pure functions in `KlartData.ts`, exposed through `useKlartActions()`. Derived state for the main screen comes from `useMyDay()`.

## Storage and sync

- Data is always persisted in the browser (`localStorage` key `klart-data`).
- **Folder sync** (Settings → Sync): the user picks a folder (e.g. inside OneDrive or iCloud Drive) with the File System Access API — Chrome/Edge on desktop. The handle is kept in IndexedDB; after a browser restart the user clicks "Reconnect" to re-grant access.
- `FolderSync` pulls every 4 s (when visible) and on focus, and pushes 400 ms after a change. It only reads files whose `lastModified` changed and only writes files whose content changed.
- Upgrades: files are parsed leniently and compared with what the current version would write, so after an update the first push rewrites `LLMS.txt` and any task, day or config file in an older format (without touching `updatedAt`). Browser data is normalized the same way on read.
- Conflicts: newest `updatedAt` wins per task; a losing remote edit is copied to `.conflicts/`. On first connect, local and folder data are merged.
- Folder layout, matching LLMS.txt:

```
Klart/
├── LLMS.txt                  # rules for agents (optional)
├── klart.json                # contexts
├── tasks/<context>/<id>.json
├── days/YYYY-MM-DD.json
├── views/today.json          # generated, read-only (optional)
├── views/suggestions.json    # generated, read-only (optional)
├── inbox/                    # .txt (quick-add lines) or .json tasks; consumed and deleted
├── devices/<name>/device.json
└── .conflicts/
```

- **GitHub sync** (Settings → Sync → GitHub): works in every browser, including phones, and in the desktop app. See [GitHub sync](#github-sync).

## Notifications

`NotificationPlanner.planNotifications()` is pure and decides what is due: task reminders (`remindAt`), "Plan your day", "Due today without a time", "Overdue nudge" and "End of day wrap-up", each within its time window and the context's hours. The scheduler runs every 20 s while the app is open, shows system notifications when permission is granted (via the service worker when registered) and in-app toasts otherwise. Sent keys are remembered per device. With several devices, the "last used" policy uses `devices/*/device.json`.

## What's new

After an update (a new PWA bundle or desktop build with a higher `version` in `apps/web/package.json`), Klart shows a "What's new" dialog once with the release notes in `core/whats-new/ReleaseNotes.ts`. The last version seen is kept per device in `localStorage` (`klart-last-seen-version`). A fresh install shows nothing; a device that already had data but no last-seen version gets the latest notes once. Settings → About → "See what's new" reopens it.

To ship notes: bump the version and add an entry at the top of `RELEASE_NOTES` — a few emoji highlights, plus only the fixes people would notice. Versions without an entry are skipped quietly.

## Desktop app

`apps/desktop` packages `apps/web/dist` with Tauri 2 (see CLAUDE.md for commands). The web code detects it with `isDesktop()` (`core/platform/Desktop.ts`) and calls native commands from `apps/desktop/src-tauri/src`:

| Feature                                                   | Browser                                                           | Desktop app                                                                                                   |
| --------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Folder sync (OneDrive, iCloud Drive, Dropbox, any folder) | File System Access API, Chrome/Edge only (`BrowserFolderBackend`) | Native file commands, every OS (`DesktopFolderBackend` → `folder.rs`); writes are atomic (temp file + rename) |
| Git sync                                                  | —                                                                 | `git.rs`, using the installed `git` and the user's SSH keys / credential helper                               |
| GitHub sync                                               | GitHub REST API (`GitHubBackend`)                                 | Same as the browser                                                                                           |
| Notifications                                             | Web Notifications / service worker                                | Native, via `tauri-plugin-notification` (`system.rs`)                                                         |

Task links use `target="_blank"`, which the webview ignores, so `useDesktopExternalLinks()` sends those clicks to `open_url` (`system.rs`) and the default browser.

`FolderSync` only talks to the `FolderBackend` interface, so both platforms share the sync logic.

### Git sync

The data folder is a local clone. Settings → Sync → Git repository either clones a URL into a folder you pick or uses an existing clone. Each sync (`git_sync`):

1. commits local changes (`klart: 3 tasks updated`),
2. fetches and merges the remote; a conflicting file keeps the version with the newer `updatedAt`, and the other version is committed to `.conflicts/`,
3. pushes.

It runs when the app opens, every 5 minutes, 30 seconds after the last local change, and on "Sync now". After a merge that brought changes, the folder is re-read immediately. `GIT_TERMINAL_PROMPT=0` makes git fail instead of waiting for a password; the error shows in Settings. Without `user.email` configured, commits use `Klart <klart@localhost>`.

### GitHub sync

For phones and browsers without folder access. The user enters a GitHub username, a repository and a fine-grained personal access token (GitHub's API doesn't accept passwords) limited to that repository with Contents: Read and write. Only private repositories are accepted, and the token can't be read-only. The connection, token included, is kept in `localStorage` (`klart-github-connection`) on that device only.

`GitHubBackend` implements `FolderBackend` over an in-memory snapshot of the default branch, so `FolderSync` runs unchanged:

- `refresh()` checks the branch (an `If-None-Match` request; unchanged costs nothing against the rate limit), and on a new commit loads its tree and downloads changed files, 6 at a time. A file's git blob sha stands in for `lastModified`.
- Writes and removals are staged in memory. `commit()` pushes them as one commit through the Git Data API (tree → commit → fast-forward the branch). An empty repository gets its first file through the contents API.
- When another device pushed first, the branch update is rejected: the sync refreshes, drops staged files that changed remotely, pulls (merging by `updatedAt`, losers to `.conflicts/`), pushes and commits again, up to 3 times.

It syncs when the app opens, every minute while visible, 5 seconds after the last change, when the app is hidden with unpushed changes, and on "Sync now". With a Git or GitHub remote, device check-ins (`devices/*/device.json`) are only written alongside real changes, so they never make a commit of their own. A GitHub-synced device and a desktop Git clone can share the same repository.

Not yet built: the online OneDrive API (for computers without the OneDrive app), "Sign in with GitHub" (GitHub's OAuth endpoints don't allow browser calls, so it needs a small server), and the design's desktop-only items (menu-bar mode, open at login, notification actions).
