import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within } from "storybook/test";
import { WhatsNewDialog as Component } from "./WhatsNewDialog";
import type { WhatsNewDialogProps as Props } from "./WhatsNewDialog";

const meta: Meta<typeof Component> = {
  component: Component,
  title: "Feedback/Whats New Dialog",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const latest = {
  version: "0.2.0",
  highlights: [
    {
      emoji: "✏️",
      title: "Edit tasks in place",
      description: "Click any task to tweak its title, due date, reminder, tags, links and notes.",
    },
    {
      emoji: "🐙",
      title: "Sync through GitHub",
      description: "Keep your tasks in a private repository and sync from any browser. Yes, even your phone!",
    },
  ],
  fixes: [
    {
      emoji: "🤫",
      title: "Quieter GitHub sync",
      description: "Klart no longer makes a commit every half hour just to say it's still around.",
    },
  ],
};

const previous = {
  version: "0.1.0",
  highlights: [
    {
      emoji: "🖥️",
      title: "Klart on your desktop",
      description: "A proper app for macOS, Windows and Linux, with native notifications.",
    },
  ],
  fixes: [],
};

const defaultArgs = {
  isOpen: true,
  appName: "Klart",
  releases: [latest],
  onClose: fn(),
} satisfies Props;

export const Default: Story = {
  args: defaultArgs,
  play: async ({ args }) => {
    const body = within(document.body);
    await expect(await body.findByText("Edit tasks in place")).toBeInTheDocument();
    await expect(body.getByText("Version 0.2.0")).toBeInTheDocument();
    await expect(body.getByText(/Bugs squashed/)).toBeInTheDocument();

    body.getByRole("button", { name: /Let's go/ }).click();
    await expect(args.onClose).toHaveBeenCalled();
  },
};

export const SeveralVersions: Story = {
  args: { ...defaultArgs, releases: [latest, previous] },
  play: async () => {
    const body = within(document.body);
    await expect(await body.findByText("Version 0.2.0")).toBeInTheDocument();
    await expect(body.getByText("Version 0.1.0")).toBeInTheDocument();
  },
};

export const HighlightsOnly: Story = {
  args: { ...defaultArgs, releases: [previous] },
  play: async () => {
    const body = within(document.body);
    await expect(await body.findByText("Klart on your desktop")).toBeInTheDocument();
    await expect(body.queryByText(/Bugs squashed/)).toBeNull();
  },
};

export const Phone: Story = {
  args: { ...defaultArgs, releases: [latest, previous] },
  globals: { viewport: { value: "iphonex" } },
};
