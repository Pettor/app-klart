import { useMemo, useState } from "react";
import { useBreakpoint } from "@package/react";
import { useNavigate } from "@tanstack/react-router";
import { useAtom } from "jotai";
import { useIntl } from "react-intl";
import type { ContextSwitcherOption } from "~/components/actions/context-switcher/ContextSwitcher";
import type { SuggestionListGroup } from "~/components/display/suggestion-list/SuggestionList";
import type { KlartContext } from "~/core/contexts/KlartContext";
import { ALL_CONTEXTS, findContext } from "~/core/contexts/KlartContext";
import type { SettingsSectionId } from "~/core/settings/SettingsSection";
import { useFolderSync } from "~/core/sync/UseFolderSync";
import { showAgentJsonAtom, showSuggestionsAtom } from "~/core/tasks/KlartAtoms";
import { parseQuickAdd } from "~/core/tasks/QuickAdd";
import { selectDueSuggestions } from "~/core/tasks/Suggestions";
import type { Task } from "~/core/tasks/Task";
import { useKlartActions } from "~/core/tasks/UseKlartActions";
import { useMyDay } from "~/core/tasks/UseMyDay";
import type { MyDayTask } from "~/views/my-day/MyDayTypes";
import type { MyDayViewProps } from "~/views/my-day/MyDayView";

/** Suggestion groups longer than this are truncated in the panel (the agent file keeps everything). */
const MAX_ITEMS_PER_GROUP = 12;

function toMyDayTask(task: Task, contexts: KlartContext[], inTodayIds: Set<string>): MyDayTask {
  const context = findContext(contexts, task.context);
  return {
    id: task.id,
    title: task.title,
    done: task.status === "done",
    important: task.important,
    due: task.due,
    remindAt: task.remindAt,
    tags: task.tags.filter((tag) => tag !== context?.tag),
    links: task.links,
    contextName: context?.name ?? task.context,
    contextColor: context?.color ?? "blue",
    isInMyDay: inTodayIds.has(task.id),
  };
}

export function useMyDayRoute(): MyDayViewProps {
  const intl = useIntl();
  const navigate = useNavigate();
  const myDay = useMyDay();
  const actions = useKlartActions();
  const sync = useFolderSync();
  const isWide = useBreakpoint("xl");
  const [showSuggestions, setShowSuggestions] = useAtom(showSuggestionsAtom);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showJson, setShowJson] = useAtom(showAgentJsonAtom);
  const [draft, setDraft] = useState("");

  const { contexts, currentContext, today, inTodayIds } = myDay;
  const selected = findContext(contexts, currentContext);
  const allName = intl.formatMessage({
    description: "MyDay - name of the built-in view showing every context",
    defaultMessage: "All contexts",
    id: "6JfLsW",
  });

  function openSettings(section?: SettingsSectionId): void {
    void navigate({ to: "/settings", search: section ? { section } : {} });
  }

  const contextOptions = useMemo<ContextSwitcherOption[]>(
    () => [
      {
        id: ALL_CONTEXTS,
        name: allName,
        color: "all",
        dayCount: myDay.dayCountByContext[ALL_CONTEXTS] ?? 0,
        shortcut: "0",
      },
      ...contexts.map((context, index) => ({
        id: context.id,
        name: context.name,
        color: context.color,
        dayCount: myDay.dayCountByContext[context.id] ?? 0,
        shortcut: index < 9 ? String(index + 1) : undefined,
      })),
    ],
    [allName, contexts, myDay.dayCountByContext]
  );

  const suggestionGroups = useMemo<SuggestionListGroup[]>(
    () =>
      myDay.suggestionGroups.map((group) => ({
        reason: group.reason,
        total: group.tasks.length,
        items: group.tasks.slice(0, MAX_ITEMS_PER_GROUP).map((task) => {
          const row = toMyDayTask(task, contexts, inTodayIds);
          return { id: row.id, title: row.title, contextColor: row.contextColor, due: row.due, tags: row.tags };
        }),
      })),
    [contexts, inTodayIds, myDay.suggestionGroups]
  );
  const dueSuggestions = selectDueSuggestions(myDay.suggestionGroups);

  const parsed = draft.trim() ? parseQuickAdd(draft, { today, contexts, currentContext }) : null;
  const parsedContext = parsed ? findContext(contexts, parsed.context) : undefined;

  return {
    today,
    context: {
      options: contextOptions,
      selectedId: currentContext,
      selectedName: selected?.name ?? allName,
      selectedColor: selected?.color ?? "all",
      onSelect: (id) => {
        myDay.setCurrentContext(id);
        myDay.setTag(null);
      },
      onManage: () => openSettings("contexts"),
    },
    search: { value: myDay.search, onChange: myDay.setSearch },
    smartViews: {
      items: (["day", "important", "planned", "tasks"] as const).map((id) => ({ id, count: myDay.smartCounts[id] })),
      active: myDay.smartView,
      onSelect: myDay.setSmartView,
    },
    tags: { items: myDay.tags, active: myDay.tag, onSelect: myDay.setTag },
    sync: {
      status: sync.status,
      onPress: () => {
        if (sync.status.state === "needs-permission") {
          void sync.reconnect();
        } else {
          openSettings("sync");
        }
      },
    },
    tasks: myDay.listTasks.map((task) => toMyDayTask(task, contexts, inTodayIds)),
    doneTasks: myDay.smartView === "day" ? myDay.doneTasks.map((task) => toMyDayTask(task, contexts, inTodayIds)) : [],
    showContextOnTasks: currentContext === ALL_CONTEXTS,
    taskActions: {
      onToggleDone: actions.setDone,
      onToggleImportant: actions.toggleImportant,
      onAddToMyDay: (taskId) => actions.addToToday([{ taskId, reason: null, addedBy: "user" }]),
      onRemoveFromMyDay: actions.removeFromToday,
      onArchive: actions.archive,
    },
    quickAdd: {
      value: draft,
      onChange: setDraft,
      onSubmit: () => {
        if (actions.quickAdd(draft)) {
          setDraft("");
        }
      },
      preview: parsed
        ? {
            title: parsed.title,
            contextName: parsedContext?.name ?? parsed.context,
            contextColor: parsedContext?.color ?? "blue",
            due: parsed.due,
            remindAt: parsed.remindAt,
            important: parsed.important,
            tags: parsed.tags.filter((tag) => tag !== parsedContext?.tag),
            links: parsed.links,
          }
        : null,
    },
    suggestions: {
      groups: suggestionGroups,
      count: suggestionGroups.reduce((sum, group) => sum + group.total, 0),
      dueCount: dueSuggestions.length,
      isOpen: isWide ? showSuggestions : isSheetOpen,
      onToggle: () => (isWide ? setShowSuggestions(!showSuggestions) : setIsSheetOpen(!isSheetOpen)),
      onAdd: (taskId, reason) => actions.addToToday([{ taskId, reason }]),
      onAddAllDue: () => actions.addToToday(dueSuggestions.map(({ task, reason }) => ({ taskId: task.id, reason }))),
    },
    agentJson: {
      isOpen: showJson,
      onToggle: () => setShowJson(!showJson),
      json: JSON.stringify(myDay.todayView, null, 2),
    },
    onOpenSettings: () => openSettings(),
    onOpenNotifications: () => openSettings("notifications"),
  };
}
