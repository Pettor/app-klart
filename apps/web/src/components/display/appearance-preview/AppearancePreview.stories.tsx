import { ContainerDecorator } from "@package/storybook";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { AppearancePreview as Component } from "./AppearancePreview";
import type { AppearancePreviewProps as Props } from "./AppearancePreview";

const meta: Meta<typeof Component> = {
  component: Component,
  title: "Display/Appearance Preview",
  tags: ["autodocs"],
  decorators: [ContainerDecorator],
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultArgs = {
  today: "2026-10-21",
  density: "comfortable",
  tintByContext: true,
  className: "max-w-[340px]",
} satisfies Props;

export const Default: Story = {
  args: defaultArgs,
};

export const Compact: Story = {
  args: { ...defaultArgs, density: "compact" },
};

export const Untinted: Story = {
  args: { ...defaultArgs, tintByContext: false },
};

/** The sample tasks can be checked off and starred, so the motion setting can be tried. */
export const Interactive: Story = {
  args: defaultArgs,
  play: async ({ canvas, userEvent }) => {
    const star = (): HTMLElement => canvas.getAllByTestId("task-row__important")[0]!;
    await expect(star()).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(star());
    await waitFor(() => expect(star()).toHaveAttribute("aria-pressed", "false"));

    await userEvent.click(canvas.getAllByTestId("task-row__toggle")[0]!);
    await waitFor(() => expect(canvas.getAllByTestId("task-row__important")).toHaveLength(1), {
      timeout: 2000,
    });
  },
};
