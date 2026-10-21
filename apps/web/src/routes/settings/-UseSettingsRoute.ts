import { toast } from "@heroui/react";
import { useNavigate } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { useIntl } from "react-intl";
import { useThemeSelector } from "~/components/actions/theme-selector/UseThemeSelector";
import { getContextNotifications } from "~/core/notifications/NotificationSettings";
import { useNotifications } from "~/core/notifications/UseNotifications";
import type { SettingsSectionId } from "~/core/settings/SettingsSection";
import { toDeviceId } from "~/core/sync/FolderSync";
import { LLMS_TXT } from "~/core/sync/LlmsTxt";
import { useFolderSync } from "~/core/sync/UseFolderSync";
import { klartDataAtom } from "~/core/tasks/KlartAtoms";
import { useKlartActions } from "~/core/tasks/UseKlartActions";
import type { SettingsViewProps } from "~/views/settings/SettingsView";

export function useSettingsRoute(section?: SettingsSectionId): SettingsViewProps {
  const intl = useIntl();
  const navigate = useNavigate();
  const data = useAtomValue(klartDataAtom);
  const actions = useKlartActions();
  const sync = useFolderSync();
  const notifications = useNotifications();
  const themeSelector = useThemeSelector();

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

  const openCounts = new Map<string, number>();
  for (const task of Object.values(data.tasks)) {
    if (task.status === "open") {
      openCounts.set(task.context, (openCounts.get(task.context) ?? 0) + 1);
    }
  }

  return {
    initialSection: section,
    onBack: () => void navigate({ to: "/" }),
    contexts: {
      contexts: data.contexts.map((context) => ({ ...context, openTaskCount: openCounts.get(context.id) ?? 0 })),
      onCreate: (name, color) => void actions.createContext(name, color),
      onUpdate: actions.updateContext,
      onRemove: actions.removeContext,
      onMove: actions.moveContext,
    },
    sync: {
      status: sync.status,
      isSupported: sync.isSupported,
      deviceName: sync.settings.deviceName,
      thisDeviceId: toDeviceId(sync.settings.deviceName),
      devices: sync.devices,
      onConnect: () => void sync.connect().catch(reportError),
      onReconnect: () => void sync.reconnect().catch(reportError),
      onDisconnect: () => void sync.disconnect(),
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
      contexts: data.contexts.map((context) => ({
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
    appearance: { themeSelector },
  };
}
