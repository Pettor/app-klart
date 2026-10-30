import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { ThemeSelector as Component } from "./ThemeSelector";
import type { ThemeSelectorProps as Props } from "./ThemeSelector";

const meta: Meta<typeof Component> = {
  component: Component,
  title: "Actions/Theme Selector",
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultArgs = {
  mode: "auto",
  onSelect: (mode) => console.log("Selected:", mode),
} satisfies Props;

export const Auto: Story = {
  args: defaultArgs,
};

export const Light: Story = {
  args: { ...defaultArgs, mode: "light" },
};

export const Dark: Story = {
  args: { ...defaultArgs, mode: "dark" },
};

export const SelectLight: Story = {
  args: defaultArgs,
  play: async ({ canvas, userEvent }) => {
    const lightOption = canvas.getByRole("radio", { name: "Light" });
    await expect(lightOption).toBeInTheDocument();
    await userEvent.click(lightOption);
  },
};

export const SelectDark: Story = {
  args: { ...defaultArgs, mode: "light" },
  play: async ({ canvas, userEvent }) => {
    const darkOption = canvas.getByRole("radio", { name: "Dark" });
    await expect(darkOption).toBeInTheDocument();
    await userEvent.click(darkOption);
  },
};

export const Midnight: Story = {
  args: { ...defaultArgs, mode: "midnight" },
};

export const SelectMidnight: Story = {
  args: { ...defaultArgs, mode: "dark", onSelect: fn() },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("radio", { name: "Midnight" }));
    await expect(args.onSelect).toHaveBeenCalledWith("midnight");
  },
};

export const Paper: Story = {
  args: { ...defaultArgs, mode: "paper" },
};

export const Bloom: Story = {
  args: { ...defaultArgs, mode: "bloom" },
};

export const Graphite: Story = {
  args: { ...defaultArgs, mode: "graphite" },
};

export const Vivid: Story = {
  args: { ...defaultArgs, mode: "vivid" },
};

export const SelectNewThemes: Story = {
  args: { ...defaultArgs, mode: "light", onSelect: fn() },
  play: async ({ args, canvas, userEvent }) => {
    for (const [name, mode] of [
      ["Paper", "paper"],
      ["Bloom", "bloom"],
      ["Graphite", "graphite"],
      ["Vivid", "vivid"],
    ] as const) {
      await userEvent.click(canvas.getByRole("radio", { name }));
      await expect(args.onSelect).toHaveBeenCalledWith(mode);
    }
  },
};
