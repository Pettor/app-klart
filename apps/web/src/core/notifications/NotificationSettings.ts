export interface TimedNotificationSetting {
  enabled: boolean;
  /** Local time `HH:MM`. */
  time: string;
}

export interface ContextNotificationSetting {
  enabled: boolean;
  /** Local time `HH:MM`; notifications outside the window wait until it opens. */
  from: string;
  to: string;
  weekdaysOnly: boolean;
}

/** Which device rings when the same data folder is open on several. */
export type NotifyDevicePolicy = "last-used" | "always" | "never";

export interface NotificationSettings {
  planDay: TimedNotificationSetting;
  reminders: { enabled: boolean };
  dueToday: TimedNotificationSetting;
  overdue: TimedNotificationSetting;
  wrapUp: TimedNotificationSetting;
  contexts: Record<string, ContextNotificationSetting>;
  devicePolicy: NotifyDevicePolicy;
}

export const DEFAULT_CONTEXT_NOTIFICATIONS: ContextNotificationSetting = {
  enabled: true,
  from: "07:00",
  to: "21:30",
  weekdaysOnly: false,
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  planDay: { enabled: true, time: "08:00" },
  reminders: { enabled: true },
  dueToday: { enabled: true, time: "13:00" },
  overdue: { enabled: true, time: "10:00" },
  wrapUp: { enabled: true, time: "17:00" },
  contexts: {},
  devicePolicy: "last-used",
};

export function getContextNotifications(settings: NotificationSettings, contextId: string): ContextNotificationSetting {
  return settings.contexts[contextId] ?? DEFAULT_CONTEXT_NOTIFICATIONS;
}
