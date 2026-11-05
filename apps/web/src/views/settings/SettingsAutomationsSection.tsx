import type { ReactElement } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Button } from "@heroui/react";
import { useIntl } from "react-intl";
import { SettingsAutomationEditor } from "./SettingsAutomationEditor";
import { SettingsAutomationRow } from "./SettingsAutomationRow";
import { SettingsPanel, SettingsSectionShell } from "./SettingsSectionShell";
import { SettingsSwitchRow } from "./SettingsSwitchRow";
import { useAutomationKindText } from "./UseAutomationKindText";
import type { AutomationDraft } from "./UseSettingsAutomationsSection";
import { NEW_AUTOMATION, useSettingsAutomationsSection } from "./UseSettingsAutomationsSection";
import type { Automation } from "~/core/automations/Automations";

export interface SettingsAutomationsSectionProps {
  title: string;
  showButton: boolean;
  onShowButtonChange: (value: boolean) => void;
  automations: Automation[];
  /** Shell commands only run in the desktop app. */
  isDesktop: boolean;
  onAdd: (automation: AutomationDraft) => void;
  onUpdate: (id: string, patch: Partial<Automation>) => void;
  onRemove: (id: string) => void;
}

export function SettingsAutomationsSection({
  title,
  showButton,
  onShowButtonChange,
  automations,
  isDesktop,
  onAdd,
  onUpdate,
  onRemove,
}: SettingsAutomationsSectionProps): ReactElement {
  const intl = useIntl();
  const kindText = useAutomationKindText(isDesktop);
  const editor = useSettingsAutomationsSection({ isDesktop, onAdd, onUpdate });

  const editorPanel = (
    <SettingsAutomationEditor
      draft={editor.draft}
      kindText={kindText}
      canSave={editor.canSave}
      onChange={editor.changeDraft}
      onSave={editor.save}
      onCancel={editor.cancel}
    />
  );

  return (
    <SettingsSectionShell
      id="automations"
      title={title}
      description={intl.formatMessage({
        description: "SettingsAutomations - section intro",
        defaultMessage:
          "Run your own scripts, webhooks or request-file handlers from My Day, e.g. to collect today's tasks.",
        id: "JmknoE",
      })}
    >
      <div className="flex flex-col gap-3" data-testid="settings__automations">
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
          automations.map((automation) =>
            editor.editingId === automation.id ? (
              <div key={automation.id}>{editorPanel}</div>
            ) : (
              <SettingsAutomationRow
                key={automation.id}
                automation={automation}
                kindLabel={kindText.labels[automation.kind]}
                onEnabledChange={(enabled) => onUpdate(automation.id, { enabled })}
                onEdit={() => editor.startEdit(automation)}
                onRemove={() => onRemove(automation.id)}
              />
            )
          )}

        {showButton && editor.editingId === NEW_AUTOMATION && editorPanel}
        {showButton && editor.editingId !== NEW_AUTOMATION && (
          <Button
            variant="secondary"
            onPress={editor.startAdd}
            className="self-start"
            data-testid="settings__add-automation"
          >
            <PlusIcon className="size-4" aria-hidden />
            {intl.formatMessage({
              description: "SettingsAutomations - button adding an automation",
              defaultMessage: "Add automation",
              id: "J7nQ9D",
            })}
          </Button>
        )}
      </div>
    </SettingsSectionShell>
  );
}
