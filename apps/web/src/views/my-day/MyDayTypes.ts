import type { ContextSwitcherOption } from "~/components/actions/context-switcher/ContextSwitcher";
import type { SuggestionListGroup } from "~/components/display/suggestion-list/SuggestionList";
import type { TaskRowTask } from "~/components/display/task-row/TaskRow";
import type { TaskDropPosition } from "~/components/display/task-row/UseTaskReorder";
import type { QuickAddPreview } from "~/components/input/quick-add/QuickAddInput";
import type {
  TaskEditorContextOption,
  TaskEditorPatch,
  TaskEditorTask,
} from "~/components/input/task-editor/TaskEditor";
import type { ContextColor } from "~/core/contexts/KlartContext";
import type { SyncStatus } from "~/core/sync/SyncAtoms";
import type { SuggestionReason } from "~/core/tasks/Day";
import type { DisplayOptions } from "~/core/tasks/DisplayOptions";
import type { SmartView } from "~/core/tasks/KlartAtoms";

export interface MyDayTask extends TaskRowTask {
  isInMyDay: boolean;
}

export interface MyDayContextProps {
  options: ContextSwitcherOption[];
  selectedId: string;
  selectedName: string;
  selectedColor: ContextColor | "all";
  onSelect: (id: string) => void;
  onManage: () => void;
}

export interface MyDaySmartViewItem {
  id: SmartView;
  count: number;
}

export interface MyDayTagItem {
  tag: string;
  count: number;
}

export interface MyDayTaskActions {
  onToggleDone: (taskId: string, done: boolean) => void;
  onToggleImportant: (taskId: string) => void;
  onAddToMyDay: (taskId: string) => void;
  onRemoveFromMyDay: (taskId: string) => void;
  onArchive: (taskId: string) => void;
  /** Opens the task in the editor. */
  onOpen: (taskId: string) => void;
  /** Reorders My Day: puts a task just before or after another one. */
  onMoveInMyDay: (taskId: string, targetId: string, position: TaskDropPosition) => void;
}

export interface MyDayTaskEditorProps {
  /** The task being edited, or `null` when the editor is closed. */
  task: TaskEditorTask | null;
  contexts: TaskEditorContextOption[];
  onChange: (patch: TaskEditorPatch) => void;
  onToggleDone: () => void;
  onToggleImportant: () => void;
  onToggleMyDay: () => void;
  onArchive: () => void;
  onClose: () => void;
}

export interface MyDayQuickAddProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  preview: QuickAddPreview | null;
}

export interface MyDaySuggestionsProps {
  groups: SuggestionListGroup[];
  count: number;
  dueCount: number;
  isOpen: boolean;
  onToggle: () => void;
  onAdd: (taskId: string, reason: SuggestionReason) => void;
  onAddAllDue: () => void;
}

export interface MyDaySidebarProps {
  context: MyDayContextProps;
  search: { value: string; onChange: (value: string) => void; focusRequest?: number; tags?: string[] };
  smartViews: { items: MyDaySmartViewItem[]; active: SmartView; onSelect: (view: SmartView) => void };
  tags: { items: MyDayTagItem[]; active: string | null; onSelect: (tag: string | null) => void };
  sync: { status: SyncStatus; onPress: () => void };
}

export interface MyDayDisplayProps {
  options: DisplayOptions;
  onChange: (options: DisplayOptions) => void;
}

export interface MyDaySidebarCollapseProps {
  isCollapsed: boolean;
  onToggle: () => void;
  /** Expands the sidebar and focuses its search field. */
  onSearch: () => void;
}
