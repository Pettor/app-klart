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
