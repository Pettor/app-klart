import { ContainerDecorator } from "@package/storybook";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, screen, within } from "storybook/test";
import { TaskRepeatField as Component } from "./TaskRepeatField";
import type { TaskRepeatFieldProps as Props } from "./TaskRepeatField";

const meta: Meta<typeof Component> = {
  component: Component,
  title: "Input/Task Repeat Field",
  tags: ["autodocs"],
  decorators: [ContainerDecorator],
};

export default meta;
type Story = StoryObj<typeof meta>;

// 2026-10-21 is a Wednesday.
const defaultArgs = {
  repeat: null,
  due: "2026-10-21",
  today: "2026-10-21",
  onChange: fn(),
  // The weekday buttons take the task's context color.
  className: "ctx-orange",
} satisfies Props;

export const DoesNotRepeat: Story = {
  args: defaultArgs,
};

export const Weekly: Story = {
  args: { ...defaultArgs, repeat: { every: 1, unit: "week", weekdays: [3], from: "2026-10-21" } },
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId("task-repeat__summary")).toHaveTextContent("Every week on Wed");
    await expect(canvas.queryByTestId("task-repeat__custom")).not.toBeInTheDocument();
  },
};

export const Custom: Story = {
  args: { ...defaultArgs, repeat: { every: 2, unit: "week", weekdays: [1, 4], from: "2026-10-19" } },
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByTestId("task-repeat__summary")).toHaveTextContent("Every 2 weeks on Mon and Thu");
    await userEvent.click(canvas.getByTestId("task-repeat__weekday-5"));
    await expect(args.onChange).toHaveBeenCalledWith({
      repeat: { every: 2, unit: "week", weekdays: [1, 4, 5], from: "2026-10-19" },
    });
  },
};

export const Monthly: Story = {
  args: { ...defaultArgs, repeat: { every: 1, unit: "month", weekdays: [], from: "2026-10-31" } },
};

export const PickWeekly: Story = {
  args: defaultArgs,
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(within(canvas.getByTestId("task-repeat__preset")).getByRole("button"));
    await userEvent.click(await screen.findByRole("option", { name: "Weekly" }));
    await expect(args.onChange).toHaveBeenCalledWith({
      repeat: { every: 1, unit: "week", weekdays: [3], from: "2026-10-21" },
    });
  },
};

/** A task without a due date becomes due on the rule's first date. */
export const PickWeekdaysWithoutDueDate: Story = {
  // 2026-10-24 is a Saturday, so the first weekday is Monday the 26th.
  args: { ...defaultArgs, due: null, today: "2026-10-24" },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(within(canvas.getByTestId("task-repeat__preset")).getByRole("button"));
    await userEvent.click(await screen.findByRole("option", { name: "Weekdays" }));
    await expect(args.onChange).toHaveBeenCalledWith({
      repeat: { every: 1, unit: "week", weekdays: [1, 2, 3, 4, 5], from: "2026-10-26" },
      due: "2026-10-26",
    });
  },
};

export const StopRepeating: Story = {
  args: { ...defaultArgs, repeat: { every: 1, unit: "day", weekdays: [], from: "2026-10-21" } },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(within(canvas.getByTestId("task-repeat__preset")).getByRole("button"));
    await userEvent.click(await screen.findByRole("option", { name: "Doesn't repeat" }));
    await expect(args.onChange).toHaveBeenCalledWith({ repeat: null });
  },
};
