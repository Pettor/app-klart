import type { ReactElement } from "react";
import { ListBox, Select } from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import { SettingsPanel } from "./SettingsSectionShell";
import type { ContextColor } from "~/core/contexts/KlartContext";
import { DEVICE_ONLY } from "~/core/sync/SyncTargets";

export interface SettingsSyncContextItem {
  id: string;
  name: string;
  color: ContextColor;
  /** The sync it uses, or {@link DEVICE_ONLY}. */
  targetId: string;
}

export interface SettingsSyncContextsProps {
  contexts: SettingsSyncContextItem[];
  targets: { id: string; name: string }[];
  onAssign: (contextId: string, targetId: string) => void;
}

/** Which sync each context uses. */
export function SettingsSyncContexts({ contexts, targets, onAssign }: SettingsSyncContextsProps): ReactElement {
  const intl = useIntl();
  const options = [
    ...targets,
    {
      id: DEVICE_ONLY,
      name: intl.formatMessage({
        description: "SettingsSyncContexts - option keeping a context on this device, not synced",
        defaultMessage: "This device only",
        id: "R8HGva",
      }),
    },
  ];

  return (
    <SettingsPanel>
      <div className="flex flex-col gap-1 px-[18px] py-3.5">
        <span className="font-semibold">
          {intl.formatMessage({
            description: "SettingsSyncContexts - heading of the context to sync table",
            defaultMessage: "Where each context syncs",
            id: "ubI6UX",
          })}
        </span>
        <span className="text-muted text-[13px] leading-relaxed">
          {intl.formatMessage({
            description: "SettingsSyncContexts - explains what moving a context does",
            defaultMessage:
              "A context's tasks and My Day entries live only in its sync. Moving a context writes them to the new sync and removes them from the old one. New contexts use the primary sync.",
            id: "CvPReC",
          })}
        </span>
      </div>
      {contexts.map((context) => (
        <div
          key={context.id}
          className="flex flex-wrap items-center gap-3 px-[18px] py-2.5"
          data-testid="settings__sync-context"
        >
          <span className={clsx(`ctx-${context.color}`, "flex min-w-0 flex-1 items-center gap-2 font-medium")}>
            <span className="size-2.5 shrink-0 rounded-full bg-(--ctx)" aria-hidden />
            <span className="truncate">{context.name}</span>
          </span>
          <Select
            aria-label={intl.formatMessage(
              {
                description: "SettingsSyncContexts - aria-label of the sync picker for one context",
                defaultMessage: "Sync for {name}",
                id: "PwMqZR",
              },
              { name: context.name }
            )}
            value={context.targetId}
            onChange={(key) => key && onAssign(context.id, String(key))}
            className="w-52"
            data-testid={`settings__sync-context-${context.id}`}
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {options.map((option) => (
                  <ListBox.Item key={option.id} id={option.id} textValue={option.name}>
                    {option.name}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
      ))}
    </SettingsPanel>
  );
}
