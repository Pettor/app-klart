import { defineMessages, type MessageDescriptor } from "react-intl";

export interface ReleaseNoteItem {
  emoji: string;
  title: MessageDescriptor;
  description: MessageDescriptor;
}

export interface ReleaseNote {
  /** Matches `version` in `apps/web/package.json`. */
  version: string;
  /** A few highlights; keep it short and fun. */
  highlights: ReleaseNoteItem[];
  /** Only fixes people would actually notice. */
  fixes: ReleaseNoteItem[];
}

const v060 = defineMessages({
  shoppingTitle: {
    description: "ReleaseNotes 0.6.0 - highlight title: shopping lists",
    defaultMessage: "Shopping lists",
    id: "5kMMQz",
  },
  shoppingDescription: {
    description: "ReleaseNotes 0.6.0 - highlight text: shopping lists",
    defaultMessage:
      "Pick Shopping under your smart views to plan groceries, gifts and home buys. Type 2x milk 25 kr and Klart works out the quantity, the price and where the milk is in the store.",
    id: "+DePr/",
  },
  myDayTitle: {
    description: "ReleaseNotes 0.6.0 - highlight title: shopping items in My Day",
    defaultMessage: "Shopping meets My Day",
    id: "/pUGWR",
  },
  myDayDescription: {
    description: "ReleaseNotes 0.6.0 - highlight text: shopping items in My Day",
    defaultMessage: "Press the sun on an item to make it a task in My Day. Tick off either one and the other follows.",
    id: "PoipDt",
  },
  completeTitle: {
    description: "ReleaseNotes 0.6.0 - highlight title: completing, renaming and deleting lists",
    defaultMessage: "Done with a list?",
    id: "IVJeAQ",
  },
  completeDescription: {
    description: "ReleaseNotes 0.6.0 - highlight text: completing, renaming and deleting lists",
    defaultMessage:
      "Complete it and move whatever you didn't buy to the next list. Rename or delete a list from its … menu.",
    id: "aoMwEL",
  },
  agentsTitle: {
    description: "ReleaseNotes 0.6.0 - highlight title: agents can shop too",
    defaultMessage: "Your agents can shop too",
    id: "qvxylc",
  },
  agentsDescription: {
    description: "ReleaseNotes 0.6.0 - highlight text: agents can shop too",
    defaultMessage:
      "Lists live in your synced folder, and LLMS.txt explains them, so an agent can add to them for you.",
    id: "BDtozb",
  },
  notificationFixTitle: {
    description: "ReleaseNotes 0.6.0 - fix title: readable reminder notifications",
    defaultMessage: "Reminders you can read",
    id: "FUs0gA",
  },
  notificationFixDescription: {
    description: "ReleaseNotes 0.6.0 - fix text: readable reminder notifications",
    defaultMessage: "On phones, a reminder's task title is no longer cut short. It's shown in full under the heading.",
    id: "L7YUOk",
  },
});

const v053 = defineMessages({
  tagsTitle: {
    description: "ReleaseNotes 0.5.3 - highlight title: tags shown only via the display option",
    defaultMessage: "Tags when you want them",
    id: "aaBZFs",
  },
  tagsDescription: {
    description: "ReleaseNotes 0.5.3 - highlight text: tags shown only via the display option",
    defaultMessage:
      "Tasks no longer stretch open when you hover or hold them. Turn on Tags on tasks in the Display menu to see every task's tags.",
    id: "aO68Oy",
  },
  suggestionsFixTitle: {
    description: "ReleaseNotes 0.5.3 - fix title: suggestions panel scrolls on its own",
    defaultMessage: "Suggestions scroll on their own",
    id: "oIWiad",
  },
  suggestionsFixDescription: {
    description: "ReleaseNotes 0.5.3 - fix text: suggestions panel scrolls on its own",
    defaultMessage: "A long list of suggestions scrolls inside its panel instead of stretching My Day.",
    id: "T40bPV",
  },
});

