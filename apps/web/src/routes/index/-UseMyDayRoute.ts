import { useMemo, useState } from "react";
import { useBreakpoint } from "@package/react";
import { useAtom } from "jotai";
import { useIntl } from "react-intl";
import type { ContextSwitcherOption } from "~/components/actions/context-switcher/ContextSwitcher";
import type { SuggestionListGroup } from "~/components/display/suggestion-list/SuggestionList";
import type { TaskEditorTask } from "~/components/input/task-editor/TaskEditor";
import type { KlartContext } from "~/core/contexts/KlartContext";
import { ALL_CONTEXTS, findContext } from "~/core/contexts/KlartContext";
import { useHierarchyNavigation } from "~/core/routes/UseHierarchyNavigation";
import type { SettingsSectionId } from "~/core/settings/SettingsSection";
import { taskPath } from "~/core/sync/FolderSync";
import { useFolderSync } from "~/core/sync/UseFolderSync";
import { showAgentJsonAtom, showSuggestionsAtom } from "~/core/tasks/KlartAtoms";
import type { TaskPatch } from "~/core/tasks/KlartData";
import { parseQuickAdd } from "~/core/tasks/QuickAdd";
import { selectDueSuggestions } from "~/core/tasks/Suggestions";
import type { Task } from "~/core/tasks/Task";
import { useKlartActions } from "~/core/tasks/UseKlartActions";
import { useMyDay } from "~/core/tasks/UseMyDay";
import { useTask } from "~/core/tasks/UseTask";
import type { MyDayTask, MyDayTaskEditorProps } from "~/views/my-day/MyDayTypes";
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

function toEditorTask(task: Task, contexts: KlartContext[], inTodayIds: Set<string>): TaskEditorTask {
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
    notes: task.notes,
    contextId: task.context,
    contextColor: context?.color ?? "blue",
    isInMyDay: inTodayIds.has(task.id),
    file: taskPath(task),
  };
}

export function useMyDayRoute(editingId: string | null): MyDayViewProps {
  const intl = useIntl();
  const navigation = useHierarchyNavigation();
  const myDay = useMyDay();
  const actions = useKlartActions();
  const sync = useFolderSync();
  const isWide = useBreakpoint("xl");
  const [showSuggestions, setShowSuggestions] = useAtom(showSuggestionsAtom);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showJson, setShowJson] = useAtom(showAgentJsonAtom);
  const [draft, setDraft] = useState("");
  const editingTask = useTask(editingId);

  const { contexts, currentContext, today, inTodayIds } = myDay;
  const selected = findContext(contexts, currentContext);
  const allName = intl.formatMessage({
    description: "MyDay - name of the built-in view showing every context",
    defaultMessage: "All contexts",
    id: "6JfLsW",
  });

  function openSettings(section?: SettingsSectionId): void {
    navigation.down({ to: "/settings", search: section ? { section } : {} });
  }

  function openTask(taskId: string): void {
    if (taskId === editingId) {
      return;
    }
    // Switching tasks replaces the entry, so Back from any task lands on the list.
    const open = editingId ? navigation.across : navigation.down;
    open({ to: "/", search: { task: taskId } });
  }

  function closeTask(): void {
    if (editingId) {
      navigation.up({ to: "/" });
    }
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

  const editor: MyDayTaskEditorProps = {
    task: editingTask ? toEditorTask(editingTask, contexts, inTodayIds) : null,
    contexts: contexts.map((context) => ({ id: context.id, name: context.name, color: context.color })),
    onChange: ({ contextId, ...rest }) => {
      if (!editingTask) {
        return;
      }
      const context = findContext(contexts, editingTask.context);
      // The editor hides the context's routing tag; keep it on the task unless the task moves context.
      const keepsTag = !contextId && !!context && editingTask.tags.includes(context.tag);
      const patch: TaskPatch = { ...rest };
      if (rest.tags) {
        patch.tags = keepsTag ? [context.tag, ...rest.tags.filter((tag) => tag !== context.tag)] : rest.tags;
      }
      if (contextId && contextId !== editingTask.context) {
        patch.context = contextId;
        patch.tags = (patch.tags ?? editingTask.tags).filter((tag) => tag !== context?.tag);
      }
      actions.updateTask(editingTask.id, patch);
    },
    onToggleDone: () => editingTask && actions.setDone(editingTask.id, editingTask.status !== "done"),
    onToggleImportant: () => editingTask && actions.toggleImportant(editingTask.id),
    onToggleMyDay: () => {
      if (!editingTask) {
        return;
      }
      if (inTodayIds.has(editingTask.id)) {
        actions.removeFromToday(editingTask.id);
      } else {
        actions.addToToday([{ taskId: editingTask.id, reason: null, addedBy: "user" }]);
      }
    },
    onArchive: () => {
      if (editingTask) {
        actions.archive(editingTask.id);
        closeTask();
      }
    },
    onClose: closeTask,
  };

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
      onArchive: (taskId) => {
        actions.archive(taskId);
        if (taskId === editingId) {
          closeTask();
        }
      },
      onOpen: (taskId) => {
        openTask(taskId);
        setIsSheetOpen(false);
      },
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
      // On wide screens the editor replaces the panel, so the toggle closes the editor and brings suggestions back.
      isOpen: isWide ? showSuggestions && !editor.task : isSheetOpen,
      onToggle: () => {
        if (!isWide) {
          setIsSheetOpen(!isSheetOpen);
        } else if (editor.task) {
          closeTask();
          setShowSuggestions(true);
        } else {
          setShowSuggestions(!showSuggestions);
        }
      },
      onAdd: (taskId, reason) => actions.addToToday([{ taskId, reason }]),
      onAddAllDue: () => actions.addToToday(dueSuggestions.map(({ task, reason }) => ({ taskId: task.id, reason }))),
    },
    editor,
    agentJson: {
      isOpen: showJson,
      onToggle: () => setShowJson(!showJson),
      json: JSON.stringify(myDay.todayView, null, 2),
    },
    onOpenSettings: () => openSettings(),
    onOpenNotifications: () => openSettings("notifications"),
  };
}
