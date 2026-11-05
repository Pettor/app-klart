import type { FocusEvent, ReactElement } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Button, Input, Label, ListBox, Select, Switch, TextArea, TextField } from "@heroui/react";
import { useIntl } from "react-intl";
import { SettingsPanel } from "./SettingsSectionShell";
import { SettingsSwitchRow } from "./SettingsSwitchRow";
import type { Automation, AutomationKind } from "~/core/automations/Automations";

export interface SettingsAutomationsPanelProps {
  showButton: boolean;
  onShowButtonChange: (value: boolean) => void;
  automations: Automation[];
  /** Shell commands only run in the desktop app. */
  isDesktop: boolean;
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<Automation>) => void;
  onRemove: (id: string) => void;
}

const KINDS: AutomationKind[] = ["command", "webhook", "request"];

function blurValue(event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>): string {
  return event.target.value;
}

export function SettingsAutomationsPanel({
  showButton,
  onShowButtonChange,
  automations,
  isDesktop,
  onAdd,
  onUpdate,
  onRemove,
}: SettingsAutomationsPanelProps): ReactElement {
  const intl = useIntl();

  const kindLabels: Record<AutomationKind, string> = {
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
  };

  const kindHelp: Record<AutomationKind, string> = {
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
        "Writes a JSON file to requests/ in the primary sync. Your script or watcher handles it, then deletes the file.",
      id: "QuGE3V",
    }),
  };

  return (
    <div className="flex flex-col gap-3" data-testid="settings__automations">
      <h2 className="mt-2 text-lg font-semibold">
        {intl.formatMessage({
          description: "SettingsAutomations - heading",
          defaultMessage: "Automations",
          id: "yXkpYC",
        })}
      </h2>
      <SettingsPanel>
        <SettingsSwitchRow
          label={intl.formatMessage({
            description: "SettingsAutomations - toggle showing the Run button in My Day",
            defaultMessage: "Show a Run button in My Day",
            id: "EXVJxi",
          })}
          description={intl.formatMessage({
            description: "SettingsAutomations - explains the Run button",
            defaultMessage:
              "Runs every enabled automation below, e.g. a script that collects today's tasks, then syncs. Kept on this device only.",
            id: "cVz0t4",
          })}
          isSelected={showButton}
          onChange={onShowButtonChange}
          testId="settings__automations-toggle"
        />
      </SettingsPanel>

      {showButton &&
        automations.map((automation) => (
          <SettingsPanel key={automation.id} className="gap-3 p-4">
            <div className="flex flex-wrap items-end gap-3">
              <TextField className="flex min-w-48 flex-1 flex-col gap-1">
                <Label className="text-muted text-xs">
                  {intl.formatMessage({
                    description: "SettingsAutomations - automation name field",
                    defaultMessage: "Name",
                    id: "MS5zvZ",
                  })}
                </Label>
                <Input
                  defaultValue={automation.name}
                  onBlur={(event) => onUpdate(automation.id, { name: blurValue(event).trim() || automation.name })}
                />
              </TextField>
              <Select
                aria-label={intl.formatMessage({
                  description: "SettingsAutomations - aria-label of the automation kind picker",
                  defaultMessage: "Kind",
                  id: "tiJo9b",
                })}
                value={automation.kind}
                onChange={(key) => key && onUpdate(automation.id, { kind: key as AutomationKind })}
                className="w-44"
              >
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {KINDS.map((kind) => (
                      <ListBox.Item key={kind} id={kind} textValue={kindLabels[kind]}>
                        {kindLabels[kind]}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
              <Switch
                isSelected={automation.enabled}
                onChange={(enabled) => onUpdate(automation.id, { enabled })}
                aria-label={intl.formatMessage({
                  description: "SettingsAutomations - aria-label of the switch enabling one automation",
                  defaultMessage: "Enabled",
                  id: "5wc2kP",
                })}
                className="h-10"
              >
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch>
              <Button
                isIconOnly
                variant="ghost"
                onPress={() => onRemove(automation.id)}
                aria-label={intl.formatMessage({
                  description: "SettingsAutomations - aria-label of the button removing an automation",
                  defaultMessage: "Remove automation",
                  id: "QejCBg",
                })}
              >
                <TrashIcon className="size-4" />
              </Button>
            </div>

            {automation.kind === "command" && (
              <TextField className="flex flex-col gap-1">
                <Label className="text-muted text-xs">
                  {intl.formatMessage({
                    description: "SettingsAutomations - shell command field",
                    defaultMessage: "Command",
                    id: "iNciwd",
                  })}
                </Label>
                <Input
                  defaultValue={automation.command}
                  className="font-mono"
                  placeholder="./collect-tasks.sh"
                  onBlur={(event) => onUpdate(automation.id, { command: blurValue(event) })}
                  data-testid="settings__automation-command"
                />
              </TextField>
            )}
            {automation.kind === "webhook" && (
              <>
                <TextField className="flex flex-col gap-1">
                  <Label className="text-muted text-xs">
                    {intl.formatMessage({
                      description: "SettingsAutomations - webhook URL field",
                      defaultMessage: "URL",
                      id: "EP2UzU",
                    })}
                  </Label>
                  <Input
                    type="url"
                    defaultValue={automation.url}
                    className="font-mono"
                    placeholder="https://"
                    onBlur={(event) => onUpdate(automation.id, { url: blurValue(event).trim() })}
                  />
                </TextField>
                <TextField className="flex flex-col gap-1">
                  <Label className="text-muted text-xs">
                    {intl.formatMessage({
                      description: "SettingsAutomations - webhook headers field, one Key: value per line",
                      defaultMessage: "Headers (one Key: value per line)",
                      id: "bJoWSV",
                    })}
                  </Label>
                  <TextArea
                    defaultValue={automation.headers}
                    rows={2}
                    className="font-mono"
                    placeholder="Authorization: Bearer …"
                    onBlur={(event) => onUpdate(automation.id, { headers: blurValue(event) })}
                  />
                </TextField>
              </>
            )}
            <p className="text-muted text-xs">{kindHelp[automation.kind]}</p>
          </SettingsPanel>
        ))}

      {showButton && (
        <Button variant="secondary" onPress={onAdd} className="self-start" data-testid="settings__add-automation">
          <PlusIcon className="size-4" aria-hidden />
          {intl.formatMessage({
            description: "SettingsAutomations - button adding an automation",
            defaultMessage: "Add automation",
            id: "J7nQ9D",
          })}
        </Button>
      )}
    </div>
  );
}
