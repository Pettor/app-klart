import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, screen, within } from "storybook/test";
import { SettingsView as Component } from "./SettingsView";
import type { SettingsViewProps as Props } from "./SettingsView";
import {
  DEFAULT_CONTEXT_NOTIFICATIONS,
  DEFAULT_NOTIFICATION_SETTINGS,
} from "~/core/notifications/NotificationSettings";
import { LLMS_TXT } from "~/core/sync/LlmsTxt";
import { DEFAULT_SUGGESTION_SETTINGS } from "~/core/tasks/SuggestionSettings";
import { DEMO_CONTEXTS } from "~/storybook/data/KlartDemoData";
import { DEMO_MULTI_SYNC_OVERVIEW, demoSyncOverview } from "~/storybook/data/SyncDemoData";

const NOW = Date.parse("2026-10-21T10:00:00Z");

const defaultArgs = {
  onBack: fn(),
  contexts: {
    contexts: DEMO_CONTEXTS.map((context, index) => ({ ...context, openTaskCount: 6 - index * 2, isHidden: false })),
    syncs: [],
    onCreate: fn(),
    onUpdate: fn(),
    onRemove: fn(),
    onMove: fn(),
    onHiddenChange: fn(),
  },
  sync: {
    now: NOW,
    overview: demoSyncOverview({
      state: "synced",
      method: "folder",
      folderName: "Klart",
      lastSyncedAt: "2026-10-21T09:59:00Z",
    }),
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
    onRemove: fn(),
    onRename: fn(),
    onMakePrimary: fn(),
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
  general: {
    startContext: "last",
    contexts: DEMO_CONTEXTS.map(({ id, name, color }) => ({ id, name, color })),
    onStartContextChange: fn(),
  },
  appearance: {
    themeSelector: { mode: "auto", onSelect: fn() },
    density: "comfortable",
    onDensityChange: fn(),
    tintByContext: true,
    onTintByContextChange: fn(),
    motion: "system",
    onMotionChange: fn(),
  },
  suggestions: { settings: DEFAULT_SUGGESTION_SETTINGS, onChange: fn() },
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
  args: { ...defaultArgs, initialSection: "about" },
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByTestId("settings__about-version")).toHaveTextContent("0.1.0");
    await expect(canvas.getByTestId("settings__about-build")).toHaveTextContent("42");
    await expect(canvas.getByTestId("settings__about-commit")).toHaveTextContent("447df5b");
    await userEvent.click(canvas.getByTestId("settings__about-whats-new"));
    await expect(args.about.onShowWhatsNew).toHaveBeenCalled();
  },
};

export const AboutLocalBuild: Story = {
  args: {
    ...defaultArgs,
    initialSection: "about",
    about: { appName: "Klart", version: "0.1.0", onShowWhatsNew: fn() },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId("settings__about-build")).toHaveTextContent("Local build");
    await expect(canvas.queryByTestId("settings__about-commit")).toBeNull();
  },
};

export const LocalOnly: Story = {
  args: {
    ...defaultArgs,
    initialSection: "sync",
    sync: { ...defaultArgs.sync, overview: demoSyncOverview({ state: "local", method: "local" }), devices: [] },
    notifications: { ...defaultArgs.notifications, permission: "default" },
  },
};

export const NeedsPermission: Story = {
  args: {
    ...defaultArgs,
    initialSection: "sync",
    sync: {
      ...defaultArgs.sync,
      overview: demoSyncOverview({ state: "needs-permission", method: "folder", folderName: "Klart" }),
    },
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByTestId("settings__sync-reconnect"));
    await expect(args.sync.onReconnect).toHaveBeenCalled();
  },
};

export const UnsupportedBrowser: Story = {
  args: {
    ...defaultArgs,
    initialSection: "sync",
    sync: {
      ...defaultArgs.sync,
      overview: demoSyncOverview({ state: "local", method: "local" }),
      isSupported: false,
      devices: [],
    },
  },
};

export const DesktopGitConnected: Story = {
  args: {
    ...defaultArgs,
    initialSection: "sync",
    sync: {
      ...defaultArgs.sync,
      isDesktop: true,
      isGitSupported: true,
      overview: demoSyncOverview({
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
      }),
    },
  },
};

