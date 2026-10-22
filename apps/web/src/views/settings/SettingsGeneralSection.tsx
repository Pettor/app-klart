import type { ReactElement } from "react";
import { ListBox, Select } from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import { SettingsRow } from "./SettingsRow";
import { SettingsPanel, SettingsSectionShell } from "./SettingsSectionShell";
import type { ContextColor } from "~/core/contexts/KlartContext";
import { ALL_CONTEXTS } from "~/core/contexts/KlartContext";
import type { StartContext } from "~/core/tasks/KlartAtoms";

export interface SettingsGeneralSectionProps {
  title: string;
  startContext: StartContext;
  contexts: { id: string; name: string; color: ContextColor }[];
  onStartContextChange: (startContext: StartContext) => void;
}

const LAST_USED = "last";

export function SettingsGeneralSection({
  title,
  startContext,
  contexts,
  onStartContextChange,
}: SettingsGeneralSectionProps): ReactElement {
  const intl = useIntl();
  const startLabel = intl.formatMessage({
    description: "SettingsGeneral - label of the context Klart opens in",
    defaultMessage: "Start in",
    id: "bWIP0U",
  });
  const options = [
    {
      id: LAST_USED,
      name: intl.formatMessage({
        description: "SettingsGeneral - start in the last used context",
        defaultMessage: "Last used",
        id: "p4kdCP",
      }),
      color: null,
    },
    {
      id: ALL_CONTEXTS,
      name: intl.formatMessage({
        description: "SettingsGeneral - start in all contexts",
        defaultMessage: "All contexts",
        id: "DohPwo",
      }),
      color: "all" as const,
    },
    ...contexts,
  ];
  // A removed context falls back to "Last used".
  const value = options.some((option) => option.id === startContext) ? startContext : LAST_USED;

  return (
    <SettingsSectionShell
      id="general"
      title={title}
      description={intl.formatMessage({
        description: "SettingsGeneral - intro",
        defaultMessage: "How Klart starts and behaves on this device.",
        id: "Y/Nq0Y",
      })}
    >
      <SettingsPanel>
        <SettingsRow
          label={startLabel}
          description={intl.formatMessage({
            description: "SettingsGeneral - hint for the start context",
            defaultMessage: "Context shown when Klart opens",
            id: "JI1HYR",
          })}
        >
          <Select
            aria-label={startLabel}
            value={value}
            onChange={(key) => key && onStartContextChange(String(key))}
            className="w-52"
            data-testid="settings__start-context"
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {options.map((option) => (
                  <ListBox.Item key={option.id} id={option.id} textValue={option.name}>
                    {option.color && (
                      <span className={clsx(`ctx-${option.color}`, "size-2 shrink-0 rounded-full bg-(--ctx)")} />
                    )}
                    {option.name}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </SettingsRow>
      </SettingsPanel>
    </SettingsSectionShell>
  );
}
