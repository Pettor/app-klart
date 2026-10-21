import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import type { MyDayTask } from "./MyDayTypes";
import { MyDayView as Component } from "./MyDayView";
import type { MyDayViewProps as Props } from "./MyDayView";
import { ALL_CONTEXTS, findContext } from "~/core/contexts/KlartContext";
import { buildTodayView } from "~/core/tasks/AgentViews";
import { addDays } from "~/core/tasks/LocalDate";
import { buildSuggestions, selectDueSuggestions } from "~/core/tasks/Suggestions";
import type { Task } from "~/core/tasks/Task";
import { DEMO_DATA, DEMO_TODAY } from "~/storybook/data/KlartDemoData";

const inToday = new Set(DEMO_DATA.days[DEMO_TODAY]!.items.map((item) => item.taskId));

function toRow(task: Task): MyDayTask {
  const context = findContext(DEMO_DATA.contexts, task.context)!;
  return {
    id: task.id,
    title: task.title,
    done: task.status === "done",
    important: task.important,
    due: task.due,
    remindAt: task.remindAt,
    tags: task.tags.filter((tag) => tag !== context.tag),
    contextName: context.name,
    contextColor: context.color,
    isInMyDay: inToday.has(task.id),
  };
}

/** Builds view props from the design's sample data with the real ranking logic. */
function buildArgs(contextId: string): Props {
  const tasks = Object.values(DEMO_DATA.tasks).filter(
    (task) => contextId === ALL_CONTEXTS || task.context === contextId
  );
  const dayTasks = DEMO_DATA.days[DEMO_TODAY]!.items.flatMap((item) => tasks.filter((task) => task.id === item.taskId));
  const groups = buildSuggestions({
    tasks,
    today: DEMO_TODAY,
    todayDay: DEMO_DATA.days[DEMO_TODAY],
    yesterdayDay: DEMO_DATA.days[addDays(DEMO_TODAY, -1)],
    contextTags: DEMO_DATA.contexts.map((context) => context.tag),
  });
  const selected = findContext(DEMO_DATA.contexts, contextId);
  const open = tasks.filter((task) => task.status === "open");
  const tagCounts = new Map<string, number>();
  open.forEach((task) => task.tags.forEach((tag) => tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)));

  return {
    today: DEMO_TODAY,
    context: {
      options: [
        { id: ALL_CONTEXTS, name: "All contexts", color: "all", dayCount: 3, shortcut: "0" },
        ...DEMO_DATA.contexts.map((context, index) => ({
          id: context.id,
          name: context.name,
          color: context.color,
          dayCount: 1,
          shortcut: String(index + 1),
        })),
      ],
      selectedId: contextId,
      selectedName: selected?.name ?? "All contexts",
      selectedColor: selected?.color ?? "all",
      onSelect: fn(),
      onManage: fn(),
    },
    search: { value: "", onChange: fn() },
    smartViews: {
      items: [
        { id: "day", count: dayTasks.filter((task) => task.status === "open").length },
        { id: "important", count: open.filter((task) => task.important).length },
        { id: "planned", count: open.filter((task) => task.due).length },
        { id: "tasks", count: open.length },
      ],
      active: "day",
      onSelect: fn(),
    },
    tags: {
      items: [...tagCounts.entries()].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count),
      active: null,
      onSelect: fn(),
    },
    sync: {
      status: { state: "synced", method: "folder", folderName: "OneDrive/Klart", lastSyncedAt: "2026-10-21T09:58:00Z" },
      onPress: fn(),
    },
    tasks: dayTasks.filter((task) => task.status === "open").map(toRow),
    doneTasks: dayTasks.filter((task) => task.status === "done").map(toRow),
    showContextOnTasks: contextId === ALL_CONTEXTS,
    taskActions: {
      onToggleDone: fn(),
      onToggleImportant: fn(),
      onAddToMyDay: fn(),
      onRemoveFromMyDay: fn(),
      onArchive: fn(),
    },
    quickAdd: { value: "", onChange: fn(), onSubmit: fn(), preview: null },
    suggestions: {
      groups: groups.map((group) => ({
        reason: group.reason,
        total: group.tasks.length,
        items: group.tasks.map((task) => {
          const row = toRow(task);
          return { id: row.id, title: row.title, contextColor: row.contextColor, due: row.due, tags: row.tags };
        }),
      })),
      count: groups.reduce((sum, group) => sum + group.tasks.length, 0),
      dueCount: selectDueSuggestions(groups).length,
      isOpen: true,
      onToggle: fn(),
      onAdd: fn(),
      onAddAllDue: fn(),
    },
    agentJson: {
      isOpen: false,
      onToggle: fn(),
      json: JSON.stringify(buildTodayView(DEMO_DATA, DEMO_TODAY, "2026-10-21T10:00:00Z"), null, 2),
    },
    onOpenSettings: fn(),
    onOpenNotifications: fn(),
  };
}

const meta: Meta<typeof Component> = {
  component: Component,
  title: "Views/My Day",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Personal: Story = {
  args: buildArgs("personal"),
  parameters: { viewport: { value: "full" } },
};

export const Work: Story = {
  args: buildArgs("work"),
};

export const AllContexts: Story = {
  args: buildArgs(ALL_CONTEXTS),
};

export const WithAgentJson: Story = {
  args: { ...buildArgs("work"), agentJson: { ...buildArgs("work").agentJson, isOpen: true } },
};

export const WithQuickAddPreview: Story = {
  args: {
    ...buildArgs("personal"),
    quickAdd: {
      value: "#work #acme @fri ^09:00 ! prepare sprint planning",
      onChange: fn(),
      onSubmit: fn(),
      preview: {
        title: "Prepare sprint planning",
        contextName: "Work",
        contextColor: "orange",
        due: "2026-10-23",
        remindAt: "2026-10-23T09:00",
        important: true,
        tags: ["acme"],
      },
    },
  },
};

export const Empty: Story = {
  args: {
    ...buildArgs("personal"),
    tasks: [],
    doneTasks: [],
    suggestions: { ...buildArgs("personal").suggestions, groups: [], count: 0, dueCount: 0 },
  },
};

export const Phone: Story = {
  args: { ...buildArgs("personal"), suggestions: { ...buildArgs("personal").suggestions, isOpen: false } },
  globals: { viewport: { value: "iphonex" } },
};

export const CompleteFromMyDay: Story = {
  // Closed so the bottom sheet doesn't cover the list at narrow test viewports.
  args: { ...buildArgs("personal"), suggestions: { ...buildArgs("personal").suggestions, isOpen: false } },
  play: async ({ args, canvas, userEvent }) => {
    const [firstToggle] = canvas.getAllByTestId("task-row__toggle");
    await userEvent.click(firstToggle!);
    await expect(args.taskActions.onToggleDone).toHaveBeenCalledWith("p8", true);
  },
};
