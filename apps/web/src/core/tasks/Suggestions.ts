import type { DayFile, SuggestionReason } from "./Day";
import { addDays } from "./LocalDate";
import type { Task } from "./Task";
import { compareByDue, isOpen } from "./Task";

export interface SuggestionGroup {
  reason: SuggestionReason;
  tasks: Task[];
}

export interface SuggestionInput {
  /** Candidate tasks, already filtered to the visible context/tag. */
  tasks: Task[];
  today: string;
  todayDay?: DayFile;
  yesterdayDay?: DayFile;
  /** Tags that only route to a context (e.g. `work`); ignored for "related to today". */
  contextTags?: string[];
}

/** How many days ahead counts as "coming up". */
export const COMING_UP_DAYS = 3;

function newestFirst(a: Task, b: Task): number {
  return b.createdAt.localeCompare(a.createdAt);
}

/**
 * Ranks every open task that isn't already in today's My Day. Each task lands
 * in the first group it matches, in this order: overdue, due today, left from
 * yesterday, coming up, related to today (shares a tag), recently added.
 */
export function buildSuggestions({
  tasks,
  today,
  todayDay,
  yesterdayDay,
  contextTags = [],
}: SuggestionInput): SuggestionGroup[] {
  const inToday = new Set(todayDay?.items.map((item) => item.taskId));
  const inYesterday = new Set(yesterdayDay?.items.map((item) => item.taskId));
  const ignoredTags = new Set(contextTags);
  const dayTags = new Set(
    tasks
      .filter((task) => inToday.has(task.id))
      .flatMap((task) => task.tags)
      .filter((tag) => !ignoredTags.has(tag))
  );
  const comingUpLimit = addDays(today, COMING_UP_DAYS);

  const rules: { reason: SuggestionReason; matches: (task: Task) => boolean; sort: (a: Task, b: Task) => number }[] = [
    { reason: "overdue", matches: (task) => !!task.due && task.due < today, sort: compareByDue },
    { reason: "due_today", matches: (task) => task.due === today, sort: newestFirst },
    { reason: "left_from_yesterday", matches: (task) => inYesterday.has(task.id), sort: compareByDue },
    {
      reason: "coming_up",
      matches: (task) => !!task.due && task.due > today && task.due <= comingUpLimit,
      sort: compareByDue,
    },
    { reason: "related_to_today", matches: (task) => task.tags.some((tag) => dayTags.has(tag)), sort: compareByDue },
    { reason: "recently_added", matches: () => true, sort: newestFirst },
  ];

  let pool = tasks.filter((task) => isOpen(task) && !inToday.has(task.id));
  const groups: SuggestionGroup[] = [];

  for (const rule of rules) {
    const matched = pool.filter(rule.matches);
    if (matched.length > 0) {
      groups.push({ reason: rule.reason, tasks: matched.sort(rule.sort) });
      const taken = new Set(matched.map((task) => task.id));
      pool = pool.filter((task) => !taken.has(task.id));
    }
  }

  return groups;
}

/** Tasks that "Add all due" pulls in: overdue and due today. */
export function selectDueSuggestions(groups: SuggestionGroup[]): { task: Task; reason: SuggestionReason }[] {
  return groups
    .filter((group) => group.reason === "overdue" || group.reason === "due_today")
    .flatMap((group) => group.tasks.map((task) => ({ task, reason: group.reason })));
}
