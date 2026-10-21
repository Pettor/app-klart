import type { ChangeEvent, ReactElement } from "react";
import { Button, Checkbox, Input, Label, Radio, RadioGroup, Switch } from "@heroui/react";
import clsx from "clsx";
import type { IntlShape } from "react-intl";
import { useIntl } from "react-intl";
import { SettingsPanel, SettingsSectionShell } from "./SettingsSectionShell";
import { SettingsSwitchRow } from "./SettingsSwitchRow";
import type { ContextColor } from "~/core/contexts/KlartContext";
import type {
  ContextNotificationSetting,
  NotificationSettings,
  NotifyDevicePolicy,
  TimedNotificationSetting,
} from "~/core/notifications/NotificationSettings";

type TimedKey = "planDay" | "dueToday" | "overdue" | "wrapUp";

export interface SettingsNotificationContext {
  id: string;
  name: string;
  color: ContextColor;
  setting: ContextNotificationSetting;
}

export interface SettingsNotificationsSectionProps {
  settings: NotificationSettings;
  contexts: SettingsNotificationContext[];
  permission: NotificationPermission | "unsupported";
  onRequestPermission: () => void;
  onSendTest: () => void;
  onChange: (patch: Partial<NotificationSettings>) => void;
  onContextChange: (contextId: string, patch: Partial<ContextNotificationSetting>) => void;
}

function TimeInput({
  value,
  label,
  onChange,
  isDisabled,
}: {
  value: string;
  label: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
}): ReactElement {
  return (
    <Input
      type="time"
      aria-label={label}
      value={value}
      disabled={isDisabled}
      onChange={(event: ChangeEvent<HTMLInputElement>) => event.target.value && onChange(event.target.value)}
      className="w-28 font-mono"
    />
  );
}

function getPermissionText(intl: IntlShape, permission: SettingsNotificationsSectionProps["permission"]): string {
  switch (permission) {
    case "granted":
      return intl.formatMessage({
        description: "SettingsNotifications - permission status",
        defaultMessage: "System permission: allowed",
        id: "W/lGJP",
      });
    case "denied":
      return intl.formatMessage({
        description: "SettingsNotifications - permission status",
        defaultMessage: "System permission: blocked. Allow notifications for this site in the browser's settings.",
        id: "jhtFJn",
      });
    case "default":
      return intl.formatMessage({
        description: "SettingsNotifications - permission status",
        defaultMessage: "System permission: not asked yet. Until then, notifications show inside Klart.",
        id: "pr9TL9",
      });
    case "unsupported":
      return intl.formatMessage({
        description: "SettingsNotifications - permission status",
        defaultMessage: "This browser has no system notifications; they show inside Klart.",
        id: "Uz23D5",
      });
  }
}