const v052 = defineMessages({
  iconTitle: {
    description: "ReleaseNotes 0.5.2 - highlight title: sharper app icon on phones",
    defaultMessage: "A sharper icon",
    id: "idFUvF",
  },
  iconDescription: {
    description: "ReleaseNotes 0.5.2 - highlight text: sharper app icon on phones",
    defaultMessage:
      "On Android, Klart's icon now fills your home screen shape, and reminders show the Klart mark in the status bar.",
    id: "sbfSFR",
  },
  reorderFixTitle: {
    description: "ReleaseNotes 0.5.2 - fix title: dragging a task between others",
    defaultMessage: "Drag tasks anywhere",
    id: "fOGeHy",
  },
  reorderFixDescription: {
    description: "ReleaseNotes 0.5.2 - fix text: dragging a task between others",
    defaultMessage: "Dragging a task in My Day lands it where you drop it, not always at the bottom.",
    id: "9qgPr4",
  },
  titleFixTitle: {
    description: "ReleaseNotes 0.5.2 - fix title: task title no longer vanishes while pressed",
    defaultMessage: "Titles stay put",
    id: "9SVGlT",
  },
  titleFixDescription: {
    description: "ReleaseNotes 0.5.2 - fix text: task title no longer vanishes while pressed",
    defaultMessage: "Pressing a task no longer hides its title until you let go.",
    id: "WMUg+a",
  },
});

const v051 = defineMessages({
  starTitle: {
    description: "ReleaseNotes 0.5.1 - highlight title: star at the end of phone task rows",
    defaultMessage: "Stars stand out",
    id: "tIv30F",
  },
  starDescription: {
    description: "ReleaseNotes 0.5.1 - highlight text: star at the end of phone task rows",
    defaultMessage:
      "On your phone, a starred task shows its star at the end of the row instead of tucked under the title.",
    id: "z7uhGb",
  },
  notesTitle: {
    description: "ReleaseNotes 0.5.1 - highlight title: option to hide the note marker",
    defaultMessage: "Hide the note marker",
    id: "bqsBN8",
  },
  notesDescription: {
    description: "ReleaseNotes 0.5.1 - highlight text: option to hide the note marker",
    defaultMessage: "A new Note marker switch in the Display menu hides the little icon on tasks that have a note.",
    id: "g1p+pU",
  },
});

const v050 = defineMessages({
  holdTitle: {
    description: "ReleaseNotes 0.5.0 - highlight title: hold a task to see its tags",
    defaultMessage: "Hold for tags",
    id: "AgaBmF",
  },
  holdDescription: {
    description: "ReleaseNotes 0.5.0 - highlight text: hold a task to see its tags",
    defaultMessage:
      "On your phone, press and hold a task to show its tags. Hold it again to tuck them away. A quick tap still opens the task.",
    id: "njnPaz",
  },
  quickAddTitle: {
    description: "ReleaseNotes 0.5.0 - highlight title: floating quick add on phones",
    defaultMessage: "Quick add floats",
    id: "vdeBro",
  },
  quickAddDescription: {
    description: "ReleaseNotes 0.5.0 - highlight text: floating quick add on phones",
    defaultMessage:
      "Suggestions and quick add now sit in a floating panel above your list, comfortably clear of the bottom edge.",
    id: "YAp2+f",
  },
  gripTitle: {
    description: "ReleaseNotes 0.5.0 - highlight title: slimmer drag grip on phones",
    defaultMessage: "A slimmer grip",
    id: "bQYjRg",
  },
  gripDescription: {
    description: "ReleaseNotes 0.5.0 - highlight text: slimmer drag grip on phones",
    defaultMessage: "The drag grip on phones hugs the edge of the card, leaving more room for the title.",
    id: "8Sx83A",
  },
  tapFixTitle: {
    description: "ReleaseNotes 0.5.0 - fix title: tapping a task no longer flashes its tags",
    defaultMessage: "Calmer taps",
    id: "9x0ZL+",
  },
  tapFixDescription: {
    description: "ReleaseNotes 0.5.0 - fix text: tapping a task no longer flashes its tags",
    defaultMessage: "Tapping a task on your phone opens it without its tags briefly sliding open first.",
    id: "z4PEeD",
  },
});

