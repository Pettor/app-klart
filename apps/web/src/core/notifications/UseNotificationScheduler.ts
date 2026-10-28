import { useEffect, useRef } from "react";
import { toast } from "@heroui/react";
import { useAtom, useAtomValue } from "jotai";
import type { IntlShape } from "react-intl";
import { useIntl } from "react-intl";
import { notificationPermissionAtom, notificationSettingsAtom, sentNotificationsAtom } from "./NotificationAtoms";
import type { PlannedNotification } from "./NotificationPlanner";
import { planNotifications } from "./NotificationPlanner";
import type { NotificationContent } from "./ShowNotification";
import { showSystemNotification } from "./ShowNotification";
import { toDeviceId } from "~/core/sync/FolderSync";
import { syncDevicesAtom, syncSettingsAtom } from "~/core/sync/SyncAtoms";
import { klartDataAtom } from "~/core/tasks/KlartAtoms";

const CHECK_INTERVAL_MS = 20_000;
const SENT_RETENTION_DAYS = 14;

export function describeNotification(intl: IntlShape, notification: PlannedNotification): NotificationContent {
  const tag = notification.key;
  switch (notification.kind) {
    case "reminder":
      // Android truncates the title to share its row with the site and time, so the task title goes in the body.
      return {
        tag,
        title: intl.formatMessage({
          description: "Notification - task reminder title",
          defaultMessage: "Reminder",
          id: "rRaPrP",
        }),
        body: intl.formatMessage(
          {
            description: "Notification - task reminder body: the task title, then its tags on a new line",
            defaultMessage: "{title}{tags, select, none {} other {\n{tags}}}",
            id: "v5qaLP",
          },
          { title: notification.task.title, tags: notification.task.tags.map((name) => `#${name}`).join(" ") || "none" }
        ),
      };
    case "plan-day":
      return {
        tag,
        title: intl.formatMessage({
          description: "Notification - plan your day title",
          defaultMessage: "Plan your day",
          id: "udA6c9",
        }),
        body: intl.formatMessage(
          {
            description: "Notification - plan your day summary",
            defaultMessage:
              "{overdue} overdue, {dueToday} due today, {left} left from yesterday. {suggestions, plural, one {# suggestion} other {# suggestions}} ready.",
            id: "H7SYbk",
          },
          {
            overdue: notification.overdue,
            dueToday: notification.dueToday,
            left: notification.leftFromYesterday,
            suggestions: notification.suggestions,
          }
        ),
      };
    case "due-today":
      return {
        tag,
        title: intl.formatMessage(
          {
            description: "Notification - due today title",
            defaultMessage: "{count, plural, one {# task} other {# tasks}} due today",
            id: "rsbgwT",
          },
          { count: notification.tasks.length }
        ),
        body: notification.tasks.map((task) => task.title).join(", "),
      };
    case "overdue":
      return {
        tag,
        title: intl.formatMessage(
          {
            description: "Notification - overdue title",
            defaultMessage: "{count, plural, one {Overdue} other {# tasks overdue}}",
            id: "cEqUlf",
          },
          { count: notification.tasks.length }
        ),
        body: intl.formatMessage(
          {
            description: "Notification - overdue body: the oldest task title first",
            defaultMessage:
              "{title}{more, plural, =0 {} other { and # more}}\nOldest due {date}. Add them to My Day or move them.",
            id: "INm7TT",
          },
          {
            title: notification.tasks[0]!.title,
            more: notification.tasks.length - 1,
            date: intl.formatDate(`${notification.tasks[0]!.due}T12:00:00`, {
              weekday: "short",
              day: "numeric",
              month: "short",
            }),
          }
        ),
      };
    case "wrap-up":
      return {
        tag,
        title: intl.formatMessage(
          {
            description: "Notification - end of day wrap-up title",
            defaultMessage: "{count, plural, one {# task} other {# tasks}} still open in My Day",
            id: "ppggA3",
          },
          { count: notification.tasks.length }
        ),
        body: intl.formatMessage({
          description: "Notification - end of day wrap-up body",
          defaultMessage: 'They\'ll show under "Left from yesterday" tomorrow morning.',
          id: "/xAWk9",
        }),
      };
  }
}

/** Checks every few seconds for reminders and daily summaries, and shows them. Mount once. */
export function useNotificationScheduler(): void {
  const intl = useIntl();
  const data = useAtomValue(klartDataAtom);
  const settings = useAtomValue(notificationSettingsAtom);
  const permission = useAtomValue(notificationPermissionAtom);
  const devices = useAtomValue(syncDevicesAtom);
  const { deviceName } = useAtomValue(syncSettingsAtom);
  const [sent, setSent] = useAtom(sentNotificationsAtom);

  const stateRef = useRef({ intl, data, settings, permission, devices, deviceName, sent });
  stateRef.current = { intl, data, settings, permission, devices, deviceName, sent };

  useEffect(() => {
    function check(): void {
      const current = stateRef.current;
      const policy = current.settings.devicePolicy;
      const isLastUsed = current.devices.length === 0 || current.devices[0]!.id === toDeviceId(current.deviceName);
      if (policy === "never" || (policy === "last-used" && !isLastUsed)) {
        return;
      }

      const now = new Date();
      const due = planNotifications({
        now,
        data: current.data,
        settings: current.settings,
        sent: new Set(Object.keys(current.sent)),
      });
      if (due.length === 0) {
        return;
      }

      for (const notification of due) {
        const content = describeNotification(current.intl, notification);
        if (current.permission === "granted") {
          void showSystemNotification(content).catch(() => toast(content.title, { description: content.body }));
        } else {
          toast(content.title, { description: content.body });
        }
      }

      const cutoff = now.getTime() - SENT_RETENTION_DAYS * 86_400_000;
      setSent((previous) => {
        const next: Record<string, string> = {};
        for (const [key, at] of Object.entries(previous)) {
          if (Date.parse(at) >= cutoff) {
            next[key] = at;
          }
        }
        for (const notification of due) {
          next[notification.key] = now.toISOString();
        }
        return next;
      });
    }

    check();
    const timer = window.setInterval(check, CHECK_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [setSent]);
}
