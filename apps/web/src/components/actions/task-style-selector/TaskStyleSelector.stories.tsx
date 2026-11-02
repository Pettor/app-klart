import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { TaskStyleSelector as Component } from "./TaskStyleSelector";
import type { TaskStyleSelectorProps as Props } from "./TaskStyleSelector";

const meta: Meta<typeof Component> = {
  component: Component,
  title: "Actions/Task Style Selector",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultArgs = {
  style: "theme",
  themeStyle: "raised",
  onSelect: fn(),
} satisfies Props;

export const ThemesOwn: Story = {
  args: defaultArgs,
};

export const Glow: Story = {
  args: { ...defaultArgs, style: "glow" },
};

export const Square: Story = {
  args: { ...defaultArgs, style: "square" },
};

export const SelectOutline: Story = {
  args: defaultArgs,
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByRole("radio", { name: "Theme's own" })).toBeChecked();
    await userEvent.click(canvas.getByRole("radio", { name: "Outline" }));
    await expect(args.onSelect).toHaveBeenCalledWith("outline");
  },
};

export const BackToThemesOwn: Story = {
  args: { ...defaultArgs, style: "flat" },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("radio", { name: "Theme's own" }));
    await expect(args.onSelect).toHaveBeenCalledWith("theme");
  },
};
