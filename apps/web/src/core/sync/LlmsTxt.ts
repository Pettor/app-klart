/** Written to the root of the data folder so any agent pointed at it knows the rules. Not translated: it's for machines. */
export const LLMS_TXT = `# Klart

> Klart is a to-do app whose whole state is the JSON files in this folder.
> Read them to see tasks and today's plan. Write them to change anything.
> The app watches the folder and reloads within a few seconds.

## Files
- klart.json: the user's contexts (e.g. personal, work, club) with color and
  routing tag. "all" is a view, never a context on a task.
- tasks/<context>/<id>.json: one task per file, schema klart.task/v1.
- days/YYYY-MM-DD.json: tasks in My Day for that date, schema klart.day/v1.
- views/today.json: today's day file with full tasks inlined. Read-only.
- views/suggestions.json: ranked candidates for My Day. Read-only.
- inbox/: drop a .txt (one quick-add line per line) or a task .json here.
  A .json needs only "title"; "context", "tags", "due", "remindAt",
  "important", "notes" and "links" are optional.
- LLMS.txt: this file. The app rewrites it when it changes between versions.

## Common jobs
- Plan today: read views/suggestions.json, pick items, append
  { "taskId", "addedAt", "addedBy": "agent", "reason" } to days/<today>.json.
- Add a task: write inbox/<anything>.txt with a quick-add line, e.g.
  "#work #acme @2026-07-08 #team find more tasks to create".
- Complete a task: set "status": "done" and "completedAt" in its file.
- Remind the user: set "remindAt" (local "YYYY-MM-DDTHH:MM") on the task.
  The app sends a notification then. Clear it with null.
- Find by tag: tasks whose "tags" array contains the tag, lowercase, no "#".
- Link a task to its source (PR, email, doc): add the URL to its "links"
  array. http:// and https:// URLs are kept; a www. address gets https://
  added (www.fz.se becomes https://www.fz.se). Anything else is dropped.
- Add details: put free text in the task's "notes".

## Quick-add syntax
- #tag adds a tag. A tag naming a context (#work, #club) also picks the context.
- @YYYY-MM-DD, @today, @tomorrow, @mon..@sun, @+Nd set the due date.
- ^HH:MM, ^fri-HH:MM, ^YYYY-MM-DDTHH:MM set a reminder (remindAt).
- ! marks important.
- https://… or www.… adds a link (to "links"). All other words are the title.
- There are no lists: group and filter with tags.

## Rules
- Always update "updatedAt" (ISO 8601 UTC) when you change a task.
- Create ids as ULIDs. Never reuse or rename a task file.
- Do not edit views/, devices/ or .conflicts/. Do not delete tasks; set "status": "archived".
- Dates are local dates (YYYY-MM-DD) in the user's time zone.
`;
