import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { SuggestionTopPick as Component } from "./SuggestionTopPick";

const meta: Meta<typeof Component> = {
  component: Component,
  title: "Display/Suggestion List/Suggestion Top Pick",
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
      id: "p4",
      title: "Byt munstycke tandborste",
      contextColor: "blue",
      contextName: "Personal",
      important: true,
      tags: ["hem"],
      reason: "overdue",
      why: { type: "overdue", days: 3 },
      kinds: ["overdue", "important"],
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
    await userEvent.click(canvas.getByRole("button", { name: "Add to My Day" }));
    await expect(args.onAdd).toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("button", { name: "Not today" }));
    await expect(args.onSnooze).toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("button", { name: "Edit task: Byt munstycke tandborste" }));
    await expect(args.onOpen).toHaveBeenCalled();
  },
};

export const Stale: Story = {
  args: {
    item: {
      id: "p3",
      title: "Vattna blommorna",
      contextColor: "blue",
      contextName: "Personal",
      important: false,
      tags: [],
      reason: "overdue",
      why: { type: "stale", days: 65 },
      kinds: ["overdue"],
    },
  },
};
