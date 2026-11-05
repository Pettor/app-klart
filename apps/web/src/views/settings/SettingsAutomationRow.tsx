import type { ReactElement } from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Button, Switch } from "@heroui/react";
import { useIntl } from "react-intl";
import { SettingsPanel } from "./SettingsSectionShell";
import type { Automation } from "~/core/automations/Automations";

export interface SettingsAutomationRowProps {
  automation: Automation;
  kindLabel: string;
  onEnabledChange: (enabled: boolean) => void;
  onEdit: () => void;
  onRemove: () => void;
}

/** A saved automation, read-only: changing it goes through Edit. */
export function SettingsAutomationRow({
  automation,
  kindLabel,
  onEnabledChange,
  onEdit,
  onRemove,
}: SettingsAutomationRowProps): ReactElement {
  const intl = useIntl();
  const target = automation.kind === "command" ? automation.command : automation.kind === "webhook" && automation.url;

  return (
    <SettingsPanel className="p-4">
      <div className="flex items-center gap-3" data-testid={`settings__automation-${automation.id}`}>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate font-medium" data-testid="settings__automation-name">
            {automation.name}
          </span>
          <span className="text-muted flex min-w-0 gap-1.5 text-xs">
            <span className="shrink-0">{kindLabel}</span>
            {target && <code className="truncate font-mono">{target}</code>}
          </span>
        </div>
        <Switch
          isSelected={automation.enabled}
          onChange={onEnabledChange}
          aria-label={intl.formatMessage({
            description: "SettingsAutomations - aria-label of the switch enabling one automation",
            defaultMessage: "Enabled",
            id: "5wc2kP",
          })}
        >
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
        </Switch>
        <Button
          isIconOnly
          variant="ghost"
          onPress={onEdit}
          data-testid="settings__automation-edit"
          aria-label={intl.formatMessage({
            description: "SettingsAutomations - aria-label of the button editing an automation",
            defaultMessage: "Edit automation",
            id: "Bpwhaw",
          })}
        >
          <PencilSquareIcon className="size-4" />
        </Button>
        <Button
          isIconOnly
          variant="ghost"
          onPress={onRemove}
          aria-label={intl.formatMessage({
            description: "SettingsAutomations - aria-label of the button removing an automation",
            defaultMessage: "Remove automation",
            id: "QejCBg",
          })}
        >
          <TrashIcon className="size-4" />
        </Button>
      </div>
    </SettingsPanel>
  );
}
