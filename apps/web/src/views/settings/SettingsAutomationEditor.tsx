import type { ReactElement } from "react";
import { Button, Input, Label, ListBox, Select, TextArea, TextField } from "@heroui/react";
import { useIntl } from "react-intl";
import { SettingsPanel } from "./SettingsSectionShell";
import { AUTOMATION_KINDS, type AutomationKindText } from "./UseAutomationKindText";
import type { AutomationDraft } from "./UseSettingsAutomationsSection";
import type { AutomationKind } from "~/core/automations/Automations";

export interface SettingsAutomationEditorProps {
  draft: AutomationDraft;
  kindText: AutomationKindText;
  canSave: boolean;
  onChange: (patch: Partial<AutomationDraft>) => void;
  onSave: () => void;
  onCancel: () => void;
}

/** The form for a new or edited automation; nothing is stored until Save. */
export function SettingsAutomationEditor({
  draft,
  kindText,
  canSave,
  onChange,
  onSave,
  onCancel,
}: SettingsAutomationEditorProps): ReactElement {
  const intl = useIntl();

  return (
    <SettingsPanel className="gap-3 p-4">
      <form
        className="flex flex-col gap-3"
        data-testid="settings__automation-editor"
        onSubmit={(event) => {
          event.preventDefault();
          onSave();
        }}
      >
        <div className="flex flex-wrap items-end gap-3">
          <TextField
            value={draft.name}
            onChange={(name) => onChange({ name })}
            isRequired
            className="flex min-w-48 flex-1 flex-col gap-1"
          >
            <Label className="text-muted text-xs">
              {intl.formatMessage({
                description: "SettingsAutomations - automation name field",
                defaultMessage: "Name",
                id: "MS5zvZ",
              })}
            </Label>
            <Input
              autoFocus
              placeholder={intl.formatMessage({
                description: "SettingsAutomations - placeholder of a new automation's name",
                defaultMessage: "Collect today's tasks",
                id: "obo/f1",
              })}
              data-testid="settings__automation-name-input"
            />
          </TextField>
          <Select
            aria-label={intl.formatMessage({
              description: "SettingsAutomations - aria-label of the automation kind picker",
              defaultMessage: "Kind",
              id: "tiJo9b",
            })}
            value={draft.kind}
            onChange={(key) => key && onChange({ kind: key as AutomationKind })}
            className="w-44"
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {AUTOMATION_KINDS.map((kind) => (
                  <ListBox.Item key={kind} id={kind} textValue={kindText.labels[kind]}>
                    {kindText.labels[kind]}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </div>

        {draft.kind === "command" && (
          <TextField
            value={draft.command ?? ""}
            onChange={(command) => onChange({ command })}
            className="flex flex-col gap-1"
          >
            <Label className="text-muted text-xs">
              {intl.formatMessage({
                description: "SettingsAutomations - shell command field",
                defaultMessage: "Command",
                id: "iNciwd",
              })}
            </Label>
            <Input className="font-mono" placeholder="./collect-tasks.sh" data-testid="settings__automation-command" />
          </TextField>
        )}
        {draft.kind === "webhook" && (
          <>
            <TextField
              type="url"
              value={draft.url ?? ""}
              onChange={(url) => onChange({ url })}
              className="flex flex-col gap-1"
            >
              <Label className="text-muted text-xs">
                {intl.formatMessage({
                  description: "SettingsAutomations - webhook URL field",
                  defaultMessage: "URL",
                  id: "EP2UzU",
                })}
              </Label>
              <Input className="font-mono" placeholder="https://" />
            </TextField>
            <TextField
              value={draft.headers ?? ""}
              onChange={(headers) => onChange({ headers })}
              className="flex flex-col gap-1"
            >
              <Label className="text-muted text-xs">
                {intl.formatMessage({
                  description: "SettingsAutomations - webhook headers field, one Key: value per line",
                  defaultMessage: "Headers (one Key: value per line)",
                  id: "bJoWSV",
                })}
              </Label>
              <TextArea rows={2} className="font-mono" placeholder="Authorization: Bearer …" />
            </TextField>
          </>
        )}
        <p className="text-muted text-xs">{kindText.help[draft.kind]}</p>

        <div className="flex gap-2">
          <Button type="submit" isDisabled={!canSave} data-testid="settings__automation-save">
            {intl.formatMessage({
              description: "SettingsAutomations - button saving the automation being edited",
              defaultMessage: "Save",
              id: "LlJHjg",
            })}
          </Button>
          <Button variant="ghost" onPress={onCancel} data-testid="settings__automation-cancel">
            {intl.formatMessage({
              description: "SettingsAutomations - button discarding changes to the automation being edited",
              defaultMessage: "Cancel",
              id: "3oIxa0",
            })}
          </Button>
        </div>
      </form>
    </SettingsPanel>
  );
}
