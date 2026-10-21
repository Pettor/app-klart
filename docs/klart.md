# Klart — product and data model

Klart is a to-do app built around **My Day**: each morning you pull in what's due from ranked suggestions, then work through the list. Its whole state is plain JSON, so people, scripts and LLM agents can read and write it.

The design lives in the Klart canvas artifact (My Day, Settings, Notifications, quick-add syntax / JSON / LLMS.txt, mobile screens, icon). This document records how the web app implements it.

## Concepts

| Concept     | Where                           | Notes                                                                                                                                             |
| ----------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Context     | `core/contexts/KlartContext.ts` | Personal, Work, … Each task belongs to one. `"all"` is a view, never stored on a task. Switch with the dropdown or ⌥0–⌥9.                         |
| Task        | `core/tasks/Task.ts`            | Schema `klart.task/v1`. Never deleted, only `archived`. Every change stamps `updatedAt`.                                                          |
| Day         | `core/tasks/Day.ts`             | `klart.day/v1`: ordered task ids in My Day for one date. Completed tasks stay and show under "Completed".                                         |
| Quick add   | `core/tasks/QuickAdd.ts`        | `#tag` (a context's tag also routes), `@date`, `^reminder`, `!` important; everything else is the title.                                          |
| Suggestions | `core/tasks/Suggestions.ts`     | Open tasks not in today, ranked: overdue, due today, left from yesterday, coming up (3 days), related (shares a non-context tag), recently added. |

All mutations are pure functions in `KlartData.ts`, exposed through `useKlartActions()`. Derived state for the main screen comes from `useMyDay()`.

## Storage and sync

- Data is always persisted in the browser (`localStorage` key `klart-data`).
- **Folder sync** (Settings → Sync): the user picks a folder (e.g. inside OneDrive or iCloud Drive) with the File System Access API — Chrome/Edge on desktop. The handle is kept in IndexedDB; after a browser restart the user clicks "Reconnect" to re-grant access.
- `FolderSync` pulls every 4 s (when visible) and on focus, and pushes 400 ms after a change. It only reads files whose `lastModified` changed and only writes files whose content changed.
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

Git sync from the design is shown as "coming with the desktop app" — it isn't possible from a browser.

## Notifications

`NotificationPlanner.planNotifications()` is pure and decides what is due: task reminders (`remindAt`), "Plan your day", "Due today without a time", "Overdue nudge" and "End of day wrap-up", each within its time window and the context's hours. The scheduler runs every 20 s while the app is open, shows system notifications when permission is granted (via the service worker when registered) and in-app toasts otherwise. Sent keys are remembered per device. With several devices, the "last used" policy uses `devices/*/device.json`.

Desktop-only items from the design (menu-bar mode, open at login, notification action buttons) need the planned Tauri app.
