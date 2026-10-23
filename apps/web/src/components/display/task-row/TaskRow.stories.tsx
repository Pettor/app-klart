import { ContainerDecorator } from "@package/storybook";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor, within } from "storybook/test";
import { TaskRow as Component } from "./TaskRow";
import type { TaskRowProps as Props } from "./TaskRow";

const meta: Meta<typeof Component> = {
  component: Component,
  title: "Display/Task Row",
  tags: ["autodocs"],
  decorators: [ContainerDecorator],
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultArgs = {
  today: "2026-10-21",
  isInMyDay: true,
  task: {
    id: "w1",
    title: "Review sync PR for gateway client",
    done: false,
    important: false,
    due: "2026-10-21",
    remindAt: "2026-10-21T14:00",
    tags: ["acme", "review"],
    links: [],
    contextName: "Work",
    contextColor: "orange",
  },
  onToggleDone: fn(),
  onToggleImportant: fn(),
  onRemoveFromMyDay: fn(),
  onArchive: fn(),
} satisfies Props;

export const Default: Story = {
  args: defaultArgs,
};

export const Overdue: Story = {
  args: {
    ...defaultArgs,
    task: { ...defaultArgs.task, title: "Adele Guldpeng", due: "2026-08-28", remindAt: null, tags: ["familj"] },
  },
};

export const Important: Story = {
  args: { ...defaultArgs, task: { ...defaultArgs.task, important: true } },
};

export const WithLink: Story = {
  args: {
    ...defaultArgs,
    task: { ...defaultArgs.task, links: ["https://github.com/acme/gateway-client/pull/412"] },
  },
  play: async ({ canvas }) => {
    const link = canvas.getByTestId("task-row__link");
    await expect(link).toHaveAccessibleName("Open link to github.com");
    await expect(link).toHaveAttribute("href", "https://github.com/acme/gateway-client/pull/412");
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(canvas.queryByTestId("task-row__links")).toBeNull();
  },
};

/** Two or more links collapse into one button with their count, leaving the title room. */
export const WithManyLinks: Story = {
  args: {
    ...defaultArgs,
    task: {
      ...defaultArgs.task,
      title: "Review sync PR for gateway client and update the release notes before the Friday deploy",
      links: [
        "https://github.com/acme/gateway-client/pull/412",
        "https://www.notion.so/acme/Gateway-sync-spec-9f2c",
        "https://wiki.acme.dev/release-notes",
      ],
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.queryByTestId("task-row__link")).toBeNull();
    await expect(canvas.getByTestId("task-row__links")).toHaveAccessibleName("3 links");
  },
};

/** Tags are hidden until the row is hovered or focused, unless an ancestor has `slab-tags-on`. */
export const TagsShown: Story = {
  args: defaultArgs,
  decorators: [
    (Story) => (
      <div className="slab-tags-on">
        <Story />
      </div>
    ),
  ],
};

export const WithNote: Story = {
  args: { ...defaultArgs, task: { ...defaultArgs.task, hasNotes: true } },
};

/**
 * Draggable, from `useTaskReorder`: press the row and drag it with a mouse, or focus its title and press Alt with
 * arrow up or down. Touch screens show a grip instead.
 */
export const Reorderable: Story = {
  args: {
    ...defaultArgs,
    onOpen: fn(),
    reorder: {
      isLifted: false,
      offsetY: 0,
      dropIndicator: null,
      isSettled: false,
      rowProps: {
        onPointerDownCapture: fn(),
        onPointerMoveCapture: fn(),
        onPointerUpCapture: fn(),
        onPointerCancelCapture: fn(),
      },
      gripProps: { onPointerDownCapture: fn() },
      onGripKeyDown: fn(),
      onRowKeyDown: fn(),
      isDropping: () => false,
    },
  },
  play: async ({ args, canvas, userEvent }) => {
    canvas.getByTestId("task-row__open").focus();
    await userEvent.keyboard("{Alt>}{ArrowUp}{/Alt}");
    await expect(args.reorder!.onRowKeyDown).toHaveBeenCalled();
  },
};

/** The design's display options off: no dates, reminders or link buttons, just the title. */
export const Minimal: Story = {
  args: { ...defaultArgs, showMeta: false, showLinks: false },
  play: async ({ canvas }) => {
    await expect(canvas.queryByTestId("task-row__link")).toBeNull();
  },
};

export const DropIndicator: Story = {
  args: { ...Reorderable.args!, reorder: { ...Reorderable.args!.reorder!, dropIndicator: "before" } },
  decorators: [
    (Story) => (
      <div className="pt-4">
        <Story />
      </div>
    ),
  ],
};

export const WithContext: Story = {
  args: { ...defaultArgs, showContext: true },
};

export const Completed: Story = {
  args: { ...defaultArgs, task: { ...defaultArgs.task, done: true } },
};

export const NotInMyDay: Story = {
  args: { ...defaultArgs, isInMyDay: false, onAddToMyDay: fn() },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Add to My Day" }));
    await expect(args.onAddToMyDay).toHaveBeenCalledWith("w1");
  },
};

