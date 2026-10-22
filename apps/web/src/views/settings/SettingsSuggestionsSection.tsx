import type { ReactElement } from "react";
import { ListBox, Select } from "@heroui/react";
import { useIntl } from "react-intl";
import { SettingsPanel, SettingsSectionShell } from "./SettingsSectionShell";
import { SettingsSwitchRow } from "./SettingsSwitchRow";
import type { SuggestionReason } from "~/core/tasks/Day";
import { SUGGESTION_REASONS } from "~/core/tasks/Day";
import type { SuggestionSettings } from "~/core/tasks/SuggestionSettings";
import { COMING_UP_CHOICES } from "~/core/tasks/SuggestionSettings";

export interface SettingsSuggestionsSectionProps {
  title: string;
  settings: SuggestionSettings;
  onChange: (settings: SuggestionSettings) => void;
}

export function SettingsSuggestionsSection({
  title,
  settings,
  onChange,
}: SettingsSuggestionsSectionProps): ReactElement {
  const intl = useIntl();

  const labels: Record<SuggestionReason, string> = {
    overdue: intl.formatMessage({
      description: "SettingsSuggestions - overdue group",
      defaultMessage: "Overdue",
      id: "nT3NIO",
    }),
    due_today: intl.formatMessage({
      description: "SettingsSuggestions - due today group",
      defaultMessage: "Due today",
      id: "a3Cvbs",
    }),
    left_from_yesterday: intl.formatMessage({
      description: "SettingsSuggestions - left from yesterday group",
      defaultMessage: "Left from yesterday",
      id: "D8GDMP",
    }),
    coming_up: intl.formatMessage({
      description: "SettingsSuggestions - coming up group",
      defaultMessage: "Coming up",
      id: "bdHY+W",
    }),
    related_to_today: intl.formatMessage({
      description: "SettingsSuggestions - related to today group",
      defaultMessage: "Related to today",
      id: "oRa2PW",
    }),
    recently_added: intl.formatMessage({
      description: "SettingsSuggestions - recently added group",
      defaultMessage: "Recently added",
      id: "gS1F/V",
    }),
  };
  const comingUpLabels: Record<(typeof COMING_UP_CHOICES)[number], string> = {
    1: intl.formatMessage({
      description: "SettingsSuggestions - coming up window: tomorrow only",
      defaultMessage: "Tomorrow only",
      id: "XOR5Fr",
    }),
    3: intl.formatMessage({
      description: "SettingsSuggestions - coming up window: three days",
      defaultMessage: "Within 3 days",
      id: "/vk8lM",
    }),
    7: intl.formatMessage({
      description: "SettingsSuggestions - coming up window: a week",
      defaultMessage: "Within a week",
      id: "VStLZw",
    }),
  };
  const windowLabel = intl.formatMessage({
    description: "SettingsSuggestions - aria-label of the coming up window picker",
    defaultMessage: "Coming up within",
    id: "JOAuMi",
  });

  function setEnabled(reason: SuggestionReason, isEnabled: boolean): void {
    const disabled = settings.disabled.filter((other) => other !== reason);
    onChange({ ...settings, disabled: isEnabled ? disabled : [...disabled, reason] });
  }

  return (
    <SettingsSectionShell
      id="suggestions"
      title={title}
      description={intl.formatMessage({
        description: "SettingsSuggestions - intro",
        defaultMessage: "What Klart offers to add to My Day, in this order.",
        id: "Hdxm61",
      })}
    >
      <SettingsPanel>
        {SUGGESTION_REASONS.map((reason) => (
          <SettingsSwitchRow
            key={reason}
            label={labels[reason]}
            description={
              reason === "related_to_today"
                ? intl.formatMessage({
                    description: "SettingsSuggestions - hint for the related to today group",
                    defaultMessage: "Shares a tag with something already in My Day",
                    id: "c4YYwe",
                  })
                : undefined
            }
            isSelected={!settings.disabled.includes(reason)}
            onChange={(isEnabled) => setEnabled(reason, isEnabled)}
            testId={`settings__suggest-${reason}`}
          >
            {reason === "coming_up" && (
              <Select
                aria-label={windowLabel}
                value={String(settings.comingUpDays)}
                onChange={(key) => key && onChange({ ...settings, comingUpDays: Number(key) })}
                isDisabled={settings.disabled.includes("coming_up")}
                className="w-40"
              >
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {COMING_UP_CHOICES.map((days) => (
                      <ListBox.Item key={days} id={String(days)} textValue={comingUpLabels[days]}>
                        {comingUpLabels[days]}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            )}
          </SettingsSwitchRow>
        ))}
      </SettingsPanel>
    </SettingsSectionShell>
  );
}
