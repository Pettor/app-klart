import { useIntl } from "react-intl";
import type { AutomationKind } from "~/core/automations/Automations";

export const AUTOMATION_KINDS: AutomationKind[] = ["command", "webhook", "request"];

export interface AutomationKindText {
  labels: Record<AutomationKind, string>;
  help: Record<AutomationKind, string>;
}

/** The name and one-line help of each automation kind; shell commands only run in the desktop app. */
export function useAutomationKindText(isDesktop: boolean): AutomationKindText {
  const intl = useIntl();
  return {
    labels: {
      command: intl.formatMessage({
        description: "SettingsAutomations - automation kind: run a shell command",
        defaultMessage: "Shell command",
        id: "sN/Yd2",
      }),
      webhook: intl.formatMessage({
        description: "SettingsAutomations - automation kind: POST to a URL",
        defaultMessage: "Webhook",
        id: "f3oY9f",
      }),
      request: intl.formatMessage({
        description: "SettingsAutomations - automation kind: write a request file to the sync folder",
        defaultMessage: "Request file",
        id: "5tPbi2",
      }),
    },
    help: {
      command: isDesktop
        ? intl.formatMessage({
            description: "SettingsAutomations - help for shell commands in the desktop app",
            defaultMessage:
              'Runs in your login shell, in the primary sync\'s folder when it has one. E.g. claude -p "/daily-todo".',
            id: "ntvAj5",
          })
        : intl.formatMessage({
            description: "SettingsAutomations - shell commands are skipped in the browser",
            defaultMessage: "Desktop app only. Skipped here.",
            id: "qJ99Y7",
          }),
      webhook: intl.formatMessage({
        description: "SettingsAutomations - help for webhooks",
        defaultMessage:
          "Sends a JSON POST with the automation's name, today's date and this device. In a browser the server must allow CORS.",
        id: "QVvFxC",
      }),
      request: intl.formatMessage({
        description: "SettingsAutomations - help for request files",
        defaultMessage:
          "Writes a JSON file to requests/ in the primary sync. Your script or watcher handles it, then deletes the file. It matches on the exact name, so rename both together.",
        id: "F6MSZq",
      }),
    },
  };
}
