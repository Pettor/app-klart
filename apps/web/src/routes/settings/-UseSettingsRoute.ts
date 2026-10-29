import { toast } from "@heroui/react";
import { useAtom, useAtomValue } from "jotai";
import { useIntl } from "react-intl";
import { useThemeSelector } from "~/components/actions/theme-selector/UseThemeSelector";
import { useAppInfo } from "~/core/config/UseAppInfo";
import { getContextNotifications } from "~/core/notifications/NotificationSettings";
import { useNotifications } from "~/core/notifications/UseNotifications";
import { useHierarchyNavigation } from "~/core/routes/UseHierarchyNavigation";
import type { SettingsSectionId } from "~/core/settings/SettingsSection";
import { toDeviceId } from "~/core/sync/FolderSync";
import { GitHubError } from "~/core/sync/GitHubBackend";
import { LLMS_TXT } from "~/core/sync/LlmsTxt";
import { DEVICE_ONLY } from "~/core/sync/SyncTargets";
import type { GitConnectResult, GitHubConnectResult, GitHubCredentials } from "~/core/sync/UseFolderSync";
import { useFolderSync } from "~/core/sync/UseFolderSync";
import {
  hiddenContextIdsAtom,
  klartDataAtom,
  startContextAtom,
  suggestionSettingsAtom,
  visibleKlartDataAtom,
} from "~/core/tasks/KlartAtoms";
import { useKlartActions } from "~/core/tasks/UseKlartActions";
import { densityAtom, motionAtom, tintByContextAtom } from "~/core/theme/ThemeAtoms";
import { useWhatsNew } from "~/core/whats-new/UseWhatsNew";
import { githubErrorText } from "~/views/settings/SettingsGitHubMessages";
import type { SettingsViewProps } from "~/views/settings/SettingsView";

