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
    status: { state: "synced", method: "folder", folderName: "Klart", lastSyncedAt: "2026-10-21T09:59:00Z" },
    isSupported: true,
    isDesktop: false,
    isGitSupported: false,
    deviceName: "MacBook Air",
    thisDeviceId: "macbook-air",
    devices: [
      { id: "macbook-air", name: "MacBook Air", lastActiveAt: "2026-10-21T09:59:00Z" },
      { id: "work-pc", name: "Work PC", lastActiveAt: "2026-10-21T07:00:00Z" },
    ],
    onConnect: fn(),
    onConnectGit: fn(),
    onCloneGit: fn(),
    onConnectGitHub: fn(async () => true),
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
  about: { appName: "Klart", version: "0.1.0", build: "42", commit: "447df5b", onShowWhatsNew: fn() },
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

export const About: Story = {
  args: defaultArgs,
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByTestId("settings__about-version")).toHaveTextContent("0.1.0");
    await expect(canvas.getByTestId("settings__about-build")).toHaveTextContent("42");
    await expect(canvas.getByTestId("settings__about-commit")).toHaveTextContent("447df5b");
    await userEvent.click(canvas.getByTestId("settings__about-whats-new"));
    await expect(args.about.onShowWhatsNew).toHaveBeenCalled();
  },
};

export const AboutLocalBuild: Story = {
  args: { ...defaultArgs, about: { appName: "Klart", version: "0.1.0", onShowWhatsNew: fn() } },
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId("settings__about-build")).toHaveTextContent("Local build");
    await expect(canvas.queryByTestId("settings__about-commit")).toBeNull();
  },
};

export const LocalOnly: Story = {
  args: {
    ...defaultArgs,
    sync: { ...defaultArgs.sync, status: { state: "local", method: "local" }, devices: [] },
    notifications: { ...defaultArgs.notifications, permission: "default" },
  },
};

export const NeedsPermission: Story = {
  args: {
    ...defaultArgs,
    sync: { ...defaultArgs.sync, status: { state: "needs-permission", method: "folder", folderName: "Klart" } },
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByTestId("settings__sync-reconnect"));
    await expect(args.sync.onReconnect).toHaveBeenCalled();
  },
};

export const UnsupportedBrowser: Story = {
  args: {
    ...defaultArgs,
    sync: { ...defaultArgs.sync, status: { state: "local", method: "local" }, isSupported: false, devices: [] },
  },
};

export const DesktopGitConnected: Story = {
  args: {
    ...defaultArgs,
    sync: {
      ...defaultArgs.sync,
      isDesktop: true,
      isGitSupported: true,
      status: {
        state: "synced",
        method: "git",
        folderName: "klart-data",
        location: "/Users/petter/Developer/klart-data",
        lastSyncedAt: "2026-10-21T09:59:00Z",
        git: {
          remoteUrl: "git@github.com:pettor/klart-data.git",
          branch: "main",
          lastSyncedAt: "2026-10-21T09:57:00Z",
          conflicts: 1,
        },
      },
    },
  },
};

export const DesktopGitError: Story = {
  args: {
    ...defaultArgs,
    sync: {
      ...defaultArgs.sync,
      isDesktop: true,
      isGitSupported: true,
      status: {
        state: "synced",
        method: "git",
        folderName: "klart-data",
        location: "/Users/petter/Developer/klart-data",
        git: {
          remoteUrl: "git@github.com:pettor/klart-data.git",
          branch: "main",
          error: "git@github.com: Permission denied (publickey).",
        },
      },
    },
  },
};

export const DesktopGitClone: Story = {
  args: {
    ...defaultArgs,
    sync: { ...defaultArgs.sync, isDesktop: true, isGitSupported: true, status: { state: "local", method: "local" } },
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("radio", { name: /Git repository/ }));
    await userEvent.type(canvas.getByTestId("settings__git-url"), "git@github.com:you/klart-data.git");
    await userEvent.click(canvas.getByTestId("settings__git-clone"));
    await expect(args.sync.onCloneGit).toHaveBeenCalledWith("git@github.com:you/klart-data.git");
    await expect(args.sync.onConnect).not.toHaveBeenCalled();
  },
};

export const DesktopWithoutGit: Story = {
  args: {
    ...defaultArgs,
    sync: { ...defaultArgs.sync, isDesktop: true, isGitSupported: false, status: { state: "local", method: "local" } },
  },
};

export const GitHubSetup: Story = {
  args: {
    ...defaultArgs,
    sync: { ...defaultArgs.sync, isSupported: false, status: { state: "local", method: "local" }, devices: [] },
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("radio", { name: /GitHub/ }));
    await expect(canvas.getByTestId("settings__github-connect")).toBeDisabled();
    await userEvent.type(canvas.getByTestId("settings__github-owner"), "you");
    await userEvent.type(canvas.getByTestId("settings__github-repository"), "klart-data");
    await userEvent.type(canvas.getByTestId("settings__github-token"), "github_pat_123");
    await userEvent.click(canvas.getByTestId("settings__github-connect"));
    await expect(args.sync.onConnectGitHub).toHaveBeenCalledWith({
      owner: "you",
      repository: "klart-data",
      token: "github_pat_123",
    });
    await expect(args.sync.onDisconnect).not.toHaveBeenCalled();
  },
};

export const GitHubConnected: Story = {
  args: {
    ...defaultArgs,
    sync: {
      ...defaultArgs.sync,
      isSupported: false,
      status: {
        state: "synced",
        method: "github",
        folderName: "you/klart-data",
        lastSyncedAt: "2026-10-21T09:59:00Z",
        git: { remoteUrl: "github.com/you/klart-data", branch: "main", lastSyncedAt: "2026-10-21T09:58:00Z" },
      },
    },
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByTestId("settings__github-sync-now"));
    await expect(args.sync.onSyncNow).toHaveBeenCalled();
    await userEvent.click(canvas.getByTestId("settings__github-change"));
    await expect(canvas.getByTestId("settings__github-setup")).toBeVisible();
  },
};

export const GitHubTokenRejected: Story = {
  args: {
    ...defaultArgs,
    sync: {
      ...defaultArgs.sync,
      status: {
        state: "synced",
        method: "github",
        folderName: "you/klart-data",
        git: {
          remoteUrl: "github.com/you/klart-data",
          branch: "main",
          error: "Bad credentials",
          errorKind: "unauthorized",
        },
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId("settings__github-error")).toHaveTextContent(/didn't accept the token/);
  },
};

export const Phone: Story = {
  args: defaultArgs,
  globals: { viewport: { value: "iphonex" } },
};

export const PhoneGitHub: Story = {
  args: GitHubConnected.args,
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