const v042 = defineMessages({
  starsTitle: {
    description: "ReleaseNotes 0.4.2 - highlight title: starred tasks lead My Day",
    defaultMessage: "Stars rise to the top",
    id: "xeuFCH",
  },
  starsDescription: {
    description: "ReleaseNotes 0.4.2 - highlight text: starred tasks lead My Day",
    defaultMessage:
      "Starred tasks now lead My Day. Star one and it glides up into place, while your own order still holds among the starred tasks and the rest.",
    id: "bB4p84",
  },
  suggestionsTitle: {
    description: "ReleaseNotes 0.4.2 - highlight title: animated adding from Suggestions",
    defaultMessage: "Watch suggestions land",
    id: "wbzX7t",
  },
  suggestionsDescription: {
    description: "ReleaseNotes 0.4.2 - highlight text: animated adding from Suggestions",
    defaultMessage:
      "Adding a suggestion ticks it off the panel and drops it into My Day with a quick glow, so you can see where it went.",
    id: "YdJZPr",
  },
  completeTitle: {
    description: "ReleaseNotes 0.4.2 - highlight title: completed tasks drop into Completed",
    defaultMessage: "Crossed off and counted",
    id: "X1NXBh",
  },
  completeDescription: {
    description: "ReleaseNotes 0.4.2 - highlight text: completed tasks drop into Completed",
    defaultMessage:
      "Completing a task now strikes through its title, then sinks it into Completed, whose count gives a little bump.",
    id: "eEiffN",
  },
});

const v041 = defineMessages({
  leanTitle: {
    description: "ReleaseNotes 0.4.1 - highlight title: leaner task rows on phones",
    defaultMessage: "Room to read on your phone",
    id: "qoCf5Z",
  },
  leanDescription: {
    description: "ReleaseNotes 0.4.1 - highlight text: leaner task rows on phones",
    defaultMessage:
      "Task rows on phones drop their buttons, so titles get nearly the full width. One quiet line underneath shows the due date, reminder, links, note and star.",
    id: "9etEMb",
  },
  detailsTitle: {
    description: "ReleaseNotes 0.4.1 - highlight title: task details sheet on phones",
    defaultMessage: "Tap a task for the details",
    id: "Jn/hc/",
  },
  detailsDescription: {
    description: "ReleaseNotes 0.4.1 - highlight text: task details sheet on phones",
    defaultMessage:
      "A sheet slides up with the whole title, its links and note, a star, and buttons to edit it or take it off My Day.",
    id: "UTa89c",
  },
  checkTitle: {
    description: "ReleaseNotes 0.4.1 - highlight title: animated completion",
    defaultMessage: "A satisfying tick",
    id: "i89f+4",
  },
  checkDescription: {
    description: "ReleaseNotes 0.4.1 - highlight text: animated completion",
    defaultMessage: "Completing a task fills the box and draws the check before it slides down to Completed.",
    id: "4iGVxl",
  },
});

