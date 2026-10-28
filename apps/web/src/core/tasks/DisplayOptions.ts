/** What My Day shows besides each task's title. Chosen in the Display menu, remembered per device. */
export interface DisplayOptions {
  /** Due date and reminder under each title. */
  details: boolean;
  /** A marker on tasks that have a note. */
  notes: boolean;
  /** A button per task link that opens it in one click. */
  links: boolean;
  /** Every task's tags below its title; off, tags are hidden. */
  taskTags: boolean;
  /** The tag list in the sidebar, or the tag chips on phones. */
  tagFilter: boolean;
  /** Keeps the completed list expanded. */
  completed: boolean;
  /** Today as `views/today.json`, above the list. */
  agentJson: boolean;
}

export type DisplayOption = keyof DisplayOptions;

/** The default, and what "Minimal" in the Display menu goes back to. */
export const MINIMAL_DISPLAY_OPTIONS: DisplayOptions = {
  details: true,
  notes: true,
  links: true,
  taskTags: false,
  tagFilter: false,
  completed: false,
  agentJson: false,
};

/** Options that add to the minimal view; the Display button shows a dot while any is on. */
export function hasDisplayExtras(options: DisplayOptions): boolean {
  return options.taskTags || options.tagFilter || options.completed || options.agentJson;
}
