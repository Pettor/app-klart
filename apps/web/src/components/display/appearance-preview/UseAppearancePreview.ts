import { useState } from "react";
import { useIntl } from "react-intl";
import type { TaskRowTask } from "~/components/display/task-row/TaskRow";

type PreviewTaskId = "preview-1" | "preview-2" | "preview-3";

interface PreviewTaskState {
  id: PreviewTaskId;
  done: boolean;
  important: boolean;
}

const INITIAL_STATE: PreviewTaskState[] = [
  { id: "preview-1", done: false, important: true },
  { id: "preview-2", done: false, important: false },
  { id: "preview-3", done: true, important: false },
];

export interface AppearancePreviewState {
  /** Open tasks first, then completed ones, like My Day. */
  tasks: TaskRowTask[];
  onToggleDone: (taskId: string, done: boolean) => void;
  onToggleImportant: (taskId: string) => void;
}

/** Sample tasks for the appearance preview. Checking off and starring them only changes the preview. */
export function useAppearancePreview(today: string): AppearancePreviewState {
  const intl = useIntl();
  const [state, setState] = useState(INITIAL_STATE);

  const details: Record<PreviewTaskId, Omit<TaskRowTask, "id" | "done" | "important">> = {
    "preview-1": {
      title: intl.formatMessage({
        description: "AppearancePreview - title of the first sample task",
        defaultMessage: "Plan the week ahead",
        id: "Em4ZOc",
      }),
      due: today,
      remindAt: null,
      tags: [],
      links: [],
      contextName: "",
      contextColor: "blue",
    },
    "preview-2": {
      title: intl.formatMessage({
        description: "AppearancePreview - title of the second sample task",
        defaultMessage: "Call the dentist",
        id: "QJ01N6",
      }),
      due: null,
      remindAt: `${today}T14:00`,
      tags: [],
      links: [],
      hasNotes: true,
      contextName: "",
      contextColor: "blue",
    },
    "preview-3": {
      title: intl.formatMessage({
        description: "AppearancePreview - title of the completed sample task",
        defaultMessage: "Water the plants",
        id: "fVwENP",
      }),
      due: null,
      remindAt: null,
      tags: [],
      links: [],
      contextName: "",
      contextColor: "blue",
    },
  };

  const tasks = state
    .map((task): TaskRowTask => ({ ...details[task.id], ...task }))
    .sort((a, b) => Number(a.done) - Number(b.done));

  return {
    tasks,
    onToggleDone: (taskId, done) =>
      setState((current) => current.map((task) => (task.id === taskId ? { ...task, done } : task))),
    onToggleImportant: (taskId) =>
      setState((current) =>
        current.map((task) => (task.id === taskId ? { ...task, important: !task.important } : task))
      ),
  };
}
