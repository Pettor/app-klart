import { useCallback } from "react";
import { toast } from "@heroui/react";
import { useAtom } from "jotai";
import { useIntl } from "react-intl";
import { notificationPermissionAtom, notificationSettingsAtom } from "./NotificationAtoms";
import type { ContextNotificationSetting, NotificationSettings } from "./NotificationSettings";
import { getContextNotifications } from "./NotificationSettings";
import { showSystemNotification } from "./ShowNotification";

export interface UseNotificationsResult {
  settings: NotificationSettings;
  permission: NotificationPermission | "unsupported";
  requestPermission: () => Promise<void>;
  sendTest: () => Promise<void>;
  update: (patch: Partial<NotificationSettings>) => void;
  updateContext: (contextId: string, patch: Partial<ContextNotificationSetting>) => void;
}

export function useNotifications(): UseNotificationsResult {
  const intl = useIntl();
  const [settings, setSettings] = useAtom(notificationSettingsAtom);
  const [permission, setPermission] = useAtom(notificationPermissionAtom);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === "undefined") {
      return;
    }
    setPermission(await Notification.requestPermission());
  }, [setPermission]);

  const sendTest = useCallback(async () => {
    const title = intl.formatMessage({
      description: "Notification - test notification title",
      defaultMessage: "Klart notifications work",
      id: "4AtZHJ",
    });
    const body = intl.formatMessage({
      description: "Notification - test notification body",
      defaultMessage: "Reminders and daily summaries will look like this.",
      id: "+ADCPh",
    });
    if (permission === "granted") {
      await showSystemNotification({ title, body, tag: "test" });
    } else {
      toast(title, { description: body });
    }
  }, [intl, permission]);

  return {
    settings,
    permission,
    requestPermission,
    sendTest,
    update: (patch) => setSettings((current) => ({ ...current, ...patch })),
    updateContext: (contextId, patch) =>
      setSettings((current) => ({
        ...current,
        contexts: { ...current.contexts, [contextId]: { ...getContextNotifications(current, contextId), ...patch } },
      })),
  };
}
