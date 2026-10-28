import { ContainerDecorator } from "@package/storybook";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor } from "storybook/test";
import { ShoppingItemRow as Component } from "./ShoppingItemRow";
import type { ShoppingItemRowProps as Props } from "./ShoppingItemRow";

const meta: Meta<typeof Component> = {
  component: Component,
  title: "Display/Shopping Item Row",
  tags: ["autodocs"],
  decorators: [ContainerDecorator],
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultArgs = {
  item: {
    id: "i1",
    name: "Mjölk",
    qty: 2,
    total: null,
    link: null,
    note: "",
    bought: false,
    important: false,
    isInMyDay: false,
  },
  onToggleBought: fn(),
  onToggleImportant: fn(),
  onToggleMyDay: fn(),
  onRemove: fn(),
} satisfies Props;

export const Default: Story = {
  args: defaultArgs,
  play: async ({ canvas, args }) => {
    await expect(canvas.getByText("× 2")).toBeVisible();
    canvas.getByTestId("shopping-item__my-day").click();
    await expect(args.onToggleMyDay).toHaveBeenCalledWith("i1");
  },
};

export const InMyDay: Story = {
  args: {
    ...defaultArgs,
    item: { ...defaultArgs.item, name: "Kaffe och filter", qty: null, important: true, isInMyDay: true },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId("shopping-item__my-day")).toHaveAccessibleName("In My Day, press to remove");
  },
};

export const WithPriceAndLink: Story = {
  args: {
    ...defaultArgs,
    item: {
      ...defaultArgs.item,
      name: "Brädspel",
      qty: null,
      total: 499,
      link: "https://example.com/",
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("499 kr")).toBeVisible();
    await expect(canvas.getByTestId("shopping-item__link")).toHaveAccessibleName("Open Brädspel on example.com");
  },
};

export const Bought: Story = {
  args: { ...defaultArgs, item: { ...defaultArgs.item, bought: true } },
};

export const CheckOff: Story = {
  args: defaultArgs,
  play: async ({ canvas, args }) => {
    canvas.getByTestId("shopping-item__toggle").click();
    await waitFor(() => expect(args.onToggleBought).toHaveBeenCalledWith("i1", true), { timeout: 2000 });
  },
};
