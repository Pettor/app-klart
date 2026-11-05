import type { ReactElement } from "react";
import { ListBox, Select } from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import { SettingsRow } from "./SettingsRow";
import { SettingsPanel, SettingsSectionShell } from "./SettingsSectionShell";
import { SettingsSwitchRow } from "./SettingsSwitchRow";
import type { ContextColor } from "~/core/contexts/KlartContext";
import { ALL_CONTEXTS } from "~/core/contexts/KlartContext";
import type { DevDataSource } from "~/core/tasks/DevDataSource";
import type { StartContext } from "~/core/tasks/KlartAtoms";

export interface SettingsGeneralSectionProps {
  title: string;
  startContext: StartContext;
  contexts: { id: string; name: string; color: ContextColor }[];
  onStartContextChange: (startContext: StartContext) => void;
  /** Dev server only: show sample data or this device's real data and syncs. Hidden when omitted. */
  dataSource?: DevDataSource;
  onDataSourceChange?: (dataSource: DevDataSource) => void;
}

const LAST_USED = "last";

export function SettingsGeneralSection({
  title,
  startContext,
  contexts,
  onStartContextChange,
  dataSource,
  onDataSourceChange,
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
      {dataSource && onDataSourceChange && (
        <SettingsPanel>
          <SettingsSwitchRow
            label={intl.formatMessage({
              description: "SettingsGeneral - dev-only switch between sample data and real data",
              defaultMessage: "Use sample data",
              id: "C1z60Q",
            })}
            description={intl.formatMessage({
              description: "SettingsGeneral - hint for the dev-only sample data switch",
              defaultMessage:
                "Development only. Off shows this device's real tasks, folder and GitHub syncs. On pauses sync. Klart reloads.",
              id: "xTQIQx",
            })}
            isSelected={dataSource === "sample"}
            onChange={(isSelected) => onDataSourceChange(isSelected ? "sample" : "live")}
            testId="settings__dev-sample-data"
          />
        </SettingsPanel>
      )}
    </SettingsSectionShell>
  );
}
