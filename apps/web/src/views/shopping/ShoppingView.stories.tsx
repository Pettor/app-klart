import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";
import type { ShoppingItemGroup, ShoppingSelectedList } from "./ShoppingTypes";
import { ShoppingView as Component } from "./ShoppingView";
import type { ShoppingViewProps as Props } from "./ShoppingView";
import { SHOPPING_CATEGORIES } from "~/core/shopping/ShoppingCategory";
import type { ShoppingItem, ShoppingList } from "~/core/shopping/ShoppingList";
import { itemTotal, SHOPPING_KIND_COLORS } from "~/core/shopping/ShoppingList";
import { DEMO_SHOPPING, DEMO_TODAY } from "~/storybook/data/KlartDemoData";

const meta: Meta<typeof Component> = {
  component: Component,
  title: "Views/Shopping",
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof meta>;

const lists = Object.values(DEMO_SHOPPING.lists);
const inToday = new Set(Object.keys(DEMO_SHOPPING.tasks));

/** Under "All contexts" each list shows its context; the demo splits them between Personal and Work. */
function demoContext(list: ShoppingList): Props["openLists"][number]["context"] {
  return list.kind === "home" ? { name: "Work", color: "orange" } : { name: "Personal", color: "blue" };
}

function toCard(list: ShoppingList, isAllContexts = false): Props["openLists"][number] {
  return {
    id: list.id,
    name: list.name,
    kind: list.kind,
    color: SHOPPING_KIND_COLORS[list.kind],
    date: list.date,
    total: list.items.length,
    bought: list.items.filter((item) => item.bought).length,
    isCompleted: !!list.completedAt,
    context: isAllContexts ? demoContext(list) : null,
  };
}

function toRow(item: ShoppingItem): ShoppingItemGroup["items"][number] {
  return {
    id: item.id,
    name: item.name,
    qty: item.qty,
    total: itemTotal(item),
    link: item.link,
    note: item.note,
    bought: item.bought,
    important: item.important,
    isInMyDay: !!item.taskId && inToday.has(item.taskId),
  };
}

function toSelected(list: ShoppingList, isAllContexts = false): ShoppingSelectedList {
  const left = list.items.filter((item) => !item.bought);
  const groups: ShoppingItemGroup[] =
    list.kind === "grocery"
      ? SHOPPING_CATEGORIES.map((category) => ({
          category,
          items: left.filter((item) => item.category === category).map(toRow),
        })).filter((group) => group.items.length > 0)
      : [{ category: null, items: left.map(toRow) }];
  const totals = list.items.map(itemTotal).filter((total) => total !== null);
  return {
    ...toCard(list, isAllContexts),
    completedAt: list.completedAt,
    sum: totals.length ? totals.reduce((sum, total) => sum + total, 0) : null,
    groups,
    boughtItems: list.items.filter((item) => item.bought).map(toRow),
  };
}

function buildArgs(listIndex: number, isAllContexts = false): Props {
  return {
    today: DEMO_TODAY,
    openLists: lists.filter((list) => !list.completedAt).map((list) => toCard(list, isAllContexts)),
    doneLists: lists.filter((list) => list.completedAt).map((list) => toCard(list, isAllContexts)),
    selected: toSelected(lists[listIndex]!, isAllContexts),
    isListShownOnPhone: true,
    onSelectList: fn(),
    onBackToLists: fn(),
    newList: { onCreate: fn() },
    draft: { value: "", onChange: fn(), onSubmit: fn(), preview: null },
    moveTargets: lists.filter((list, index) => index !== listIndex && !list.completedAt),
    listActions: {
      onToggleBought: fn(),
      onToggleImportant: fn(),
      onToggleItemMyDay: fn(),
      onRemoveItem: fn(),
      onComplete: fn(),
      onReopen: fn(),
      onRename: fn(),
      onDelete: fn(),
    },
  };
}

export const Groceries: Story = {
  args: buildArgs(0),
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId("shopping__list-name")).toHaveTextContent("Veckohandling");
    await expect(canvas.getByRole("heading", { name: "Dairy" })).toBeVisible();
  },
};

/** One context selected: every list is in it, so none shows its context. */
export const OneContext: Story = {
  args: buildArgs(0),
  play: async ({ canvas }) => {
    await expect(canvas.queryByTestId("shopping__list-context")).toBeNull();
    await expect(canvas.queryAllByTestId("shopping-list-card__context")).toHaveLength(0);
  },
};

/** "All contexts": each list shows which context it belongs to, in the lists column and the list's header. */
export const AllContexts: Story = {
  args: buildArgs(0, true),
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId("shopping__list-context")).toHaveTextContent("Personal");
    const labels = canvas.getAllByTestId("shopping-list-card__context").map((label) => label.textContent);
    await expect(labels).toContain("Personal");
    await expect(labels).toContain("Work");
  },
};

export const Gifts: Story = {
  args: buildArgs(1),
};

export const Typing: Story = {
  args: {
    ...buildArgs(0),
    draft: {
      value: "2x mjölk 25 kr",
      onChange: fn(),
      onSubmit: fn(),
      preview: { name: "mjölk", qty: 2, price: 25, linkHost: null, category: "dairy" },
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId("shopping__item-preview")).toHaveTextContent("to Dairy");
  },
};

export const CompleteWithItemsLeft: Story = {
  args: buildArgs(0),
  play: async ({ canvas, args }) => {
    canvas.getByTestId("shopping__complete-list").click();
    await waitFor(() => expect(canvas.getByTestId("shopping__complete-dialog")).toBeVisible());
    canvas.getByTestId("shopping__complete-anyway").click();
    await expect(args.listActions.onComplete).toHaveBeenCalledWith(null);
  },
};

export const Rename: Story = {
  args: buildArgs(0),
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByTestId("shopping__list-menu"));
    await userEvent.click(await screen.findByTestId("shopping__rename-list"));
    const input = await canvas.findByTestId("shopping__rename-input");
    await expect(input).toHaveValue("Veckohandling");
    await userEvent.clear(input);
    await userEvent.type(input, "Helgen{Enter}");
    await expect(args.listActions.onRename).toHaveBeenCalledWith("Helgen");
    await expect(canvas.getByTestId("shopping__list-name")).toBeVisible();
  },
};

export const Delete: Story = {
  args: buildArgs(0),
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByTestId("shopping__list-menu"));
    await userEvent.click(await screen.findByTestId("shopping__delete-list"));
    await waitFor(() => expect(canvas.getByTestId("shopping__delete-dialog")).toBeVisible());
    await expect(canvas.getByTestId("shopping__delete-dialog")).toHaveTextContent("Delete “Veckohandling”?");
    await userEvent.click(canvas.getByTestId("shopping__delete-confirm"));
    await expect(args.listActions.onDelete).toHaveBeenCalled();
  },
};

export const CompletedList: Story = {
  args: buildArgs(3),
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId("shopping__reopen-list")).toBeVisible();
  },
};

export const Empty: Story = {
  args: { ...buildArgs(0), openLists: [], doneLists: [], selected: null },
};
