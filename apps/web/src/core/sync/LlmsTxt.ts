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
- lists/<id>.json: one shopping list per file, items inline, schema klart.list/v1.
- views/today.json: today's day file with full tasks inlined. Read-only.
- views/suggestions.json: ranked candidates for My Day. Read-only.
- views/shopping.json: open shopping lists with the items left to buy,
  starred first, and whether each is in My Day. Read-only.
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
- Shopping: see "Shopping lists" below.

## Shopping lists
A list is one file, lists/<id>.json, with its items inline. Read
views/shopping.json for what's left to buy; write the list files.

{ "schema": "klart.list/v1", "id": "<ULID>", "name": "Week",
  "kind": "grocery", "date": null, "completedAt": null, "deletedAt": null,
  "taskId": null, "items": [<item>, ...], "createdAt", "updatedAt" }

<item>: { "id": "<ULID>", "name": "mjölk", "qty": 2, "price": 25,
  "link": null, "note": "", "category": "dairy", "bought": false,
  "important": false, "taskId": null, "createdAt", "updatedAt" }

- "kind": grocery, gift, home or other. Grocery lists group their items by
  "category" in store order: produce, dairy, bread, meat, pantry, pets,
  household, other. Other kinds keep the order the items were added; give
  their items a category anyway, in case the list's kind changes.
- "qty": how many, null means one. "price": per piece, in kronor, or null.
  "link": an http(s) URL to the product. "date": local YYYY-MM-DD the list
  is for (a birthday, a party), or null.
- Open lists have "completedAt" and "deletedAt" null. Skip the others
  unless asked about them.
- New list: write lists/<ULID>.json as above with "items": [].
- Add an item: append it to "items". Never add the same thing twice; raise
  "qty" instead.
- Mark bought: set "bought": true, and if it has a "taskId" complete that
  task too. Star: set "important": true, and on its task too.
- Remove an item: take it out of "items". If it has a "taskId", archive
  that task and take it out of today's days/ file.
- Put an item in My Day: create a task in the first context in klart.json
  (title "Buy: <name>", or "Buy: <name> × <qty>", "important" and "notes"
  from the item, its link in "links", "due" set to the list's "date",
  "shopping": { "listId", "itemId" }), set the item's "taskId" to the
  task's id, and append the task to days/<today>.json.
- The link is two-way: the app marks the item bought when its task is done,
  and stars it when the task is starred, whichever "updatedAt" is newer.
  An archived task unlinks its item. A task with "itemId": null stands for
  the whole list.
- Complete a list: set "completedAt" (ISO 8601 UTC). Items not bought stay
  on it; archive their tasks. Or first move them to another open list
  (keep their "taskId", and set the task's "shopping.listId" to that list).
  Reopen it by setting "completedAt" back to null.
- Rename a list: change "name".
- Delete a list: set "deletedAt" (ISO 8601 UTC) and archive the tasks made
  from it and its items. Keep the file, so the deletion reaches other
  devices. Never remove a list file.

## Quick-add syntax
- #tag adds a tag. A tag naming a context (#work, #club) also picks the context.
- @YYYY-MM-DD, @today, @tomorrow, @mon..@sun, @+Nd set the due date.
- ^HH:MM, ^fri-HH:MM, ^YYYY-MM-DDTHH:MM set a reminder (remindAt).
- ! marks important.
- https://… or www.… adds a link (to "links"). All other words are the title.
- Tasks have no lists (group and filter with tags); lists/ is for shopping.

## Rules
- Always update "updatedAt" (ISO 8601 UTC) when you change a task or a list
  (and the item you changed). The newest "updatedAt" wins a whole list file,
  so read it right before you write it.
- Create ids as ULIDs. Never reuse or rename a task file.
- Do not edit views/, devices/ or .conflicts/. Do not delete tasks; set "status": "archived".
- Dates are local dates (YYYY-MM-DD) in the user's time zone.
`;
