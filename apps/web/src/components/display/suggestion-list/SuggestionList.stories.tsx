import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor } from "storybook/test";
import { SuggestionList as Component } from "./SuggestionList";
import type { SuggestionListProps as Props } from "./SuggestionList";

const meta: Meta<typeof Component> = {
  component: Component,
  title: "Display/Suggestion List",
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="ctx-blue bg-surface w-[340px] p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultArgs = {
  today: "2026-10-21",
  dueCount: 3,
  groups: [
    {
      reason: "overdue",
      total: 2,
      items: [
        { id: "p3", title: "Adele Guldpeng", contextColor: "blue", due: "2026-08-28", tags: ["familj", "barn"] },
        { id: "p4", title: "Byt munstycke tandborste", contextColor: "blue", due: "2026-10-20", tags: ["hem"] },
      ],
    },
    {
      reason: "due_today",
      total: 1,
      items: [{ id: "p5", title: "Köp: Kattmat och sand", contextColor: "blue", due: "2026-10-21", tags: ["köp"] }],
    },
    {
      reason: "left_from_yesterday",
      total: 1,
      items: [{ id: "p6", title: "Hem: fixa knarrande dörr", contextColor: "blue", due: null, tags: ["hem"] }],
    },
  ],
  onAdd: fn(),
  onAddAllDue: fn(),
} satisfies Props;

export const Default: Story = {
  args: defaultArgs,
};

export const Empty: Story = {
  args: { ...defaultArgs, groups: [], dueCount: 0 },
};

export const AddSuggestion: Story = {
  args: defaultArgs,
  play: async ({ args, canvas, userEvent }) => {
    const add = canvas.getByRole("button", { name: "Add Adele Guldpeng to My Day" });
    await userEvent.click(add);
    // The card slides out of the panel before the task is added.
    await expect(args.onAdd).not.toHaveBeenCalled();
    await expect(add.closest(".slab-leave")).toHaveClass("slab-leaving");
    await waitFor(() => expect(args.onAdd).toHaveBeenCalledWith("p3", "overdue"));

    await userEvent.click(canvas.getByTestId("suggestion-list__add-all-due"));
    await waitFor(() => expect(args.onAddAllDue).toHaveBeenCalled());
  },
};
