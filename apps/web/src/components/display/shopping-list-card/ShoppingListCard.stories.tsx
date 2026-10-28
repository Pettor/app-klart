import { ContainerDecorator } from "@package/storybook";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { ShoppingListCard as Component } from "./ShoppingListCard";
import type { ShoppingListCardProps as Props } from "./ShoppingListCard";

const meta: Meta<typeof Component> = {
  component: Component,
  title: "Display/Shopping List Card",
  tags: ["autodocs"],
  decorators: [ContainerDecorator],
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultArgs = {
  today: "2026-10-28",
  list: {
    id: "l1",
    name: "Veckohandling",
    kind: "grocery",
    color: "green",
    date: null,
    total: 9,
    bought: 2,
    isCompleted: false,
  },
  onPress: fn(),
} satisfies Props;

export const Default: Story = {
  args: defaultArgs,
  play: async ({ canvas, args }) => {
    await expect(canvas.getByText("7 left")).toBeVisible();
    canvas.getByTestId("shopping-list-card").click();
    await expect(args.onPress).toHaveBeenCalledWith("l1");
  },
};

export const Selected: Story = {
  args: { ...defaultArgs, isSelected: true },
};

export const GiftWithDate: Story = {
  args: {
    ...defaultArgs,
    list: {
      ...defaultArgs.list,
      name: "Adeles födelsedag",
      kind: "gift",
      color: "pink",
      date: "2026-11-07",
      total: 4,
      bought: 1,
    },
  },
};

export const AllBought: Story = {
  args: { ...defaultArgs, list: { ...defaultArgs.list, bought: 9 } },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("All bought")).toBeVisible();
  },
};

export const Completed: Story = {
  args: { ...defaultArgs, list: { ...defaultArgs.list, name: "Fredagsmys", total: 4, bought: 3, isCompleted: true } },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("3 of 4 bought")).toBeVisible();
  },
};
