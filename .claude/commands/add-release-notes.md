# Add Release Notes

Write the "What's new" release notes for a version. The user will describe what changed, give a version, or ask you to work it out from the git history.

## Input

$ARGUMENTS

## How "What's new" picks notes

After an update, Klart shows the "What's new" dialog once with every entry newer than the last version seen on that device (see `docs/klart.md#whats-new`). Any version can have an entry, patches included (`0.5.1`, `0.5.2`). A version without an entry is skipped quietly, so a release with nothing user-visible simply gets none.

- **One entry per version**, using the exact `version` from `apps/web/package.json` (`"0.5.2"`, `"1.0.0"`). Never `"0.5"` or a `-beta` suffix.
- Notes for a version newer than `apps/web/package.json` are fine: they stay hidden until the bump ships.

## Steps

1. **Work out the version.**
   - Read `version` in `apps/web/package.json`.
   - Bump only if the user asked to — use `/bump-version` (or `/bump-patch`, `/bump-minor`, `/bump-major`), which runs `scripts/bump-version.mjs` to keep every app `package.json`, `Cargo.toml` and `Cargo.lock` in sync. Otherwise just write the notes for the version they name.
2. **Gather what changed** since the previous version bump:

   ```sh
   BASE=$(git log -1 --format=%H -G'"version":' -- apps/web/package.json)
   git log --oneline --no-merges "$BASE"..HEAD
   ```

   Focus on `feat:` and user-visible `fix:` commits. Ignore `chore:`, `refactor:`, dependency bumps, CI, tests and docs — nobody gets excited about those.

3. **Add the entry** to `apps/web/src/core/whats-new/ReleaseNotes.ts`:
   - A `const vXYZ = defineMessages({ ... })` block above the previous one (e.g. `v060` for `0.6.0`, `v053` for `0.5.3`).
   - An object at the **top** of `RELEASE_NOTES` (newest first).
4. **Generate message ids**: write `id: ""` placeholders and run `pnpm --filter=@app/web lint:fix` — the `formatjs/enforce-id` rule fills in the content-hash ids.
5. **Verify**: `pnpm --filter=@app/storybook exec vitest run --project=unit` (runs `WhatsNew.test.ts`), then check the dialog in Storybook (`WhatsNewDialog` stories) if you changed its look.

## Entry shape

```ts
const v060 = defineMessages({
  focusTitle: {
    description: "ReleaseNotes 0.6.0 - highlight title: focus mode",
    defaultMessage: "One thing at a time",
    id: "",
  },
  focusDescription: {
    description: "ReleaseNotes 0.6.0 - highlight text: focus mode",
    defaultMessage: "Press F in My Day to hide everything but the task you're on.",
    id: "",
  },
  dragFixTitle: {
    description: "ReleaseNotes 0.6.0 - fix title: dragging between contexts",
    defaultMessage: "Drag across contexts",
    id: "",
  },
  dragFixDescription: {
    description: "ReleaseNotes 0.6.0 - fix text: dragging between contexts",
    defaultMessage: "Dropping a task on another context moves it there instead of snapping back.",
    id: "",
  },
});

export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: "0.6.0",
    highlights: [{ emoji: "🎯", title: v060.focusTitle, description: v060.focusDescription }],
    fixes: [{ emoji: "↔️", title: v060.dragFixTitle, description: v060.dragFixDescription }],
  },
  // older entries...
];
```

- `description` follows `"ReleaseNotes <version> - <highlight|fix> <title|text>: <topic>"` so translators know what they're looking at.
- `highlights[0]` leads the dialog — put the most exciting thing first.
- An entry with only fixes is fine for a patch (`highlights: []`).

## Make it fun ✨

These notes are a little celebration, not a changelog. People should _want_ to read them.

- **1–5 highlights** (2–5 for a minor or major), each with:
  - **One emoji** that fits the feature (⚡ 🎨 📊 🔍 🌗 🚀 🧭 🔔). Don't reuse the same emoji within an entry.
  - **A punchy title**, 2–6 words, that sells the benefit: "Stars stand out", not "Star icon moved".
  - **One or two sentences** in plain, friendly language saying what you can now _do_ and where to find it. Talk to the user ("you"), not about the code.
- **Fixes**: only ones people would actually notice ("Pressing a task no longer hides its title"). Leave the array empty rather than listing internal fixes.
- **Never mention** refactors, dependencies, tests, CI, file names, component names or ticket numbers.
- Keep it honest — playful, not hype. Don't promise anything that isn't shipped.

| ❌ Dry                                | ✅ Fun                                                                               |
| ------------------------------------- | ------------------------------------------------------------------------------------ |
| "Fixed drop index in reorder handler" | ↕️ **Drag tasks anywhere** — "Dragging a task in My Day lands it where you drop it." |
| "Updated Android adaptive icon"       | 📱 **A sharper icon** — "On Android, Klart's icon now fills your home screen shape." |
| "Refactored Klart atoms"              | _(leave it out)_                                                                     |

## Don'ts

- Don't add two entries for the same version, or change a released entry's version.
- Don't hardcode strings — everything goes through `defineMessages`.
