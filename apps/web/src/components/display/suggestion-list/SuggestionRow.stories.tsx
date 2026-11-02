import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { SuggestionRow as Component } from "./SuggestionRow";

const meta: Meta<typeof Component> = {
  component: Component,
  title: "Display/Suggestion List/Suggestion Row",
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="ctx-blue bg-surface w-[340px] p-4">
        <Story />
      </div>
    ),
  ],
  args: {
    item: {
      id: "p5",
      title: "Köp: Kaffe och filter",
      contextColor: "blue",
      contextName: "Personal",
      important: false,
      tags: ["köp"],
      reason: "due_today",
      why: { type: "due_today" },
      kinds: ["soon"],
    },
    isLeaving: false,
    onAdd: fn(),
    onSnooze: fn(),
    onOpen: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Add Köp: Kaffe och filter to My Day" }));
    await expect(args.onAdd).toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("button", { name: "Edit task: Köp: Kaffe och filter" }));
    await expect(args.onOpen).toHaveBeenCalled();
  },
};

export const Important: Story = {
  args: {
    item: {
      id: "p4",
      title: "Byt munstycke tandborste",
      contextColor: "blue",
      contextName: "Personal",
      important: true,
      tags: [],
      reason: "overdue",
      why: { type: "overdue", days: 3 },
      kinds: ["overdue", "important"],
    },
  },
};

export const Leaving: Story = {
  args: { isLeaving: true },
};
