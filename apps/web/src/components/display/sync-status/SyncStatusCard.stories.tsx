import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { SyncStatusCard as Component } from "./SyncStatusCard";
import type { SyncStatusCardProps as Props } from "./SyncStatusCard";

const NOW = Date.parse("2026-10-21T10:00:00Z");

const meta: Meta<typeof Component> = {
  component: Component,
  title: "Display/Sync Status Card",
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-60 p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultArgs = {
  now: NOW,
  status: { state: "synced", method: "folder", folderName: "Klart", lastSyncedAt: "2026-10-21T09:58:00Z" },
  onPress: fn(),
} satisfies Props;

export const Synced: Story = {
  args: defaultArgs,
};

export const LocalOnly: Story = {
  args: { ...defaultArgs, status: { state: "local", method: "local" } },
};

export const NeedsPermission: Story = {
  args: { ...defaultArgs, status: { state: "needs-permission", method: "folder", folderName: "Klart" } },
};

export const SyncError: Story = {
  args: {
    ...defaultArgs,
    status: { state: "error", method: "folder", folderName: "Klart", error: "The folder was moved" },
  },
};

export const OpensSettings: Story = {
  args: defaultArgs,
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByTestId("sync-status-card"));
    await expect(args.onPress).toHaveBeenCalled();
  },
};