export function useSettingsRoute(section?: SettingsSectionId): SettingsViewProps {
  const intl = useIntl();
  const navigation = useHierarchyNavigation();
  const data = useAtomValue(klartDataAtom);
  const actions = useKlartActions();
  const sync = useFolderSync();
  const notifications = useNotifications();
  const themeSelector = useThemeSelector();
  const { appName, appVersion } = useAppInfo();
  const whatsNew = useWhatsNew();
  const visibleContexts = useAtomValue(visibleKlartDataAtom).contexts;
  const [hiddenContextIds, setHiddenContextIds] = useAtom(hiddenContextIdsAtom);
  const [startContext, setStartContext] = useAtom(startContextAtom);
  const [suggestionSettings, setSuggestionSettings] = useAtom(suggestionSettingsAtom);
  const [density, setDensity] = useAtom(densityAtom);
  const [tintByContext, setTintByContext] = useAtom(tintByContextAtom);
  const [motion, setMotion] = useAtom(motionAtom);

  function reportError(error: unknown): void {
    toast.danger(
      intl.formatMessage({
        description: "SettingsRoute - toast when connecting a folder fails",
        defaultMessage: "Couldn't open the folder",
        id: "rFCRZ0",
      }),
      { description: error instanceof Error ? error.message : String(error) }
    );
  }

  function reportGit(result: GitConnectResult): void {
    if (result === "not-a-repo") {
      toast.warning(
        intl.formatMessage({
          description: "SettingsRoute - toast when the chosen folder isn't a Git clone",
          defaultMessage: "That folder isn't a Git repository",
          id: "QEDD7p",
        }),
        {
          description: intl.formatMessage({
            description: "SettingsRoute - hint when the chosen folder isn't a Git clone",
            defaultMessage: "Pick the folder you cloned, or clone the repository from its URL.",
            id: "3y2DF+",
          }),
        }
      );
    }
  }

  function reportGitError(error: unknown): void {
    toast.danger(
      intl.formatMessage({
        description: "SettingsRoute - toast when cloning or opening a repository fails",
        defaultMessage: "Couldn't set up the repository",
        id: "T14W/h",
      }),
      { description: error instanceof Error ? error.message : String(error) }
    );
  }

  function reportGitHub(result: GitHubConnectResult): boolean {
    if (result === "public") {
      toast.warning(
        intl.formatMessage({
          description: "SettingsRoute - toast when the GitHub repository is public",
          defaultMessage: "That repository is public",
          id: "D+n4EK",
        }),
        {
          description: intl.formatMessage({
            description: "SettingsRoute - hint when the GitHub repository is public",
            defaultMessage: "Anyone could read your tasks. Make the repository private on GitHub, then connect again.",
            id: "ujNiF+",
          }),
        }
      );
    } else if (result === "read-only") {
      toast.warning(
        intl.formatMessage({
          description: "SettingsRoute - toast when the token can't write to the repository",
          defaultMessage: "The token can only read this repository",
          id: "ZSWTr2",
        }),
        {
          description: intl.formatMessage({
            description: "SettingsRoute - hint when the token can't write to the repository",
            defaultMessage: "Edit the token on GitHub and set Contents to Read and write.",
            id: "u4Dzlc",
          }),
        }
      );
    }
    return result === "connected";
  }

  function reportGitHubError(error: unknown): boolean {
    const detail = error instanceof Error ? error.message : String(error);
    toast.danger(
      intl.formatMessage({
        description: "SettingsRoute - toast when connecting a GitHub repository fails",
        defaultMessage: "Couldn't connect to GitHub",
        id: "ygAuyn",
      }),
      { description: (error instanceof GitHubError && githubErrorText(intl, error.kind)) || detail }
    );
    return false;
  }

  function connectGitHub(credentials: GitHubCredentials, targetId?: string): Promise<boolean> {
    return sync.connectGitHub(credentials, targetId).then(reportGitHub, reportGitHubError);
  }

  const syncNames = new Map(sync.overview.targets.map((target) => [target.id, target.name]));

  const openCounts = new Map<string, number>();
  for (const task of Object.values(data.tasks)) {
    if (task.status === "open") {
      openCounts.set(task.context, (openCounts.get(task.context) ?? 0) + 1);
    }
  }

  return {
    initialSection: section,
    onBack: () => navigation.up({ to: "/" }),
    general: {
      startContext,
      contexts: visibleContexts.map(({ id, name, color }) => ({ id, name, color })),
      onStartContextChange: setStartContext,
    },
    contexts: {
      contexts: data.contexts.map((context) => ({
        ...context,
        openTaskCount: openCounts.get(context.id) ?? 0,
        isHidden: hiddenContextIds.includes(context.id),
        syncName:
          syncNames.size > 0 ? (syncNames.get(sync.contextTargets[context.id] ?? DEVICE_ONLY) ?? null) : undefined,
      })),
      syncs: sync.overview.targets.map(({ id, name }) => ({ id, name })),
      onCreate: (name, color, syncId) => {
        const context = actions.createContext(name, color);
        if (syncId) {
          sync.placeNewContext(context.id, syncId);
        }
      },
      onUpdate: actions.updateContext,
      onRemove: actions.removeContext,
      onMove: actions.moveContext,
      onHiddenChange: (id, isHidden) =>
        setHiddenContextIds((current) =>
          isHidden ? [...current.filter((hidden) => hidden !== id), id] : current.filter((hidden) => hidden !== id)
        ),
    },
    sync: {
      overview: sync.overview,
      isSupported: sync.isSupported,
      isDesktop: sync.isDesktop,
      isGitSupported: sync.isGitSupported,
      deviceName: sync.settings.deviceName,
      thisDeviceId: toDeviceId(sync.settings.deviceName),
      devices: sync.devices,
      onConnect: (targetId) => void sync.connect(targetId).catch(reportError),
      onConnectGit: (targetId) => void sync.connectGit(targetId).then(reportGit).catch(reportGitError),
      onCloneGit: (url, targetId) => void sync.cloneGit(url, targetId).then(reportGit).catch(reportGitError),
      onConnectGitHub: connectGitHub,
      onReconnect: (targetId) => void sync.reconnect(targetId).catch(reportError),
      onRemove: (targetId) => void sync.remove(targetId),
      onRename: sync.rename,
      onMakePrimary: sync.makePrimary,
      onSyncNow: sync.syncNow,
      onDeviceNameChange: sync.setDeviceName,
    },
    agents: {
      options: sync.settings.agentFiles,
      onChange: sync.setAgentOption,
      llmsTxt: LLMS_TXT,
    },
    notifications: {
      settings: notifications.settings,
      contexts: visibleContexts.map((context) => ({
        id: context.id,
        name: context.name,
        color: context.color,
        setting: getContextNotifications(notifications.settings, context.id),
      })),
      permission: notifications.permission,
      onRequestPermission: () => void notifications.requestPermission(),
      onSendTest: () => void notifications.sendTest(),
      onChange: notifications.update,
      onContextChange: notifications.updateContext,
    },
    appearance: {
      themeSelector,
      density,
      onDensityChange: setDensity,
      tintByContext,
      onTintByContextChange: setTintByContext,
      motion,
      onMotionChange: setMotion,
    },
    suggestions: { settings: suggestionSettings, onChange: setSuggestionSettings },
    about: { appName, ...appVersion, onShowWhatsNew: whatsNew.open },
  };
}
