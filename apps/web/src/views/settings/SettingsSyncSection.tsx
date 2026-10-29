import { useState, type ChangeEvent, type ReactElement } from "react";
import { PlusIcon } from "@heroicons/react/20/solid";
import { Alert, Button, Description, Input, Label, TextField } from "@heroui/react";
import { FormattedRelativeTime, useIntl } from "react-intl";
import { SettingsPanel, SettingsSectionShell } from "./SettingsSectionShell";
import type { SettingsSyncContextItem } from "./SettingsSyncContexts";
import { SettingsSyncContexts } from "./SettingsSyncContexts";
import { SettingsSyncPicker } from "./SettingsSyncPicker";
import { SettingsSyncTargetCard } from "./SettingsSyncTargetCard";
import type { DeviceInfo } from "~/core/sync/FolderSync";
import type { SyncOverview } from "~/core/sync/SyncTargets";
import type { GitHubCredentials } from "~/core/sync/UseFolderSync";

export interface SettingsSyncSectionProps {
  /** Every sync with its state and contexts. */
  overview: SyncOverview;
  /** Every context and the sync it uses. */
  contexts: SettingsSyncContextItem[];
  isSupported: boolean;
  /** Running in the desktop app. */
  isDesktop: boolean;
  /** Git is installed (desktop app only); `null` while checking. */
  isGitSupported: boolean | null;
  deviceName: string;
  thisDeviceId: string;
  devices: DeviceInfo[];
  /** The connect callbacks add a sync, or with `targetId` point that sync somewhere else. */
  onConnect: (targetId?: string) => void;
  onConnectGit: (targetId?: string) => void;
  onCloneGit: (url: string, targetId?: string) => void;
  /** Resolves `true` once connected. */
  onConnectGitHub: (credentials: GitHubCredentials, targetId?: string) => Promise<boolean>;
  onReconnect: (targetId: string) => void;
  /** Stops syncing with one sync; its contexts stay on this device. */
  onRemove: (targetId: string) => void;
  onRename: (targetId: string, name: string) => void;
  onMakePrimary: (targetId: string) => void;
  /** Moves a context to a sync, or keeps it on this device with `DEVICE_ONLY`. */
  onAssignContext: (contextId: string, targetId: string) => void;
  onSyncNow: () => void;
  onDeviceNameChange: (name: string) => void;
  /** Rendered at this time; injected so stories are stable. */
  now?: number;
}

function RelativeTime({ iso, now }: { iso: string; now: number }): ReactElement {
  const minutes = Math.round((Date.parse(iso) - now) / 60_000);
  if (minutes > -1) {
    return <FormattedRelativeTime value={0} unit="minute" numeric="auto" />;
  }
  if (minutes > -60) {
    return <FormattedRelativeTime value={minutes} unit="minute" numeric="auto" />;
  }
  if (minutes > -60 * 48) {
    return <FormattedRelativeTime value={Math.round(minutes / 60)} unit="hour" numeric="auto" />;
  }
  return <FormattedRelativeTime value={Math.round(minutes / 1440)} unit="day" numeric="auto" />;
}

