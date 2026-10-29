# Klart — product and data model

Klart is a to-do app built around **My Day**: each morning you pull in what's due from ranked suggestions, then work through the list. Its whole state is plain JSON, so people, scripts and LLM agents can read and write it.

The design lives in the Klart canvas artifact (My Day, Settings, Notifications, quick-add syntax / JSON / LLMS.txt, mobile screens, icon). This document records how the web app implements it.

## Concepts

| Concept     | Where                           | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Context     | `core/contexts/KlartContext.ts` | Personal, Work, … Each task belongs to one. `"all"` is a view, never stored on a task. Switch with the dropdown or ⌥0–⌥9.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Task        | `core/tasks/Task.ts`            | Schema `klart.task/v1`. Never deleted, only `archived`. Every change stamps `updatedAt`. Optional `links`: `http(s)` URLs; `www.` gets `https://` (`TaskLink.ts`). One link shows as a button on the task; two or more collapse into one button with a count that lists them (a popover, or a sheet on phones).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Day         | `core/tasks/Day.ts`             | `klart.day/v1`: ordered task ids in My Day for one date. Completed tasks stay and show under "Completed".                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Quick add   | `core/tasks/QuickAdd.ts`        | `#tag` (a context's tag also routes), `@date`, `^reminder`, `!` important, `https://…` or `www.…` link; everything else is the title.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Suggestions | `core/tasks/Suggestions.ts`     | Open tasks not in today, ranked: overdue, due today, left from yesterday, coming up (3 days), related (shares a non-context tag), recently added.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Shopping    | `core/shopping/`                | Lists (`klart.list/v1`, one file per list, items inline) of kind grocery, gift, home or other. Each list belongs to a context (`context`; `null` on older lists means the first context, see `getListContext`): the Shopping page and its item count show the selected context's lists, or every list under "All contexts". A new list goes in the selected context, or the first one under "All contexts"; removing a context moves its lists with its tasks. Grocery items group by store section, guessed from the name. Add-item syntax: `2x`/`x2`/`2st` quantity, `199 kr`/`199:-` price, a link. Completing a list moves what's left to another open list, or leaves it. Lists can be renamed and deleted from the list's … menu; a deleted list keeps its file with `deletedAt` (so the deletion syncs) and the My Day tasks made from it are archived. See [Shopping and My Day](#shopping-and-my-day). |
| Task editor | `components/input/task-editor/` | Click a task (in the list or Suggestions) to edit it in place. On wide screens the editor replaces the Suggestions panel; on phones it is a bottom sheet. On phones a tap on a list task first opens its details sheet (`components/display/task-details-sheet/`), whose Edit button opens the editor; the phone row itself is lean, with no buttons beside the title. Text fields save on blur or Enter.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

All mutations are pure functions in `KlartData.ts`, exposed through `useKlartActions()`. Derived state for the main screen comes from `useMyDay()`.

## Shopping and My Day

Shopping is a page of the main screen, not a separate one: it is the fifth row under the smart views (with how many items are left), and picking it keeps the sidebar and swaps My Day's list, Suggestions and editor for the lists column and the selected list. Picking a smart view or a tag goes back to My Day.

The sun on an item makes it a task in today's My Day (`Buy: Milk × 2`), in the list's context. The task carries `shopping: { listId, itemId }` and the item carries the task's id in `taskId`. The data format also allows a task for a whole list (`itemId: null`, the list's `taskId`), e.g. one an agent adds; the app doesn't create one.

Agents learn the list format and every shopping job (add, buy, star, put in My Day, complete, move, rename, delete) from the "Shopping lists" section of `LLMS.txt` (`core/sync/LlmsTxt.ts`), and read what's left to buy from the generated `views/shopping.json` (`buildShoppingView` in `core/tasks/AgentViews.ts`). Keep both in step with `core/shopping/` when the model changes.

- Item to task: the shopping mutations in `ShoppingData.ts` update the linked task with the same timestamp: buying completes it, starring stars it, removing the item or pressing the sun again archives it.
- Task to item: `reconcileShoppingTasks()` runs after every mutation (in `useKlartActions` and `useShoppingActions`) and after each sync pull. A linked task newer than its item sets the item's `bought` and `important`; an archived task unlinks it. A task never undoes a newer change made on the list.
- In My Day a linked task shows its list's name with a cart icon, and opening it goes to the list (`/shopping?list=<id>`). Completing a list completes its own task; items moved to another list keep their tasks, items left behind have theirs archived.
- On phones the Shopping page shows the lists, then one list. Shopping is one history entry like a smart view, so Back from any list returns to My Day.

## Storage and sync

- Data is always persisted in the browser (`localStorage` key `klart-data`).
- **Folder sync** (Settings → Sync): the user picks a folder (e.g. inside OneDrive or iCloud Drive) with the File System Access API — Chrome/Edge on desktop. The handle is kept in IndexedDB; after a browser restart the user clicks "Reconnect" to re-grant access.
- `FolderSync` pulls every 4 s (when visible) and on focus, and pushes 400 ms after a change. It only reads files whose `lastModified` changed and only writes files whose content changed.
- Upgrades: files are parsed leniently and compared with what the current version would write, so after an update the first push rewrites `LLMS.txt` and any task, day or config file in an older format (without touching `updatedAt`). Browser data is normalized the same way on read.
- Data version (`core/sync/DataVersion.ts`): the app's `major.minor` (patch releases never change the files). Every push writes it to the folder's `klart.json` as `dataVersion`, so a folder records the newest version that wrote to it. An app whose data version is older stops pulling and pushing that sync (state `outdated`; `FolderSync` throws `NewerDataVersionError` before reading or writing anything), so it never half-reads newer files or writes over them in an older format. Local edits stay in the browser and sync after the update. A toast (`useOutdatedSyncNotice`) and the sidebar card say which version is needed; in the web app "Update" (`core/pwa/UpdateApp.ts`) fetches the newest service worker and reloads, while the desktop app asks for a new install. A folder without `dataVersion` (written before this existed) syncs as before. Versions from before this check can't be stopped and drop the field when they write `klart.json`; the next newer push restores it.
- Conflicts: newest `updatedAt` wins per task; a losing remote edit is copied to `.conflicts/`. On first connect, local and folder data are merged.
- Folder layout, matching LLMS.txt:

```
Klart/
├── LLMS.txt                  # rules for agents (optional)
├── klart.json                # contexts
├── tasks/<context>/<id>.json
├── days/YYYY-MM-DD.json
├── lists/<id>.json           # shopping lists, newest updatedAt wins per list
├── views/today.json          # generated, read-only (optional)
├── views/suggestions.json    # generated, read-only (optional)
├── views/shopping.json       # generated, read-only (optional): open lists, items left
├── inbox/                    # .txt (quick-add lines) or .json tasks; consumed and deleted
├── devices/<name>/device.json
└── .conflicts/
```

- **GitHub sync** (Settings → Sync → GitHub): works in every browser, including phones, and in the desktop app. See [GitHub sync](#github-sync).

### Several syncs

Most people have one sync, and every context syncs with it. A device can also have several named syncs ("Personal repo", "Work OneDrive"), each a folder, Git clone or GitHub repository, with each context assigned to one of them or kept on this device only. The model lives in `core/sync/SyncTargets.ts`. The setup (`SyncSetup`: the syncs and a context-to-sync map) is per device, in `localStorage` (`klart-sync-targets`). GitHub tokens are stored there too, and each browser folder's handle is kept in IndexedDB under its sync's id. The older single-connection keys (`klart-github-connection`, `klart-desktop-connection` and the `data-folder` handle) are moved into it on first start.

- The first sync is the **primary**. Contexts nobody assigned sync with it. Shopping lists sync with their context's sync. Settings → Sync shows one card per sync (rename, make primary, stop syncing), "Add another sync", and a "Where each context syncs" table once contexts are split.
- Each sync's folder only holds its part (`FolderSync` with a `SyncScope`, see `scopeData`): its contexts in `klart.json`, their task and list files, and the My Day items of their tasks. A pull replaces only that part (`mergeOwned`), so the other syncs' contexts and My Day items are kept. A task or list file that no longer belongs to a folder is removed, so moving a context moves its tasks and lists.
- Contexts found in a secondary sync's `klart.json` are assigned to it unless this device already chose (`assignFoundContexts`), which is how a new device learns the split. Stopping a sync keeps its contexts on this device instead of moving them into another sync. Making another sync primary keeps the old primary's contexts where they are.
- `FolderSyncLifecycle` mounts one runner per sync (`useSyncTargetLifecycle`). All runners share one job queue and read the latest data when a job starts, so two syncs never pull over each other. Each sync has its own status (`syncStatusesAtom`). The sidebar card (`SyncStatusCard`, from `buildSyncOverview`) shows the worst state across syncs and, when contexts are split, one row per sync with its state and context dots.

## Notifications

`NotificationPlanner.planNotifications()` is pure and decides what is due: task reminders (`remindAt`), "Plan your day", "Due today without a time", "Overdue nudge" and "End of day wrap-up", each within its time window and the context's hours. The scheduler runs every 20 s while the app is open, shows system notifications when permission is granted (via the service worker when registered) and in-app toasts otherwise. Sent keys are remembered per device. With several devices, the "last used" policy uses `devices/*/device.json`.

## What's new

After an update (a new PWA bundle or desktop build with a higher `version` in `apps/web/package.json`), Klart shows a "What's new" dialog once with the release notes in `core/whats-new/ReleaseNotes.ts`. The last version seen is kept per device in `localStorage` (`klart-last-seen-version`). A fresh install shows nothing; a device that already had data but no last-seen version gets the latest notes once. Settings → About → "See what's new" reopens it.

To ship notes: bump the version and add an entry at the top of `RELEASE_NOTES` — a few emoji highlights, plus only the fixes people would notice. Versions without an entry are skipped quietly. `/bump-version` (or `/bump-patch`, `/bump-minor`, `/bump-major`) does both: `scripts/bump-version.mjs` keeps the root and `apps/*` `package.json` files, `Cargo.toml` and `Cargo.lock` in sync, and `/add-release-notes` writes the entry.

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

For phones and browsers without folder access. The user enters a GitHub username, a repository and a fine-grained personal access token (GitHub's API doesn't accept passwords) limited to that repository with Contents: Read and write. Only private repositories are accepted, and the token can't be read-only. The connection, token included, is kept in `localStorage` (in the sync setup, `klart-sync-targets`) on that device only.

`GitHubBackend` implements `FolderBackend` over an in-memory snapshot of the default branch, so `FolderSync` runs unchanged:

- `refresh()` checks the branch (an `If-None-Match` request; unchanged costs nothing against the rate limit), and on a new commit loads its tree and downloads changed files, 6 at a time. A file's git blob sha stands in for `lastModified`.
- Writes and removals are staged in memory. `commit()` pushes them as one commit through the Git Data API (tree → commit → fast-forward the branch). An empty repository gets its first file through the contents API.
- When another device pushed first, the branch update is rejected: the sync refreshes, drops staged files that changed remotely, pulls (merging by `updatedAt`, losers to `.conflicts/`), pushes and commits again, up to 3 times.

It syncs when the app opens, every minute while visible, 5 seconds after the last change, when the app is hidden with unpushed changes, and on "Sync now". With a Git or GitHub remote, device check-ins (`devices/*/device.json`) are only written alongside real changes, so they never make a commit of their own. A GitHub-synced device and a desktop Git clone can share the same repository.

Not yet built: the online OneDrive API (for computers without the OneDrive app), "Sign in with GitHub" (GitHub's OAuth endpoints don't allow browser calls, so it needs a small server), and the design's desktop-only items (menu-bar mode, open at login, notification actions).