const v040 = defineMessages({
  themesTitle: {
    description: "ReleaseNotes 0.4.0 - highlight title: new Dark and Midnight themes",
    defaultMessage: "A fresh coat of paint",
    id: "HEMYBB",
  },
  themesDescription: {
    description: "ReleaseNotes 0.4.0 - highlight text: new Dark and Midnight themes",
    defaultMessage:
      "Dark is now a crisp near-black look with glowing titles, and Midnight brings navy blues. Pick one in Settings › Appearance, along with density, motion and context tints.",
    id: "mBtm1y",
  },
  reorderTitle: {
    description: "ReleaseNotes 0.4.0 - highlight title: drag to reorder My Day",
    defaultMessage: "Put your day in order",
    id: "5ER/aD",
  },
  reorderDescription: {
    description: "ReleaseNotes 0.4.0 - highlight text: drag to reorder My Day",
    defaultMessage: "Drag a task by its grip to move it up or down My Day, or focus the grip and use the arrow keys.",
    id: "Gmt5g5",
  },
  displayTitle: {
    description: "ReleaseNotes 0.4.0 - highlight title: display options for My Day",
    defaultMessage: "Show only what you need",
    id: "WHgYX2",
  },
  displayDescription: {
    description: "ReleaseNotes 0.4.0 - highlight text: display options for My Day",
    defaultMessage:
      "The Display menu turns dates, link buttons, tags and the tag filter on or off. Minimal clears it all.",
    id: "bxFPXG",
  },
  sidebarTitle: {
    description: "ReleaseNotes 0.4.0 - highlight title: collapsible sidebar",
    defaultMessage: "Fold the sidebar away",
    id: "kA5Vmb",
  },
  sidebarDescription: {
    description: "ReleaseNotes 0.4.0 - highlight text: collapsible sidebar",
    defaultMessage: "Collapse it to a slim rail of icons for more room, and press ⌘\\ or Ctrl+\\ to flip it back.",
    id: "zUSkD3",
  },
  linksTitle: {
    description: "ReleaseNotes 0.4.0 - highlight title: several links share one button",
    defaultMessage: "Links pack together",
    id: "qR0GM3",
  },
  linksDescription: {
    description: "ReleaseNotes 0.4.0 - highlight text: several links share one button",
    defaultMessage:
      "A task with several links shows one button with a count, so the title gets the room. Tap it to pick a link.",
    id: "OGjBMi",
  },
  titlesFixTitle: {
    description: "ReleaseNotes 0.4.0 - fix title: long task titles on phones",
    defaultMessage: "Long titles behave on phones",
    id: "cVLmt4",
  },
  titlesFixDescription: {
    description: "ReleaseNotes 0.4.0 - fix text: long task titles on phones",
    defaultMessage: "Task titles keep to one tidy line on small screens. Open the task to read all of it.",
    id: "qaQYAJ",
  },
});

const v030 = defineMessages({
  drawerTitle: {
    description: "ReleaseNotes 0.3.0 - highlight title: mobile navigation drawer",
    defaultMessage: "Find your way on your phone",
    id: "jzIGtO",
  },
  drawerDescription: {
    description: "ReleaseNotes 0.3.0 - highlight text: mobile navigation drawer",
    defaultMessage:
      "Tap the menu button to hop between My Day, Important, Planned and Tasks. Settings and sync live there too.",
    id: "2WBXF0",
  },
  tagSearchTitle: {
    description: "ReleaseNotes 0.3.0 - highlight title: tag suggestions in search",
    defaultMessage: "Tags finish themselves",
    id: "HnVkJh",
  },
  tagSearchDescription: {
    description: "ReleaseNotes 0.3.0 - highlight text: tag suggestions in search",
    defaultMessage: "Type # in search and pick from your tags instead of spelling them out.",
    id: "vStbdN",
  },
  searchShortcutTitle: {
    description: "ReleaseNotes 0.3.0 - highlight title: search keyboard shortcut",
    defaultMessage: "Press / to search",
    id: "XRb4Vc",
  },
  searchShortcutDescription: {
    description: "ReleaseNotes 0.3.0 - highlight text: search keyboard shortcut",
    defaultMessage: "Jump straight to the search field from anywhere, whatever your keyboard layout.",
    id: "b40je6",
  },
  linkFixTitle: {
    description: "ReleaseNotes 0.3.0 - fix title: www links",
    defaultMessage: "www. links just work",
    id: "H3Mk5k",
  },
  linkFixDescription: {
    description: "ReleaseNotes 0.3.0 - fix text: www links",
    defaultMessage: "Type www.example.com in quick add or the editor and Klart turns it into a proper link.",
    id: "AbbkTA",
  },
});