export const DesktopGitError: Story = {
  args: {
    ...defaultArgs,
    initialSection: "sync",
    sync: {
      ...defaultArgs.sync,
      isDesktop: true,
      isGitSupported: true,
      overview: demoSyncOverview({
        state: "synced",
        method: "git",
        folderName: "klart-data",
        location: "/Users/petter/Developer/klart-data",
        git: {
          remoteUrl: "git@github.com:pettor/klart-data.git",
          branch: "main",
          error: "git@github.com: Permission denied (publickey).",
        },
      }),
    },
  },
};

export const DesktopGitClone: Story = {
  args: {
    ...defaultArgs,
    initialSection: "sync",
    sync: {
      ...defaultArgs.sync,
      isDesktop: true,
      isGitSupported: true,
      overview: demoSyncOverview({ state: "local", method: "local" }),
    },
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
    initialSection: "sync",
    sync: {
      ...defaultArgs.sync,
      isDesktop: true,
      isGitSupported: false,
      overview: demoSyncOverview({ state: "local", method: "local" }),
    },
  },
};

export const GitHubSetup: Story = {
  args: {
    ...defaultArgs,
    initialSection: "sync",
    sync: {
      ...defaultArgs.sync,
      isSupported: false,
      overview: demoSyncOverview({ state: "local", method: "local" }),
      devices: [],
    },
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
    await expect(args.sync.onRemove).not.toHaveBeenCalled();
  },
};

export const GitHubConnected: Story = {
  args: {
    ...defaultArgs,
    initialSection: "sync",
    sync: {
      ...defaultArgs.sync,
      isSupported: false,
      overview: demoSyncOverview({
        state: "synced",
        method: "github",
        folderName: "you/klart-data",
        lastSyncedAt: "2026-10-21T09:59:00Z",
        git: { remoteUrl: "github.com/you/klart-data", branch: "main", lastSyncedAt: "2026-10-21T09:58:00Z" },
      }),
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
    initialSection: "sync",
    sync: {
      ...defaultArgs.sync,
      overview: demoSyncOverview({
        state: "synced",
        method: "github",
        folderName: "you/klart-data",
        git: {
          remoteUrl: "github.com/you/klart-data",
          branch: "main",
          error: "Bad credentials",
          errorKind: "unauthorized",
        },
      }),
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId("settings__github-error")).toHaveTextContent(/didn't accept the token/);
  },
};

/** Personal and Football club sync with a GitHub repo, Work with a OneDrive folder. */
export const SeveralSyncs: Story = {
  args: {
    ...defaultArgs,
    initialSection: "sync",
    sync: {
      ...defaultArgs.sync,
      overview: DEMO_MULTI_SYNC_OVERVIEW,
    },
  },
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getAllByTestId("settings__sync-target")).toHaveLength(2);
    // Contexts live where they were created; Sync lists them per sync but can't move them.
    await expect(canvas.getAllByTestId("settings__sync-target-contexts")).toHaveLength(2);

    await userEvent.click(canvas.getByTestId("settings__sync-make-primary"));
    await expect(args.sync.onMakePrimary).toHaveBeenCalledWith("work");
  },
};

/** With one sync, "Add another sync" opens the picker without "this browser only". */
export const AddAnotherSync: Story = {
  args: { ...defaultArgs, initialSection: "sync" },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByTestId("settings__sync-add"));
    await expect(canvas.queryByRole("radio", { name: /This browser only/ })).toBeNull();
    await userEvent.click(canvas.getByRole("radio", { name: /GitHub/ }));
    await userEvent.type(canvas.getByTestId("settings__github-owner"), "you");
    await userEvent.type(canvas.getByTestId("settings__github-repository"), "work-data");
    await userEvent.type(canvas.getByTestId("settings__github-token"), "github_pat_123");
    await userEvent.click(canvas.getByTestId("settings__github-connect"));
    await expect(args.sync.onConnectGitHub).toHaveBeenCalledWith({
      owner: "you",
      repository: "work-data",
      token: "github_pat_123",
    });
  },
};

