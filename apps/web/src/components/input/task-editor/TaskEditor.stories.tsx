import { ContainerDecorator } from "@package/storybook";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { TaskEditor as Component } from "./TaskEditor";
import type { TaskEditorProps as Props } from "./TaskEditor";
import { DEFAULT_CONTEXTS } from "~/core/contexts/KlartContext";

const meta: Meta<typeof Component> = {
  component: Component,
  title: "Input/Task Editor",
  tags: ["autodocs"],
  decorators: [ContainerDecorator],
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultArgs = {
  task: {
    id: "w1",
    title: "Review sync PR for gateway client",
    done: false,
    important: false,
    due: "2026-10-21",
    remindAt: "2026-10-21T14:00",
    tags: ["acme", "review"],
    links: ["https://github.com/acme/gateway-client/pull/412"],
    notes: "",
    contextId: "work",
    contextColor: "orange",
    isInMyDay: true,
    file: "tasks/work/w1.json",
  },
  contexts: DEFAULT_CONTEXTS.map((context) => ({ id: context.id, name: context.name, color: context.color })),
  onChange: fn(),
  onToggleDone: fn(),
  onToggleImportant: fn(),
  onToggleMyDay: fn(),
  onArchive: fn(),
  onClose: fn(),
} satisfies Props;

export const Default: Story = {
  args: defaultArgs,
};

export const Important: Story = {
  args: { ...defaultArgs, task: { ...defaultArgs.task, important: true, notes: "Check the retry logic first." } },
};

export const Completed: Story = {
  args: { ...defaultArgs, task: { ...defaultArgs.task, done: true } },
};

export const NotInMyDay: Story = {
  args: { ...defaultArgs, task: { ...defaultArgs.task, isInMyDay: false, due: null, remindAt: null, links: [] } },
};

export const EditTitle: Story = {
  args: defaultArgs,
  play: async ({ args, canvas, userEvent }) => {
    const title = canvas.getByTestId("task-editor__title");
    await userEvent.clear(title);
    await userEvent.type(title, "Review and merge sync PR{Enter}");
    await expect(args.onChange).toHaveBeenCalledWith({ title: "Review and merge sync PR" });
  },
};

export const EmptyTitleReverts: Story = {
  args: defaultArgs,
  play: async ({ args, canvas, userEvent }) => {
    const title = canvas.getByTestId("task-editor__title");
    await userEvent.clear(title);
    await userEvent.tab();
    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(title).toHaveValue(defaultArgs.task.title);
  },
};

export const EditTags: Story = {
  args: defaultArgs,
  play: async ({ args, canvas, userEvent }) => {
    const tags = canvas.getByTestId("task-editor__tags");
    await userEvent.clear(tags);
    await userEvent.type(tags, "#Acme, team{Enter}");
    await expect(args.onChange).toHaveBeenCalledWith({ tags: ["acme", "team"] });
    await expect(tags).toHaveValue("#acme #team");
  },
};

export const AddLink: Story = {
  args: defaultArgs,
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByTestId("task-editor__new-link");
    await userEvent.type(input, "not a link{Enter}");
    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(canvas.getByText("Links must start with http://, https:// or www.")).toBeVisible();

    await userEvent.clear(input);
    await userEvent.type(input, "https://notion.so/spec{Enter}");
    await expect(args.onChange).toHaveBeenCalledWith({
      links: ["https://github.com/acme/gateway-client/pull/412", "https://notion.so/spec"],
    });
  },
};

export const ToggleActions: Story = {
  args: defaultArgs,
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByTestId("task-editor__toggle"));
    await expect(args.onToggleDone).toHaveBeenCalled();
    await userEvent.click(canvas.getByTestId("task-editor__important"));
    await expect(args.onToggleImportant).toHaveBeenCalled();
    await userEvent.click(canvas.getByTestId("task-editor__my-day"));
    await expect(args.onToggleMyDay).toHaveBeenCalled();
    await userEvent.click(canvas.getByTestId("task-editor__archive"));
    await expect(args.onArchive).toHaveBeenCalled();
    await userEvent.click(canvas.getByTestId("task-editor__close"));
    await expect(args.onClose).toHaveBeenCalled();
  },
};
