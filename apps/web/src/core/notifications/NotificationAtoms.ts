import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { NotificationSettings } from "./NotificationSettings";
import { DEFAULT_NOTIFICATION_SETTINGS } from "./NotificationSettings";
import { isDesktop } from "~/core/platform/Desktop";

const storedNotificationSettingsAtom = atomWithStorage<NotificationSettings>(
  "klart-notifications",
  DEFAULT_NOTIFICATION_SETTINGS,
  undefined,
  { getOnInit: true }
);

/** The stored settings, with defaults for settings added since they were saved (e.g. `recurring`). */
export const notificationSettingsAtom = atom(
  (get): NotificationSettings => ({ ...DEFAULT_NOTIFICATION_SETTINGS, ...get(storedNotificationSettingsAtom) }),
  (get, set, update: NotificationSettings | ((current: NotificationSettings) => NotificationSettings)) => {
    set(storedNotificationSettingsAtom, typeof update === "function" ? update(get(notificationSettingsAtom)) : update);
  }
);

/** Keys of notifications already shown on this device, with the time they were sent. */
export const sentNotificationsAtom = atomWithStorage<Record<string, string>>("klart-notified", {}, undefined, {
  getOnInit: true,
});

function readPermission(): NotificationPermission | "unsupported" {
  // Desktop apps can always notify; the OS lets the user mute Klart in its own settings.
  if (isDesktop()) {
    return "granted";
  }
  return typeof Notification === "undefined" ? "unsupported" : Notification.permission;
}

export const notificationPermissionAtom = atom<NotificationPermission | "unsupported">(readPermission());
