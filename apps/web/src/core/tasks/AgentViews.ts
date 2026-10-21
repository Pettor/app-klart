import type { DayItem, SuggestionReason } from "./Day";
import type { KlartData } from "./KlartData";
import { addDays } from "./LocalDate";
import type { SuggestionGroup } from "./Suggestions";
import { buildSuggestions } from "./Suggestions";
import type { Task } from "./Task";

/** `views/today.json`: today's day file with full tasks inlined. Read-only for agents. */
export interface TodayView {
  schema: "klart.view.today/v1";
  date: string;
  generatedAt: string;
  items: (DayItem & { task: Task })[];
}

export interface SuggestionsViewItem {
  taskId: string;
  title: string;
  context: string;
  tags: string[];
  due: string | null;
  reason: SuggestionReason;
}

/** `views/suggestions.json`: ranked candidates for My Day. Read-only for agents. */
export interface SuggestionsView {
  schema: "klart.suggestions/v1";
  date: string;
  generatedAt: string;
  items: SuggestionsViewItem[];
}

export function buildTodayView(data: KlartData, today: string, generatedAt: string): TodayView {
  const items = (data.days[today]?.items ?? []).flatMap((item) => {
    const task = data.tasks[item.taskId];
    return task && task.status !== "archived" ? [{ ...item, task }] : [];
  });
  return { schema: "klart.view.today/v1", date: today, generatedAt, items };
}

export function toSuggestionsViewItems(groups: SuggestionGroup[]): SuggestionsViewItem[] {
  return groups.flatMap((group) =>
    group.tasks.map((task) => ({
      taskId: task.id,
      title: task.title,
      context: task.context,
      tags: task.tags,
      due: task.due,
      reason: group.reason,
    }))
  );
}

export function buildSuggestionsView(data: KlartData, today: string, generatedAt: string): SuggestionsView {
  const groups = buildSuggestions({
    tasks: Object.values(data.tasks),
    today,
    todayDay: data.days[today],
    yesterdayDay: data.days[addDays(today, -1)],
    contextTags: data.contexts.map((context) => context.tag),
  });
  return { schema: "klart.suggestions/v1", date: today, generatedAt, items: toSuggestionsViewItems(groups) };
}
