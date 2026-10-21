import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { NotificationSettings } from "./NotificationSettings";
import { DEFAULT_NOTIFICATION_SETTINGS } from "./NotificationSettings";

export const notificationSettingsAtom = atomWithStorage<NotificationSettings>(
  "klart-notifications",
  DEFAULT_NOTIFICATION_SETTINGS,
  undefined,
  { getOnInit: true }
);

/** Keys of notifications already shown on this device, with the time they were sent. */
export const sentNotificationsAtom = atomWithStorage<Record<string, string>>("klart-notified", {}, undefined, {
  getOnInit: true,
});

function readPermission(): NotificationPermission | "unsupported" {
  return typeof Notification === "undefined" ? "unsupported" : Notification.permission;
}

export const notificationPermissionAtom = atom<NotificationPermission | "unsupported">(readPermission());
