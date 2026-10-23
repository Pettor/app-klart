import { ContainerDecorator } from "@package/storybook";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { TaskLinksButton as Component } from "./TaskLinksButton";
import type { TaskLinksButtonProps as Props } from "./TaskLinksButton";

const meta: Meta<typeof Component> = {
  component: Component,
  title: "Display/Task Links Button",
  tags: ["autodocs"],
  decorators: [ContainerDecorator],
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultArgs = {
  title: "Review sync PR for gateway client and update the release notes before the Friday deploy",
  links: [
    "https://github.com/acme/gateway-client/pull/412",
    "https://www.notion.so/acme/Gateway-sync-spec-9f2c",
    "https://wiki.acme.dev/release-notes",
  ],
  variant: "popover",
} satisfies Props;

export const Popover: Story = {
  args: defaultArgs,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "3 links" }));
    const body = within(document.body);
    const links = await body.findAllByTestId("task-links__link");
    await expect(links).toHaveLength(3);
    await expect(links[0]).toHaveAttribute("href", "https://github.com/acme/gateway-client/pull/412");
    await expect(links[0]).toHaveAttribute("target", "_blank");
    await expect(links[1]).toHaveTextContent("notion.so");
  },
};

/** On phones the links open in a bottom sheet. */
export const Sheet: Story = {
  args: { ...defaultArgs, variant: "sheet" },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "3 links" }));
    const body = within(document.body);
    await expect(await body.findByRole("dialog", { name: "3 links" })).toBeInTheDocument();
    await expect(await body.findAllByTestId("task-links__link")).toHaveLength(3);
  },
};
