import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { SyncStatusCard as Component } from "./SyncStatusCard";
import type { SyncStatusCardProps as Props } from "./SyncStatusCard";
import {
  DEMO_MULTI_SYNC_ERROR_OVERVIEW,
  DEMO_MULTI_SYNC_OVERVIEW,
  DEMO_PARTIAL_SYNC_OVERVIEW,
  demoSyncOverview,
} from "~/storybook/data/SyncDemoData";

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
  overview: demoSyncOverview({
    state: "synced",
    method: "folder",
    folderName: "Klart",
    lastSyncedAt: "2026-10-21T09:58:00Z",
  }),
  onPress: fn(),
} satisfies Props;

export const Synced: Story = {
  args: defaultArgs,
};

export const LocalOnly: Story = {
  args: { ...defaultArgs, overview: demoSyncOverview({ state: "local", method: "local" }) },
};

export const NeedsPermission: Story = {
  args: {
    ...defaultArgs,
    overview: demoSyncOverview({ state: "needs-permission", method: "folder", folderName: "Klart" }),
  },
};

export const SyncError: Story = {
  args: {
    ...defaultArgs,
    overview: demoSyncOverview({
      state: "error",
      method: "folder",
      folderName: "Klart",
      error: "The folder was moved",
    }),
  },
};

export const FolderMissing: Story = {
  args: { ...defaultArgs, overview: demoSyncOverview({ state: "missing", method: "folder", folderName: "Klart" }) },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Klart: folder not found")).toBeVisible();
  },
};

/** Contexts split across two syncs: each row names a sync and shows its contexts. */
export const SeveralSyncs: Story = {
  args: { ...defaultArgs, overview: DEMO_MULTI_SYNC_OVERVIEW },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByTestId("sync-status-card__target")).toHaveLength(2);
    await expect(canvas.getByText("2 syncs, all contexts up to date")).toBeVisible();
    await expect(canvas.getByTitle("Personal, Football club")).toBeVisible();
    await expect(canvas.getByTitle("Work")).toBeVisible();
  },
};

export const SeveralSyncsOneFailing: Story = {
  args: { ...defaultArgs, overview: DEMO_MULTI_SYNC_ERROR_OVERVIEW },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Sync problem")).toBeVisible();
    await expect(canvas.getByText("Work OneDrive: The folder was moved")).toBeVisible();
  },
};

export const SomeContextsOnThisDevice: Story = {
  args: { ...defaultArgs, overview: DEMO_PARTIAL_SYNC_OVERVIEW },
};

export const SeveralSyncsIcon: Story = {
  args: { ...defaultArgs, overview: DEMO_MULTI_SYNC_OVERVIEW, variant: "icon" },
};

export const OpensSettings: Story = {
  args: defaultArgs,
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByTestId("sync-status-card"));
    await expect(args.onPress).toHaveBeenCalled();
  },
};
