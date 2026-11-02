import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor, within } from "storybook/test";
import { SuggestionList as Component } from "./SuggestionList";
import type { SuggestionItem, SuggestionListProps as Props } from "./SuggestionList";

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

function item(id: string, title: string, patch: Partial<SuggestionItem>): SuggestionItem {
  return {
    id,
    title,
    contextColor: "blue",
    contextName: "Personal",
    important: false,
    tags: [],
    reason: "recently_added",
    why: { type: "no_date" },
    kinds: [],
    ...patch,
  };
}

const items = [
  item("p4", "Byt munstycke tandborste", {
    reason: "overdue",
    why: { type: "overdue", days: 3 },
    kinds: ["overdue", "important"],
    important: true,
    tags: ["hem"],
  }),
  item("p5", "Köp: Kaffe och filter", {
    reason: "due_today",
    why: { type: "due_today" },
    kinds: ["soon"],
    tags: ["köp"],
  }),
  item("p6", "Hem: fixa knarrande dörr", {
    reason: "left_from_yesterday",
    why: { type: "left_from_yesterday" },
    kinds: ["soon"],
    tags: ["hem"],
  }),
  item("p3", "Vattna blommorna", {
    reason: "overdue",
    why: { type: "stale", days: 54 },
    kinds: ["overdue"],
    tags: ["hem"],
  }),
  item("p7", "Boka tandläkare", { reason: "coming_up", why: { type: "due_in", days: 2 }, kinds: ["soon"] }),
  item("p8", "Rensa garaget", {
    reason: "related_to_today",
    why: { type: "goes_with_today", tag: "hem" },
    kinds: ["related"],
    tags: ["hem"],
  }),
  item("p9", "Läs boken", {}),
];

const defaultArgs = {
  items,
  urgentCount: 2,
  dueCount: 3,
  snoozedCount: 0,
  onAdd: fn(),
  onAddAllDue: fn(),
  onSnooze: fn(),
  onUndoSnooze: fn(),
} satisfies Props;

export const Default: Story = {
  args: defaultArgs,
};

export const Empty: Story = {
  args: { ...defaultArgs, items: [], urgentCount: 0, dueCount: 0 },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/All caught up/)).toBeVisible();
    await expect(canvas.queryByTestId("suggestion-list__add-all-due")).toBeNull();
  },
};

export const Snoozed: Story = {
  args: { ...defaultArgs, snoozedCount: 2 },
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByText("2 hidden until tomorrow")).toBeVisible();
    await userEvent.click(canvas.getByTestId("suggestion-list__undo-snooze"));
    await expect(args.onUndoSnooze).toHaveBeenCalled();
  },
};

export const AddSuggestion: Story = {
  args: defaultArgs,
  play: async ({ args, canvas, userEvent }) => {
    const add = canvas.getByTestId("suggestion-list__top-pick-add");
    await userEvent.click(add);
    // The card slides out of the panel before the task is added.
    await expect(args.onAdd).not.toHaveBeenCalled();
    await expect(add.closest(".slab-leave")).toHaveClass("slab-leaving");
    await waitFor(() => expect(args.onAdd).toHaveBeenCalledWith("p4", "overdue"));

    await userEvent.click(canvas.getByRole("button", { name: "Add Köp: Kaffe och filter to My Day" }));
    await waitFor(() => expect(args.onAdd).toHaveBeenCalledWith("p5", "due_today"));

    await userEvent.click(canvas.getByTestId("suggestion-list__add-all-due"));
    await waitFor(() => expect(args.onAddAllDue).toHaveBeenCalled());
  },
};

export const SnoozeSuggestion: Story = {
  args: defaultArgs,
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByTestId("suggestion-list__top-pick-snooze"));
    await expect(args.onSnooze).toHaveBeenCalledWith("p4");

    await userEvent.click(canvas.getByRole("button", { name: "Not today: Köp: Kaffe och filter" }));
    await expect(args.onSnooze).toHaveBeenCalledWith("p5");
  },
};

export const FilterAndFind: Story = {
  args: defaultArgs,
  play: async ({ canvas, userEvent }) => {
    const topPick = canvas.getByRole("article", { name: "Top pick" });
    await expect(within(topPick).getByText("Byt munstycke tandborste")).toBeVisible();
    await expect(canvas.queryByText("Läs boken")).toBeNull();

    // A filter drops the top pick and lists everything of that kind.
    await userEvent.click(canvas.getByTestId("suggestion-list__filter-overdue"));
    await expect(canvas.queryByRole("article", { name: "Top pick" })).toBeNull();
    await expect(canvas.getByText("Overdue 54 days, still relevant?")).toBeVisible();
    await expect(canvas.queryByText("Köp: Kaffe och filter")).toBeNull();

    await userEvent.click(canvas.getByTestId("suggestion-list__toggle-search"));
    const search = canvas.getByRole("searchbox", { name: "Find a task to add" });
    await userEvent.type(search, "#köp");
    await expect(canvas.getByText("Matches")).toBeVisible();
    await expect(canvas.getByText("Köp: Kaffe och filter")).toBeVisible();

    await userEvent.clear(search);
    await userEvent.type(search, "xyz");
    await expect(canvas.getByText('No open task matches "xyz".')).toBeVisible();
  },
};

export const ShowMore: Story = {
  args: defaultArgs,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByTestId("suggestion-list__more"));
    await expect(canvas.getByText("Läs boken")).toBeVisible();
    await userEvent.click(canvas.getByTestId("suggestion-list__fewer"));
    await expect(canvas.queryByText("Läs boken")).toBeNull();
  },
};
