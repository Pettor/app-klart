import { ContainerDecorator } from "@package/storybook";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { KlartMark as Component } from "./KlartMark";

const meta: Meta<typeof Component> = {
  component: Component,
  title: "Display/Klart Mark",
  tags: ["autodocs"],
  decorators: [ContainerDecorator],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Sidebar: Story = {
  args: { size: 28 },
};

export const Large: Story = {
  args: { size: 128, labelled: true },
};

export const Outlined: Story = {
  args: { size: 64, outlined: true },
};