const v020 = defineMessages({
  resizeTitle: {
    description: "ReleaseNotes 0.2.0 - highlight title: resizable side panel",
    defaultMessage: "Stretch the side panel",
    id: "2OvMyY",
  },
  resizeDescription: {
    description: "ReleaseNotes 0.2.0 - highlight text: resizable side panel",
    defaultMessage:
      "Drag the left edge of suggestions or the task editor to make room for long notes. Klart remembers the width, and a double-click puts it back.",
    id: "CiKK/a",
  },
  backFixTitle: {
    description: "ReleaseNotes 0.2.0 - fix title: Back button",
    defaultMessage: "Back goes back where you'd expect",
    id: "rmLPpd",
  },
  backFixDescription: {
    description: "ReleaseNotes 0.2.0 - fix text: Back button",
    defaultMessage:
      "Back from a task or from settings now lands on your list, like in a phone app, instead of wherever you were before.",
    id: "NIyMrl",
  },
});

const v010 = defineMessages({
  editTitle: {
    description: "ReleaseNotes 0.1.0 - highlight title: edit tasks",
    defaultMessage: "Edit tasks in place",
    id: "zooLFR",
  },
  editDescription: {
    description: "ReleaseNotes 0.1.0 - highlight text: edit tasks",
    defaultMessage:
      "Click any task to tweak its title, due date, reminder, tags, links and notes. Changes save themselves.",
    id: "rkuVuY",
  },
  linksTitle: {
    description: "ReleaseNotes 0.1.0 - highlight title: task links",
    defaultMessage: "Links on tasks",
    id: "8jB1mX",
  },
  linksDescription: {
    description: "ReleaseNotes 0.1.0 - highlight text: task links",
    defaultMessage: "Drop an https:// link into quick add and it sticks to the task, one click away.",
    id: "6k9KNL",
  },
  githubTitle: {
    description: "ReleaseNotes 0.1.0 - highlight title: GitHub sync",
    defaultMessage: "Sync through GitHub",
    id: "9LQS85",
  },
  githubDescription: {
    description: "ReleaseNotes 0.1.0 - highlight text: GitHub sync",
    defaultMessage: "Keep your tasks in a private repository and sync from any browser. Yes, even your phone!",
    id: "KyKEhc",
  },
  folderTitle: {
    description: "ReleaseNotes 0.1.0 - highlight title: folder and Git sync",
    defaultMessage: "Folder and Git sync",
    id: "gzYZ/v",
  },
  folderDescription: {
    description: "ReleaseNotes 0.1.0 - highlight text: folder and Git sync",
    defaultMessage: "Point Klart at OneDrive, iCloud Drive, Dropbox or a Git clone and your tasks follow you around.",
    id: "qQ6VCx",
  },
  desktopTitle: {
    description: "ReleaseNotes 0.1.0 - highlight title: desktop app",
    defaultMessage: "Klart on your desktop",
    id: "DI0paE",
  },
  desktopDescription: {
    description: "ReleaseNotes 0.1.0 - highlight text: desktop app",
    defaultMessage: "A proper app for macOS, Windows and Linux, with native notifications.",
    id: "emIbYa",
  },
  syncFixTitle: {
    description: "ReleaseNotes 0.1.0 - fix title: GitHub sync commits",
    defaultMessage: "Quieter GitHub sync",
    id: "LhXk+v",
  },
  syncFixDescription: {
    description: "ReleaseNotes 0.1.0 - fix text: GitHub sync commits",
    defaultMessage: "Klart no longer makes a commit every half hour just to say it's still around.",
    id: "y7NPKB",
  },
});

/**
 * Newest first. When you bump the version in `apps/web/package.json`, add an
 * entry here; people who update see every entry newer than the last one they saw.
 */
