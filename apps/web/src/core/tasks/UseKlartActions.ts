import { useCallback, useMemo } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import type { DayItemSource, SuggestionReason } from "./Day";
import { currentContextAtom, klartDataAtom, todayAtom } from "./KlartAtoms";
import type { KlartData, TaskPatch } from "./KlartData";
import {
  addContext,
  addToDay,
  archiveTask,
  createTask,
  moveContext,
  removeContext,
  removeFromDay,
  setTaskDone,
  updateContext,
  updateTask,
} from "./KlartData";
import { parseQuickAdd } from "./QuickAdd";
import type { Task } from "./Task";
import type { ContextColor, KlartContext } from "~/core/contexts/KlartContext";
import { createContextId, toContextTag } from "~/core/contexts/KlartContext";

export interface KlartActions {
  /** Parses a quick-add line, creates the task and puts it in today's My Day. Returns `null` for an empty title. */
  quickAdd: (text: string) => Task | null;
  setDone: (taskId: string, done: boolean) => void;
  toggleImportant: (taskId: string) => void;
  updateTask: (taskId: string, patch: TaskPatch) => void;
  archive: (taskId: string) => void;
  addToToday: (items: { taskId: string; reason: SuggestionReason | null; addedBy?: DayItemSource }[]) => void;
  removeFromToday: (taskId: string) => void;
  createContext: (name: string, color: ContextColor) => KlartContext;
  updateContext: (id: string, patch: Partial<Omit<KlartContext, "id">>) => void;
  removeContext: (id: string) => void;
  moveContext: (id: string, direction: -1 | 1) => void;
}

/** All mutations of Klart's data. Each one stamps `updatedAt` so sync can resolve conflicts. */
export function useKlartActions(): KlartActions {
  const setData = useSetAtom(klartDataAtom);
  const data = useAtomValue(klartDataAtom);
  const currentContext = useAtomValue(currentContextAtom);
  const today = useAtomValue(todayAtom);

  const change = useCallback(
    (fn: (current: KlartData, now: Date) => KlartData) => {
      setData((current) => fn(current, new Date()));
    },
    [setData]
  );

  const quickAdd = useCallback(
    (text: string): Task | null => {
      const parsed = parseQuickAdd(text, { today, contexts: data.contexts, currentContext });
      if (!parsed.title) {
        return null;
      }
      const task = createTask(parsed, new Date());
      change((current, now) => {
        const withTask = { ...current, tasks: { ...current.tasks, [task.id]: task } };
        return addToDay(withTask, today, [{ taskId: task.id, addedBy: "quick_add", reason: null }], now);
      });
      return task;
    },
    [change, currentContext, data.contexts, today]
  );

  return useMemo(
    () => ({
      quickAdd,
      setDone: (taskId, done) => change((current, now) => setTaskDone(current, taskId, done, now)),
      toggleImportant: (taskId) =>
        change((current, now) => updateTask(current, taskId, { important: !current.tasks[taskId]?.important }, now)),
      updateTask: (taskId, patch) => change((current, now) => updateTask(current, taskId, patch, now)),
      archive: (taskId) => change((current, now) => removeFromDay(archiveTask(current, taskId, now), today, taskId)),
      addToToday: (items) =>
        change((current, now) =>
          addToDay(
            current,
            today,
            items.map((item) => ({ taskId: item.taskId, reason: item.reason, addedBy: item.addedBy ?? "suggestion" })),
            now
          )
        ),
      removeFromToday: (taskId) => change((current) => removeFromDay(current, today, taskId)),
      createContext: (name, color) => {
        const context: KlartContext = {
          id: createContextId(name, data.contexts),
          name: name.trim(),
          color,
          tag: toContextTag(name),
        };
        change((current) => addContext(current, context));
        return context;
      },
      updateContext: (id, patch) =>
        change((current) => updateContext(current, id, patch.tag ? { ...patch, tag: toContextTag(patch.tag) } : patch)),
      removeContext: (id) => change((current, now) => removeContext(current, id, now)),
      moveContext: (id, direction) => change((current) => moveContext(current, id, direction)),
    }),
    [change, data.contexts, quickAdd, today]
  );
}