export const CompleteAndStar: Story = {
  args: defaultArgs,
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Complete task" }));
    // The box fills and the check draws first; the task is marked done once that has played.
    await expect(args.onToggleDone).not.toHaveBeenCalled();
    await expect(canvas.getByTestId("task-row")).toHaveClass("slab-checking");
    // Then the card sinks away and the list closes the gap.
    await waitFor(() => expect(canvas.getByTestId("task-row").closest(".slab-leave")).toHaveClass("slab-leaving"));
    await expect(args.onToggleDone).not.toHaveBeenCalled();
    await waitFor(() => expect(args.onToggleDone).toHaveBeenCalledWith("w1", true), { timeout: 2000 });

    await userEvent.click(canvas.getByRole("button", { name: "Mark important" }));
    await expect(args.onToggleImportant).toHaveBeenCalledWith("w1");
  },
};

export const Selected: Story = {
  args: { ...defaultArgs, onOpen: fn(), isSelected: true },
};

export const OpenEditor: Story = {
  args: { ...defaultArgs, onOpen: fn() },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: `Edit task: ${defaultArgs.task.title}` }));
    await expect(args.onOpen).toHaveBeenCalledWith("w1");
  },
};

/**
 * Phones: the title takes the width. Links, star and actions move to the details sheet, and one grey line under
 * the title shows the due date, reminder, link count, note and importance.
 */
export const Phone: Story = {
  args: {
    ...defaultArgs,
    onOpen: fn(),
    task: {
      ...defaultArgs.task,
      title: "Review sync PR for gateway client and update the release notes before the Friday deploy",
      important: true,
      hasNotes: true,
      links: ["https://github.com/acme/gateway-client/pull/412", "https://wiki.acme.dev/release-notes"],
    },
  },
  globals: { viewport: { value: "iphonex" } },
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.queryByTestId("task-row__link")).toBeNull();
    await expect(canvas.queryByTestId("task-row__links")).toBeNull();
    await expect(canvas.queryByTestId("task-row__important")).toBeNull();
    await expect(canvas.queryByRole("button", { name: "Task actions" })).toBeNull();

    const meta = canvas.getByTestId("task-row__meta");
    await expect(within(meta).getByRole("img", { name: "2 links" })).toBeInTheDocument();
    await expect(within(meta).getByRole("img", { name: "Has note" })).toBeInTheDocument();
    await expect(within(meta).getByRole("img", { name: "Important" })).toBeInTheDocument();

    await userEvent.click(canvas.getByTestId("task-row__open"));
    await expect(args.onOpen).toHaveBeenCalledWith("w1");
  },
};

/** With nothing under the title, a phone row is a single line. */
export const PhoneMinimal: Story = {
  args: {
    ...defaultArgs,
    task: { ...defaultArgs.task, due: null, remindAt: null, tags: [] },
  },
  globals: { viewport: { value: "iphonex" } },
  play: async ({ canvas }) => {
    await expect(canvas.queryByTestId("task-row__meta")).toBeNull();
  },
};