export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: "0.6.0",
    highlights: [
      { emoji: "🛒", title: v060.shoppingTitle, description: v060.shoppingDescription },
      { emoji: "☀️", title: v060.myDayTitle, description: v060.myDayDescription },
      { emoji: "✅", title: v060.completeTitle, description: v060.completeDescription },
      { emoji: "🤖", title: v060.agentsTitle, description: v060.agentsDescription },
    ],
    fixes: [{ emoji: "🔔", title: v060.notificationFixTitle, description: v060.notificationFixDescription }],
  },
  {
    version: "0.5.3",
    highlights: [{ emoji: "🏷️", title: v053.tagsTitle, description: v053.tagsDescription }],
    fixes: [{ emoji: "📜", title: v053.suggestionsFixTitle, description: v053.suggestionsFixDescription }],
  },
  {
    version: "0.5.2",
    highlights: [{ emoji: "📱", title: v052.iconTitle, description: v052.iconDescription }],
    fixes: [
      { emoji: "↕️", title: v052.reorderFixTitle, description: v052.reorderFixDescription },
      { emoji: "👆", title: v052.titleFixTitle, description: v052.titleFixDescription },
    ],
  },
  {
    version: "0.5.1",
    highlights: [
      { emoji: "⭐", title: v051.starTitle, description: v051.starDescription },
      { emoji: "📝", title: v051.notesTitle, description: v051.notesDescription },
    ],
    fixes: [],
  },
  {
    version: "0.5.0",
    highlights: [
      { emoji: "🏷️", title: v050.holdTitle, description: v050.holdDescription },
      { emoji: "🛟", title: v050.quickAddTitle, description: v050.quickAddDescription },
      { emoji: "↕️", title: v050.gripTitle, description: v050.gripDescription },
    ],
    fixes: [{ emoji: "👆", title: v050.tapFixTitle, description: v050.tapFixDescription }],
  },
  {
    version: "0.4.2",
    highlights: [
      { emoji: "⭐", title: v042.starsTitle, description: v042.starsDescription },
      { emoji: "💡", title: v042.suggestionsTitle, description: v042.suggestionsDescription },
      { emoji: "✅", title: v042.completeTitle, description: v042.completeDescription },
    ],
    fixes: [],
  },
  {
    version: "0.4.1",
    highlights: [
      { emoji: "📱", title: v041.leanTitle, description: v041.leanDescription },
      { emoji: "👆", title: v041.detailsTitle, description: v041.detailsDescription },
      { emoji: "✅", title: v041.checkTitle, description: v041.checkDescription },
    ],
    fixes: [],
  },
  {
    version: "0.4.0",
    highlights: [
      { emoji: "🎨", title: v040.themesTitle, description: v040.themesDescription },
      { emoji: "✋", title: v040.reorderTitle, description: v040.reorderDescription },
      { emoji: "🎛️", title: v040.displayTitle, description: v040.displayDescription },
      { emoji: "📐", title: v040.sidebarTitle, description: v040.sidebarDescription },
      { emoji: "🔗", title: v040.linksTitle, description: v040.linksDescription },
    ],
    fixes: [{ emoji: "📱", title: v040.titlesFixTitle, description: v040.titlesFixDescription }],
  },
  {
    version: "0.3.0",
    highlights: [
      { emoji: "📱", title: v030.drawerTitle, description: v030.drawerDescription },
      { emoji: "🏷️", title: v030.tagSearchTitle, description: v030.tagSearchDescription },
      { emoji: "⌨️", title: v030.searchShortcutTitle, description: v030.searchShortcutDescription },
    ],
    fixes: [{ emoji: "🔗", title: v030.linkFixTitle, description: v030.linkFixDescription }],
  },
  {
    version: "0.2.0",
    highlights: [{ emoji: "↔️", title: v020.resizeTitle, description: v020.resizeDescription }],
    fixes: [{ emoji: "🔙", title: v020.backFixTitle, description: v020.backFixDescription }],
  },
  {
    version: "0.1.0",
    highlights: [
      { emoji: "✏️", title: v010.editTitle, description: v010.editDescription },
      { emoji: "🔗", title: v010.linksTitle, description: v010.linksDescription },
      { emoji: "🐙", title: v010.githubTitle, description: v010.githubDescription },
      { emoji: "📁", title: v010.folderTitle, description: v010.folderDescription },
      { emoji: "🖥️", title: v010.desktopTitle, description: v010.desktopDescription },
    ],
    fixes: [{ emoji: "🤫", title: v010.syncFixTitle, description: v010.syncFixDescription }],
  },
];