export const RenameAndRemoveSync: Story = {
  args: { ...defaultArgs, initialSection: "sync" },
  play: async ({ args, canvas, userEvent }) => {
    const name = canvas.getByTestId("settings__sync-target-name");
    await userEvent.clear(name);
    await userEvent.type(name, "Home OneDrive{Enter}");
    await expect(args.sync.onRename).toHaveBeenCalledWith("main", "Home OneDrive");
    await userEvent.click(canvas.getByTestId("settings__sync-remove"));
    await expect(args.sync.onRemove).toHaveBeenCalledWith("main");
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
  args: { ...defaultArgs, initialSection: "contexts" },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(canvas.getByTestId("settings__new-context-name"), "Side project");
    await userEvent.click(canvas.getByTestId("settings__new-context"));
    await expect(args.contexts.onCreate).toHaveBeenCalledWith("Side project", "teal", null);
  },
};

const MULTI_SYNC_CONTEXTS = {
  ...defaultArgs.contexts,
  contexts: defaultArgs.contexts.contexts.map((context) => ({
    ...context,
    syncName: context.id === "work" ? "Work OneDrive" : "Personal repo",
  })),
  syncs: DEMO_MULTI_SYNC_OVERVIEW.targets.map(({ id, name }) => ({ id, name })),
};

/** Contexts from two syncs: each card says where it lives, and a new context picks its sync. */
export const ContextsFromSeveralSyncs: Story = {
  args: { ...defaultArgs, initialSection: "contexts", contexts: MULTI_SYNC_CONTEXTS },
  play: async ({ args, canvas, userEvent }) => {
    const labels = canvas.getAllByTestId("settings-context-card__sync").map((label) => label.textContent);
    await expect(labels).toEqual(["Personal repo", "Work OneDrive", "Personal repo"]);

    await userEvent.type(canvas.getByTestId("settings__new-context-name"), "Office");
    await userEvent.click(within(canvas.getByTestId("settings__new-context-sync")).getByRole("button"));
    await userEvent.click(await screen.findByRole("option", { name: "Work OneDrive" }));
    await userEvent.click(canvas.getByTestId("settings__new-context"));
    await expect(args.contexts.onCreate).toHaveBeenCalledWith("Office", "teal", "work");
  },
};

/** A context hidden on this device is dimmed and can be shown again; the last shown one can't be hidden. */
export const HiddenContext: Story = {
  args: {
    ...defaultArgs,
    initialSection: "contexts",
    contexts: {
      ...MULTI_SYNC_CONTEXTS,
      contexts: MULTI_SYNC_CONTEXTS.contexts.map((context) => ({ ...context, isHidden: context.id !== "personal" })),
    },
  },
  play: async ({ args, canvas, userEvent }) => {
    const [personal, work] = canvas.getAllByTestId("settings-context-card");
    await expect(within(personal!).getByTestId("settings-context-card__visibility")).toBeDisabled();
    await userEvent.click(within(work!).getByTestId("settings-context-card__visibility"));
    await expect(args.contexts.onHiddenChange).toHaveBeenCalledWith("work", false);
  },
};

export const General: Story = {
  args: defaultArgs,
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(within(canvas.getByTestId("settings__start-context")).getByRole("button"));
    await userEvent.click(await screen.findByRole("option", { name: /Work/ }));
    await expect(args.general.onStartContextChange).toHaveBeenCalledWith("work");
  },
};

export const Appearance: Story = {
  args: { ...defaultArgs, initialSection: "appearance" },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("radio", { name: "Compact" }));
    await expect(args.appearance.onDensityChange).toHaveBeenCalledWith("compact");
    await userEvent.click(canvas.getByRole("radio", { name: "Reduced" }));
    await expect(args.appearance.onMotionChange).toHaveBeenCalledWith("reduced");
  },
};

export const Suggestions: Story = {
  args: { ...defaultArgs, initialSection: "suggestions" },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(within(canvas.getByTestId("settings__suggest-recently_added")).getByRole("switch"));
    await expect(args.suggestions.onChange).toHaveBeenCalledWith({
      ...DEFAULT_SUGGESTION_SETTINGS,
      disabled: ["recently_added"],
    });
  },
};

/** Picking a section in the nav swaps the pane. */
export const SwitchSections: Story = {
  args: defaultArgs,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByTestId("settings__nav-sync"));
    await expect(canvas.getByRole("heading", { level: 1, name: "Sync" })).toBeVisible();
  },
};
