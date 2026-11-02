import type { DayFile, SuggestionReason } from "./Day";
import { addDays, daysBetween } from "./LocalDate";
import type { SuggestionSettings } from "./SuggestionSettings";
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
  /** Groups switched off and the "coming up" window, from settings. */
  settings?: SuggestionSettings;
  /** Tasks hidden with "Not today". */
  snoozedIds?: ReadonlySet<string>;
}

/** The filters a suggestion answers to in the panel. */
export type SuggestionKind = "overdue" | "soon" | "related" | "important";

/** Why a task is suggested, in the panel's words. */
export type SuggestionWhy =
  | { type: "overdue"; days: number }
  /** Overdue so long it may no longer matter. */
  | { type: "stale"; days: number }
  | { type: "due_today" }
  | { type: "left_from_yesterday" }
  | { type: "due_in"; days: number }
  | { type: "due_on"; date: string }
  | { type: "goes_with_today"; tag: string }
  | { type: "no_date" };

export interface RankedSuggestion {
  task: Task;
  reason: SuggestionReason;
  score: number;
  why: SuggestionWhy;
  kinds: SuggestionKind[];
}

/** How many days ahead counts as "coming up", unless settings say otherwise. */
export const COMING_UP_DAYS = 3;

/** Overdue longer than this and a task is asked about rather than pushed. */
const STALE_AFTER_DAYS = 30;

/** From this score a suggestion "needs attention today". */
const URGENT_SCORE = 95;

function newestFirst(a: Task, b: Task): number {
  return b.createdAt.localeCompare(a.createdAt);
}

/** Tags on today's tasks, without the ones that only route to a context (e.g. `work`). */
function getDayTags(tasks: Task[], inToday: ReadonlySet<string>, contextTags: string[]): Set<string> {
  const ignoredTags = new Set(contextTags);
  return new Set(
    tasks
      .filter((task) => inToday.has(task.id))
      .flatMap((task) => task.tags)
      .filter((tag) => !ignoredTags.has(tag))
  );
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
  settings,
  snoozedIds,
}: SuggestionInput): SuggestionGroup[] {
  const inToday = new Set(todayDay?.items.map((item) => item.taskId));
  const inYesterday = new Set(yesterdayDay?.items.map((item) => item.taskId));
  const dayTags = getDayTags(tasks, inToday, contextTags);
  const comingUpLimit = addDays(today, settings?.comingUpDays ?? COMING_UP_DAYS);
  const disabled = new Set(settings?.disabled);

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

  let pool = tasks.filter((task) => isOpen(task) && !inToday.has(task.id) && !snoozedIds?.has(task.id));
  const groups: SuggestionGroup[] = [];

  for (const rule of rules.filter((candidate) => !disabled.has(candidate.reason))) {
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

function getBase(
  task: Task,
  reason: SuggestionReason,
  today: string
): Pick<RankedSuggestion, "score" | "why" | "kinds"> {
  switch (reason) {
    case "overdue": {
      const days = daysBetween(task.due!, today);
      return days > STALE_AFTER_DAYS
        ? { score: 45, why: { type: "stale", days }, kinds: ["overdue"] }
        : { score: 100 + Math.min(days, 14) * 2, why: { type: "overdue", days }, kinds: ["overdue"] };
    }
    case "due_today":
      return { score: 95, why: { type: "due_today" }, kinds: ["soon"] };
    case "left_from_yesterday":
      return { score: 70, why: { type: "left_from_yesterday" }, kinds: ["soon"] };
    case "coming_up": {
      const days = daysBetween(today, task.due!);
      return { score: 60 - days * 5, why: { type: "due_in", days }, kinds: ["soon"] };
    }
    case "related_to_today":
    case "recently_added":
      return task.due
        ? { score: 20, why: { type: "due_on", date: task.due }, kinds: [] }
        : { score: 10, why: { type: "no_date" }, kinds: [] };
  }
}

/**
 * The suggestions as one list, best first: how overdue, how soon, tags shared
 * with today, importance and a reminder today all add to a task's score. Takes
 * its tasks and reasons from {@link buildSuggestions}, so settings apply.
 */
export function rankSuggestions(input: SuggestionInput): RankedSuggestion[] {
  const { tasks, today, todayDay, contextTags = [] } = input;
  const inToday = new Set(todayDay?.items.map((item) => item.taskId));
  const dayTags = getDayTags(tasks, inToday, contextTags);

  return buildSuggestions(input)
    .flatMap((group) =>
      group.tasks.map((task): RankedSuggestion => {
        const base = getBase(task, group.reason, today);
        const shared = task.tags.filter((tag) => dayTags.has(tag));
        const score =
          base.score +
          12 * Math.min(shared.length, 2) +
          (task.important ? 30 : 0) +
          (task.remindAt?.startsWith(today) ? 15 : 0);
        // Shared tags explain a weak suggestion; an overdue or imminent one has a better reason already.
        const isExplainedByTag =
          shared.length > 0 && !base.kinds.includes("overdue") && base.score + 12 * Math.min(shared.length, 2) < 60;
        return {
          task,
          reason: group.reason,
          score,
          why: isExplainedByTag ? { type: "goes_with_today", tag: shared[0]! } : base.why,
          kinds: [
            ...base.kinds,
            ...(shared.length > 0 ? (["related"] as const) : []),
            ...(task.important ? (["important"] as const) : []),
          ],
        };
      })
    )
    .sort((a, b) => b.score - a.score);
}

export function isUrgentSuggestion(suggestion: RankedSuggestion): boolean {
  return suggestion.score >= URGENT_SCORE;
}

/** The tasks a stored "Not today" still hides: only ones from today, so they return tomorrow on their own. */
export function getSnoozedToday(snoozes: Record<string, string>, today: string): Set<string> {
  return new Set(
    Object.entries(snoozes)
      .filter(([, date]) => date === today)
      .map(([taskId]) => taskId)
  );
}
