import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { SettingsView as Component } from "./SettingsView";
import type { SettingsViewProps as Props } from "./SettingsView";
import {
  DEFAULT_CONTEXT_NOTIFICATIONS,
  DEFAULT_NOTIFICATION_SETTINGS,
} from "~/core/notifications/NotificationSettings";
import { LLMS_TXT } from "~/core/sync/LlmsTxt";
import { DEMO_CONTEXTS } from "~/storybook/data/KlartDemoData";

const NOW = Date.parse("2026-10-21T10:00:00Z");

const defaultArgs = {
  onBack: fn(),
  contexts: {
    contexts: DEMO_CONTEXTS.map((context, index) => ({ ...context, openTaskCount: 6 - index * 2 })),
    onCreate: fn(),
    onUpdate: fn(),
    onRemove: fn(),
    onMove: fn(),
  },
  sync: {
    now: NOW,
    status: { state: "synced", folderName: "Klart", lastSyncedAt: "2026-10-21T09:59:00Z" },
    isSupported: true,
    deviceName: "MacBook Air",
    thisDeviceId: "macbook-air",
    devices: [
      { id: "macbook-air", name: "MacBook Air", lastActiveAt: "2026-10-21T09:59:00Z" },
      { id: "work-pc", name: "Work PC", lastActiveAt: "2026-10-21T07:00:00Z" },
    ],
    onConnect: fn(),
    onReconnect: fn(),
    onDisconnect: fn(),
    onSyncNow: fn(),
    onDeviceNameChange: fn(),
  },
  agents: {
    options: { writeViews: true, acceptInbox: true, keepLlmsTxt: true },
    onChange: fn(),
    llmsTxt: LLMS_TXT,
  },
  notifications: {
    settings: DEFAULT_NOTIFICATION_SETTINGS,
    contexts: DEMO_CONTEXTS.map((context) => ({
      id: context.id,
      name: context.name,
      color: context.color,
      setting:
        context.id === "work"
          ? { enabled: true, from: "08:00", to: "17:30", weekdaysOnly: true }
          : DEFAULT_CONTEXT_NOTIFICATIONS,
    })),
    permission: "granted",
    onRequestPermission: fn(),
    onSendTest: fn(),
    onChange: fn(),
    onContextChange: fn(),
  },
  appearance: { themeSelector: { mode: "auto", onSelect: fn() } },
} satisfies Props;

const meta: Meta<typeof Component> = {
  component: Component,
  title: "Views/Settings",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: defaultArgs,
};

export const LocalOnly: Story = {
  args: {
    ...defaultArgs,
    sync: { ...defaultArgs.sync, status: { state: "local" }, devices: [] },
    notifications: { ...defaultArgs.notifications, permission: "default" },
  },
};

export const NeedsPermission: Story = {
  args: { ...defaultArgs, sync: { ...defaultArgs.sync, status: { state: "needs-permission", folderName: "Klart" } } },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByTestId("settings__sync-reconnect"));
    await expect(args.sync.onReconnect).toHaveBeenCalled();
  },
};

export const UnsupportedBrowser: Story = {
  args: { ...defaultArgs, sync: { ...defaultArgs.sync, status: { state: "local" }, isSupported: false, devices: [] } },
};

export const Phone: Story = {
  args: defaultArgs,
  globals: { viewport: { value: "iphonex" } },
};

export const CreateContext: Story = {
  args: defaultArgs,
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(canvas.getByTestId("settings__new-context-name"), "Side project");
    await userEvent.click(canvas.getByTestId("settings__new-context"));
    await expect(args.contexts.onCreate).toHaveBeenCalledWith("Side project", "teal");
  },
};