export function SettingsNotificationsSection({
  settings,
  contexts,
  permission,
  onRequestPermission,
  onSendTest,
  onChange,
  onContextChange,
}: SettingsNotificationsSectionProps): ReactElement {
  const intl = useIntl();

  const timed: { key: TimedKey; label: string; description: string }[] = [
    {
      key: "planDay",
      label: intl.formatMessage({
        description: "SettingsNotifications - daily notification",
        defaultMessage: "Plan your day",
        id: "KYzVDy",
      }),
      description: intl.formatMessage({
        description: "SettingsNotifications - daily notification help",
        defaultMessage: "Summary of suggestions",
        id: "V1eapi",
      }),
    },
    {
      key: "dueToday",
      label: intl.formatMessage({
        description: "SettingsNotifications - daily notification",
        defaultMessage: "Due today without a time",
        id: "t7cWfg",
      }),
      description: intl.formatMessage({
        description: "SettingsNotifications - daily notification help",
        defaultMessage: "One grouped reminder",
        id: "ALq3SS",
      }),
    },
    {
      key: "overdue",
      label: intl.formatMessage({
        description: "SettingsNotifications - daily notification",
        defaultMessage: "Overdue nudge",
        id: "1PtF/d",
      }),
      description: intl.formatMessage({
        description: "SettingsNotifications - daily notification help",
        defaultMessage: "Grouped, once a day",
        id: "/m+/pp",
      }),
    },
    {
      key: "wrapUp",
      label: intl.formatMessage({
        description: "SettingsNotifications - daily notification",
        defaultMessage: "End of day wrap-up",
        id: "3ekmGD",
      }),
      description: intl.formatMessage({
        description: "SettingsNotifications - daily notification help",
        defaultMessage: "What's left in My Day",
        id: "YPZsk7",
      }),
    },
  ];

  function updateTimed(key: TimedKey, patch: Partial<TimedNotificationSetting>): void {
    onChange({ [key]: { ...settings[key], ...patch } });
  }

  const policies: { value: NotifyDevicePolicy; label: string; description?: string }[] = [
    {
      value: "last-used",
      label: intl.formatMessage({
        description: "SettingsNotifications - device policy",
        defaultMessage: "When this is the device I used last",
        id: "/TGjzG",
      }),
      description: intl.formatMessage({
        description: "SettingsNotifications - device policy help",
        defaultMessage: "Recommended. Others stay quiet.",
        id: "8z+Q5P",
      }),
    },
    {
      value: "always",
      label: intl.formatMessage({
        description: "SettingsNotifications - device policy",
        defaultMessage: "Always on this device",
        id: "+pkKfQ",
      }),
    },
    {
      value: "never",
      label: intl.formatMessage({
        description: "SettingsNotifications - device policy",
        defaultMessage: "Never on this device",
        id: "5lqu5D",
      }),
    },
  ];

  return (
    <SettingsSectionShell
      id="notifications"
      title={intl.formatMessage({
        description: "SettingsNotifications - section heading",
        defaultMessage: "Notifications",
        id: "+c4ctZ",
      })}
      description={intl.formatMessage({
        description: "SettingsNotifications - section intro",
        defaultMessage: "Klart sends reminders and daily summaries while it's open in a tab or installed as an app.",
        id: "1KKzkV",
      })}
    >
      <div className="bg-surface flex flex-wrap items-center gap-3 rounded-xl p-[18px]">
        {permission === "default" && (
          <Button onPress={onRequestPermission} data-testid="settings__allow-notifications">
            {intl.formatMessage({
              description: "SettingsNotifications - ask for permission",
              defaultMessage: "Allow notifications",
              id: "DTUoLI",
            })}
          </Button>
        )}
        <Button variant="secondary" onPress={onSendTest}>
          {intl.formatMessage({
            description: "SettingsNotifications - send a test",
            defaultMessage: "Send test notification",
            id: "U49Qgl",
          })}
        </Button>
        <span className={clsx("text-[13px]", permission === "granted" ? "text-success" : "text-muted")}>
          {getPermissionText(intl, permission)}
        </span>
      </div>

      <SettingsPanel>
        <SettingsSwitchRow
          label={timed[0]!.label}
          description={timed[0]!.description}
          isSelected={settings.planDay.enabled}
          onChange={(enabled) => updateTimed("planDay", { enabled })}
        >
          <TimeInput
            value={settings.planDay.time}
            label={timed[0]!.label}
            onChange={(time) => updateTimed("planDay", { time })}
          />
        </SettingsSwitchRow>
        <SettingsSwitchRow
          label={intl.formatMessage({
            description: "SettingsNotifications - reminders toggle",
            defaultMessage: "Task reminders",
            id: "fLQrNK",
          })}
          description={intl.formatMessage({
            description: "SettingsNotifications - reminders toggle help",
            defaultMessage: "At the time set with ^, e.g. ^14:00",
            id: "bRcCEP",
          })}
          isSelected={settings.reminders.enabled}
          onChange={(enabled) => onChange({ reminders: { enabled } })}
        />
        {timed.slice(1).map((row) => (
          <SettingsSwitchRow
            key={row.key}
            label={row.label}
            description={row.description}
            isSelected={settings[row.key].enabled}
            onChange={(enabled) => updateTimed(row.key, { enabled })}
          >
            <TimeInput
              value={settings[row.key].time}
              label={row.label}
              onChange={(time) => updateTimed(row.key, { time })}
            />
          </SettingsSwitchRow>
        ))}
      </SettingsPanel>

      <SettingsPanel>
        <div className="flex flex-col gap-0.5 px-[18px] py-3.5">
          <span className="font-semibold">
            {intl.formatMessage({
              description: "SettingsNotifications - per-context hours heading",
              defaultMessage: "Per context",
              id: "72QzgD",
            })}
          </span>
          <span className="text-muted text-xs">
            {intl.formatMessage({
              description: "SettingsNotifications - per-context hours help",
              defaultMessage: "Outside these hours, notifications for that context wait until the window opens.",
              id: "RbSFhD",
            })}
          </span>
        </div>
        {contexts.map((context) => (
          <div
            key={context.id}
            className={clsx(`ctx-${context.color}`, "flex flex-wrap items-center gap-3 px-[18px] py-3")}
          >
            <Switch
              isSelected={context.setting.enabled}
              onChange={(enabled) => onContextChange(context.id, { enabled })}
              className="min-w-36 flex-1"
            >
              <Switch.Content className="flex items-center gap-2">
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
                <span className="size-2 rounded-full bg-(--ctx)" aria-hidden />
                <Label className="font-normal">{context.name}</Label>
              </Switch.Content>
            </Switch>
            <TimeInput
              value={context.setting.from}
              isDisabled={!context.setting.enabled}
              label={intl.formatMessage(
                {
                  description: "SettingsNotifications - start of a context's notification hours",
                  defaultMessage: "{name} from",
                  id: "Scgp6G",
                },
                { name: context.name }
              )}
              onChange={(from) => onContextChange(context.id, { from })}
            />
            <span className="text-muted" aria-hidden>
              –
            </span>
            <TimeInput
              value={context.setting.to}
              isDisabled={!context.setting.enabled}
              label={intl.formatMessage(
                {
                  description: "SettingsNotifications - end of a context's notification hours",
                  defaultMessage: "{name} until",
                  id: "8XLw8S",
                },
                { name: context.name }
              )}
              onChange={(to) => onContextChange(context.id, { to })}
            />
            <Checkbox
              isSelected={context.setting.weekdaysOnly}
              isDisabled={!context.setting.enabled}
              onChange={(weekdaysOnly) => onContextChange(context.id, { weekdaysOnly })}
            >
              <Checkbox.Content>
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                {intl.formatMessage({
                  description: "SettingsNotifications - only notify Monday to Friday",
                  defaultMessage: "Mon–Fri",
                  id: "nBzTqu",
                })}
              </Checkbox.Content>
            </Checkbox>
          </div>
        ))}
      </SettingsPanel>

      <div className="bg-surface flex flex-col gap-2 rounded-xl p-[18px]">
        <span className="font-semibold">
          {intl.formatMessage({
            description: "SettingsNotifications - device policy heading",
            defaultMessage: "With several devices",
            id: "0ks585",
          })}
        </span>
        <span className="text-muted text-[13px]">
          {intl.formatMessage({
            description: "SettingsNotifications - device policy intro",
            defaultMessage: "When the same sync folder is open on more than one device, Klart decides who rings.",
            id: "pr1eHP",
          })}
        </span>
        <RadioGroup
          value={settings.devicePolicy}
          onChange={(value) => onChange({ devicePolicy: value as NotifyDevicePolicy })}
          aria-label={intl.formatMessage({
            description: "SettingsNotifications - device policy picker",
            defaultMessage: "Which device notifies",
            id: "WWwfvR",
          })}
          className="flex flex-col gap-2"
        >
          {policies.map((policy) => (
            <Radio key={policy.value} value={policy.value}>
              <Radio.Content>
                <Radio.Control>
                  <Radio.Indicator />
                </Radio.Control>
                <span className="flex flex-col">
                  <span>{policy.label}</span>
                  {policy.description && <span className="text-muted text-xs">{policy.description}</span>}
                </span>
              </Radio.Content>
            </Radio>
          ))}
        </RadioGroup>
      </div>

      <p className="text-muted text-[13px] leading-relaxed">
        {intl.formatMessage(
          {
            description: "SettingsNotifications - explains how agents schedule reminders",
            defaultMessage:
              "Agents schedule a reminder by setting {field} on a task. What was sent is remembered per device, so nothing rings twice.",
            id: "2I7eN4",
          },
          { field: <code className="text-foreground/85 font-mono">remindAt</code> }
        )}
      </p>
    </SettingsSectionShell>
  );
}
