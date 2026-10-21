import { ContainerDecorator } from "@package/storybook";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, screen, waitFor } from "storybook/test";
import { ContextSwitcher as Component } from "./ContextSwitcher";
import type { ContextSwitcherProps as Props } from "./ContextSwitcher";

const meta: Meta<typeof Component> = {
  component: Component,
  title: "Actions/Context Switcher",
  tags: ["autodocs"],
  decorators: [ContainerDecorator],
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultArgs = {
  selectedId: "personal",
  options: [
    { id: "all", name: "All contexts", color: "all", dayCount: 5, shortcut: "0" },
    { id: "personal", name: "Personal", color: "blue", dayCount: 2, shortcut: "1" },
    { id: "work", name: "Work", color: "orange", dayCount: 2, shortcut: "2" },
    { id: "club", name: "Football club", color: "green", dayCount: 1, shortcut: "3" },
  ],
  onSelect: fn(),
  onManage: fn(),
} satisfies Props;

export const Sidebar: Story = {
  args: defaultArgs,
};

export const Compact: Story = {
  args: { ...defaultArgs, variant: "compact", selectedId: "work" },
};

export const SwitchContext: Story = {
  args: defaultArgs,
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByTestId("context-switcher__trigger"));
    const work = await screen.findByRole("menuitemradio", { name: /Work/ });
    await userEvent.click(work);
    await waitFor(() => expect(args.onSelect).toHaveBeenCalledWith("work"));
  },
};