export function SettingsSyncSection({
  overview,
  contexts,
  isSupported,
  isDesktop,
  isGitSupported,
  deviceName,
  thisDeviceId,
  devices,
  onConnect,
  onConnectGit,
  onCloneGit,
  onConnectGitHub,
  onReconnect,
  onRemove,
  onRename,
  onMakePrimary,
  onAssignContext,
  onSyncNow,
  onDeviceNameChange,
  now = Date.now(),
}: SettingsSyncSectionProps): ReactElement {
  const intl = useIntl();
  const { targets } = overview;
  // "Add another sync" stays open until a sync is added: the count it was opened at stops matching.
  const [addingAt, setAddingAt] = useState<number | null>(null);
  const isAdding = addingAt === targets.length;
  const isSplit = targets.length > 1 || overview.localContexts.length > 0;

  return (
    <SettingsSectionShell
      id="sync"
      title={intl.formatMessage({
        description: "SettingsSync - section heading",
        defaultMessage: "Sync",
        id: "lTrhyB",
      })}
      description={intl.formatMessage({
        description: "SettingsSync - section intro",
        defaultMessage:
          "Klart stores everything as plain JSON files in one folder. Point each computer at the same folder and you are in sync.",
        id: "zSCLup",
      })}
    >
      {!isSupported && !targets.some((target) => target.method === "github") && (
        <Alert status="warning">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>
              {intl.formatMessage({
                description: "SettingsSync - warning title when the browser can't access folders",
                defaultMessage: "Folder sync needs Chrome or Edge on a computer",
                id: "A+wJWk",
              })}
            </Alert.Title>
            <Alert.Description>
              {intl.formatMessage({
                description: "SettingsSync - warning body when the browser can't access folders",
                defaultMessage:
                  "This browser can't open folders. Sync through GitHub instead, or keep your tasks here.",
                id: "glqBhJ",
              })}
            </Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      {targets.length === 0 ? (
        <SettingsSyncPicker
          isFirst
          isSupported={isSupported}
          isDesktop={isDesktop}
          isGitSupported={isGitSupported}
          onConnect={() => onConnect()}
          onConnectGit={() => onConnectGit()}
          onCloneGit={(url) => onCloneGit(url)}
          onConnectGitHub={(credentials) => onConnectGitHub(credentials)}
          now={now}
        />
      ) : (
        targets.map((target) => (
          <SettingsSyncTargetCard
            key={target.id}
            target={target}
            showContexts={isSplit}
            canMakePrimary={targets.length > 1}
            onConnect={() => onConnect(target.id)}
            onConnectGit={() => onConnectGit(target.id)}
            onConnectGitHub={(credentials) => onConnectGitHub(credentials, target.id)}
            onReconnect={() => onReconnect(target.id)}
            onRemove={() => onRemove(target.id)}
            onRename={(name) => onRename(target.id, name)}
            onMakePrimary={() => onMakePrimary(target.id)}
            onSyncNow={onSyncNow}
            now={now}
          />
        ))
      )}

      {targets.length > 0 &&
        (isAdding ? (
          <SettingsSyncPicker
            isFirst={false}
            isSupported={isSupported}
            isDesktop={isDesktop}
            isGitSupported={isGitSupported}
            onConnect={() => onConnect()}
            onConnectGit={() => onConnectGit()}
            onCloneGit={(url) => onCloneGit(url)}
            onConnectGitHub={(credentials) => onConnectGitHub(credentials)}
            onCancel={() => setAddingAt(null)}
            now={now}
          />
        ) : (
          <div className="flex flex-col gap-1">
            <Button
              variant="secondary"
              className="self-start"
              onPress={() => setAddingAt(targets.length)}
              data-testid="settings__sync-add"
            >
              <PlusIcon className="size-4" aria-hidden />
              {intl.formatMessage({
                description: "SettingsSync - button adding a second sync, e.g. a separate repo for work",
                defaultMessage: "Add another sync",
                id: "W8YHM6",
              })}
            </Button>
            {targets.length === 1 && (
              <span className="text-muted text-[13px] leading-relaxed">
                {intl.formatMessage({
                  description: "SettingsSync - explains why you'd add a second sync",
                  defaultMessage:
                    "Keep some contexts somewhere else, e.g. Work in your employer's OneDrive and the rest in your own repo.",
                  id: "z+TGoi",
                })}
              </span>
            )}
          </div>
        ))}

      {targets.length > 0 && isSplit && (
        <SettingsSyncContexts
          contexts={contexts}
          targets={targets.map(({ id, name }) => ({ id, name }))}
          onAssign={onAssignContext}
        />
      )}

      <div className="hero-card bg-surface flex flex-col gap-1 rounded-xl p-[18px]">
        <TextField className="flex max-w-sm flex-col gap-1">
          <Label className="font-semibold">
            {intl.formatMessage({
              description: "SettingsSync - device name field",
              defaultMessage: "This device's name",
              id: "UW37Wi",
            })}
          </Label>
          <Input
            value={deviceName}
            onChange={(event: ChangeEvent<HTMLInputElement>) => onDeviceNameChange(event.target.value)}
          />
          <Description>
            {intl.formatMessage({
              description: "SettingsSync - device name help",
              defaultMessage: "Shown to your other devices and used to decide which one sends notifications.",
              id: "lNYhjY",
            })}
          </Description>
        </TextField>
      </div>

      {devices.length > 0 && (
        <SettingsPanel>
          <div className="px-[18px] py-3.5 font-semibold">
            {intl.formatMessage(
              {
                description: "SettingsSync - devices table heading",
                defaultMessage: "{count, plural, one {Devices using this folder} other {Devices using these syncs}}",
                id: "xmBicT",
              },
              { count: targets.length }
            )}
          </div>
          {devices.map((device) => (
            <div key={device.id} className="flex items-center gap-3 px-[18px] py-3 text-[13px]">
              <span className="flex-1 font-medium">
                {device.name}{" "}
                {device.id === thisDeviceId && (
                  <span className="text-muted font-normal">
                    {intl.formatMessage({
                      description: "SettingsSync - marks the current device",
                      defaultMessage: "(this)",
                      id: "e1E+tr",
                    })}
                  </span>
                )}
              </span>
              <span className={device.id === thisDeviceId ? "text-success" : "text-muted"}>
                <RelativeTime iso={device.lastActiveAt} now={now} />
              </span>
            </div>
          ))}
        </SettingsPanel>
      )}

      <p className="text-muted text-[13px] leading-relaxed">
        {intl.formatMessage(
          {
            description: "SettingsSync - explains how conflicts are resolved",
            defaultMessage:
              "Conflicts: every task is its own file with {updatedAt}, so two computers editing different tasks never collide. Same task edited on both: newest wins, the other is kept in {conflicts}.",
            id: "Sb9GwU",
          },
          {
            updatedAt: <code className="text-foreground/85 font-mono">updatedAt</code>,
            conflicts: <code className="text-foreground/85 font-mono">.conflicts/</code>,
          }
        )}
      </p>
    </SettingsSectionShell>
  );
}
