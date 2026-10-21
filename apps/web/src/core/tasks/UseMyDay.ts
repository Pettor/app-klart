import { useMemo } from "react";
import { useAtom, useAtomValue } from "jotai";
import type { TodayView } from "./AgentViews";
import { buildTodayView } from "./AgentViews";
import type { SmartView } from "./KlartAtoms";
import {
  currentContextAtom,
  klartDataAtom,
  searchQueryAtom,
  smartViewAtom,
  tagFilterAtom,
  todayAtom,
} from "./KlartAtoms";
import { addDays, toUtcTimestamp } from "./LocalDate";
import type { SuggestionGroup } from "./Suggestions";
import { buildSuggestions } from "./Suggestions";
import type { Task } from "./Task";
import { compareByDue, isOpen } from "./Task";
import type { ContextSelection, KlartContext } from "~/core/contexts/KlartContext";
import { ALL_CONTEXTS } from "~/core/contexts/KlartContext";

export interface TagCount {
  tag: string;
  count: number;
}

export interface MyDayState {
  today: string;
  contexts: KlartContext[];
  currentContext: ContextSelection;
  setCurrentContext: (context: ContextSelection) => void;
  smartView: SmartView;
  setSmartView: (view: SmartView) => void;
  tag: string | null;
  setTag: (tag: string | null) => void;
  search: string;
  setSearch: (search: string) => void;
  /** Open tasks for the selected smart view, in display order. */
  listTasks: Task[];
  /** Completed tasks in today's My Day. */
  doneTasks: Task[];
  suggestionGroups: SuggestionGroup[];
  /** Open My Day tasks per context id, plus `all`. */
  dayCountByContext: Record<string, number>;
  smartCounts: Record<SmartView, number>;
  tags: TagCount[];
  inTodayIds: Set<string>;
  /** `views/today.json` for the visible tasks. */
  todayView: TodayView;
}

const MAX_SIDEBAR_TAGS = 12;

function matchesSearch(task: Task, search: string): boolean {
  const terms = search.toLowerCase().split(/\s+/).filter(Boolean);
  return terms.every((term) =>
    term.startsWith("#") && term.length > 1
      ? task.tags.includes(term.slice(1))
      : task.title.toLowerCase().includes(term) || task.notes.toLowerCase().includes(term)
  );
}

/** Everything the My Day screen derives from the data: lists, counts, tags and suggestions. */
export function useMyDay(): MyDayState {
  const data = useAtomValue(klartDataAtom);
  const today = useAtomValue(todayAtom);
  const [currentContextRaw, setCurrentContext] = useAtom(currentContextAtom);
  const [smartView, setSmartView] = useAtom(smartViewAtom);
  const [tag, setTag] = useAtom(tagFilterAtom);
  const [search, setSearch] = useAtom(searchQueryAtom);

  const currentContext =
    currentContextRaw === ALL_CONTEXTS || data.contexts.some((context) => context.id === currentContextRaw)
      ? currentContextRaw
      : ALL_CONTEXTS;

  const derived = useMemo(() => {
    const contextTags = data.contexts.map((context) => context.tag);
    const allTasks = Object.values(data.tasks).filter((task) => task.status !== "archived");
    const inContext = allTasks.filter((task) => currentContext === ALL_CONTEXTS || task.context === currentContext);
    const visible = inContext.filter(
      (task) => (!tag || task.tags.includes(tag)) && (!search.trim() || matchesSearch(task, search))
    );
    const visibleById = new Map(visible.map((task) => [task.id, task]));
    const todayDay = data.days[today];
    const inTodayIds = new Set(todayDay?.items.map((item) => item.taskId));
    const dayTasks = (todayDay?.items ?? []).flatMap((item) => {
      const task = visibleById.get(item.taskId);
      return task ? [task] : [];
    });
    const open = visible.filter(isOpen);

    const lists: Record<SmartView, Task[]> = {
      day: dayTasks.filter(isOpen),
      important: open.filter((task) => task.important).sort(compareByDue),
      planned: open.filter((task) => !!task.due).sort(compareByDue),
      tasks: [...open].sort(compareByDue),
    };

    const contextOpen = inContext.filter(isOpen);
    const smartCounts: Record<SmartView, number> = {
      day: contextOpen.filter((task) => inTodayIds.has(task.id)).length,
      important: contextOpen.filter((task) => task.important).length,
      planned: contextOpen.filter((task) => !!task.due).length,
      tasks: contextOpen.length,
    };

    const dayCountByContext: Record<string, number> = { [ALL_CONTEXTS]: 0 };
    for (const task of allTasks) {
      if (isOpen(task) && inTodayIds.has(task.id)) {
        dayCountByContext[task.context] = (dayCountByContext[task.context] ?? 0) + 1;
        dayCountByContext[ALL_CONTEXTS]! += 1;
      }
    }

    const tagTotals = new Map<string, number>();
    for (const task of contextOpen) {
      for (const taskTag of task.tags) {
        if (!contextTags.includes(taskTag)) {
          tagTotals.set(taskTag, (tagTotals.get(taskTag) ?? 0) + 1);
        }
      }
    }
    const tags = [...tagTotals.entries()]
      .map(([name, count]) => ({ tag: name, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
      .slice(0, MAX_SIDEBAR_TAGS);
    if (tag && !tags.some((entry) => entry.tag === tag)) {
      tags.push({ tag, count: tagTotals.get(tag) ?? 0 });
    }

    const suggestionGroups = buildSuggestions({
      tasks: visible,
      today,
      todayDay,
      yesterdayDay: data.days[addDays(today, -1)],
      contextTags,
    });

    const fullView = buildTodayView(data, today, toUtcTimestamp(new Date()));
    const todayView: TodayView = { ...fullView, items: fullView.items.filter((item) => visibleById.has(item.taskId)) };

    return {
      listTasks: lists[smartView],
      doneTasks: dayTasks.filter((task) => task.status === "done"),
      suggestionGroups,
      dayCountByContext,
      smartCounts,
      tags,
      inTodayIds,
      todayView,
    };
  }, [data, today, currentContext, tag, search, smartView]);

  return {
    today,
    contexts: data.contexts,
    currentContext,
    setCurrentContext,
    smartView,
    setSmartView,
    tag,
    setTag,
    search,
    setSearch,
    ...derived,
  };
}
