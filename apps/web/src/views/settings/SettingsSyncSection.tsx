import { useState, type ChangeEvent, type ReactElement } from "react";
import { CheckIcon, ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import { Alert, Button, Description, Input, Label, Radio, RadioGroup, TextField } from "@heroui/react";
import clsx from "clsx";
import { FormattedRelativeTime, useIntl } from "react-intl";
import { SettingsGitHubPanel } from "./SettingsGitHubPanel";
import { SettingsGitPanel } from "./SettingsGitPanel";
import { SettingsPanel, SettingsSectionShell } from "./SettingsSectionShell";
import type { DeviceInfo } from "~/core/sync/FolderSync";
import type { SyncMethod, SyncStatus } from "~/core/sync/SyncAtoms";
import type { GitHubCredentials } from "~/core/sync/UseFolderSync";

export interface SettingsSyncSectionProps {
  status: SyncStatus;
  isSupported: boolean;
  /** Running in the desktop app. */
  isDesktop: boolean;
  /** Git is installed (desktop app only); `null` while checking. */
  isGitSupported: boolean | null;
  deviceName: string;
  thisDeviceId: string;
  devices: DeviceInfo[];
  onConnect: () => void;
  onConnectGit: () => void;
  onCloneGit: (url: string) => void;
  /** Resolves `true` once connected. */
  onConnectGitHub: (credentials: GitHubCredentials) => Promise<boolean>;
  onReconnect: () => void;
  onDisconnect: () => void;
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
  status,
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
  onDisconnect,
  onSyncNow,
  onDeviceNameChange,
  now = Date.now(),
}: SettingsSyncSectionProps): ReactElement {
  const intl = useIntl();
  // Choosing Git or GitHub only reveals its setup; the method changes once a repository is connected.
  const [pending, setPending] = useState<SyncMethod | null>(null);
  const method: SyncMethod = pending ?? status.method;

  function handleMethod(value: string): void {
    setPending(value === "git" || value === "github" ? value : null);
    if (value === "folder" && status.method !== "folder") {
      onConnect();
    } else if (value === "local" && status.method !== "local") {
      onDisconnect();
    }
  }

  let gitBody = intl.formatMessage({
    description: "SettingsSync - git method description in the browser",
    defaultMessage: "A private Git repo with full history. Available in the Klart desktop app.",
    id: "hDuZqH",
  });
  if (isDesktop && isGitSupported) {
    gitBody = intl.formatMessage({
      description: "SettingsSync - git method description in the desktop app",
      defaultMessage: "A private repo, e.g. on GitHub. Pull on launch, commit and push after changes. Full history.",
      id: "a23IZL",
    });
  } else if (isDesktop && isGitSupported === false) {
    gitBody = intl.formatMessage({
      description: "SettingsSync - git method description when git isn't installed",
      defaultMessage: "Install Git on this computer to sync through a repository.",
      id: "0rJ4k4",
    });
  }

  const options: { value: SyncMethod; title: string; body: string; isDisabled?: boolean }[] = [
    {
      value: "folder",
      title: intl.formatMessage({
        description: "SettingsSync - method title",
        defaultMessage: "Cloud folder",
        id: "AlZg4B",
      }),
      body: intl.formatMessage({
        description: "SettingsSync - method description",
        defaultMessage: "OneDrive, iCloud Drive, Dropbox or any synced folder. Zero setup.",
        id: "K5Rjqy",
      }),
      isDisabled: !isSupported,
    },
    {
      value: "git",
      title: intl.formatMessage({
        description: "SettingsSync - method title",
        defaultMessage: "Git repository",
        id: "k6EKVk",
      }),
      body: gitBody,
      isDisabled: !isGitSupported,
    },
    {
      value: "github",
      title: intl.formatMessage({
        description: "SettingsSync - method title",
        defaultMessage: "GitHub",
        id: "GZ3jvy",
      }),
      body: intl.formatMessage({
        description: "SettingsSync - GitHub method description",
        defaultMessage: "A private GitHub repo, straight from the app. Works on phones and in any browser.",
        id: "cylmo2",
      }),
    },
    {
      value: "local",
      title: isDesktop
        ? intl.formatMessage({
            description: "SettingsSync - method title in the desktop app",
            defaultMessage: "This computer only",
            id: "CGNvp6",
          })
        : intl.formatMessage({
            description: "SettingsSync - method title",
            defaultMessage: "This browser only",
            id: "BWvpym",
          }),
      body: intl.formatMessage({
        description: "SettingsSync - method description",
        defaultMessage: "Stored on this device, no sync. Switch any time.",
        id: "xqjw42",
      }),
    },
  ];

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
      {!isSupported && status.method !== "github" && (
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

      <RadioGroup
        value={method}
        onChange={handleMethod}
        aria-label={intl.formatMessage({
          description: "SettingsSync - aria-label of the method picker",
          defaultMessage: "Sync method",
          id: "Wx9au+",
        })}
        className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3"
      >
        {options.map((option) => (
          <Radio
            key={option.value}
            value={option.value}
            isDisabled={option.isDisabled}
            data-testid={`settings__sync-${option.value}`}
            className={clsx(
              "bg-surface items-start gap-3 rounded-xl border-2 border-transparent p-4",
              "data-[selected=true]:border-accent data-[selected=true]:bg-accent/10"
            )}
          >
            <Radio.Content className="flex items-start gap-3">
              <Radio.Control className="mt-0.5">
                <Radio.Indicator />
              </Radio.Control>
              <span className="flex flex-col gap-1">
                <span className="font-semibold">{option.title}</span>
                <span className="text-foreground/80 text-[13px] leading-snug font-normal">{option.body}</span>
              </span>
            </Radio.Content>
          </Radio>
        ))}
      </RadioGroup>

      {method === "folder" && status.method === "folder" && (
        <div className="bg-surface flex flex-col gap-3 rounded-xl p-[18px]">
          <span className="font-semibold">
            {intl.formatMessage({
              description: "SettingsSync - connected folder heading",
              defaultMessage: "Data folder",
              id: "zujlWi",
            })}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <code className="bg-background border-border min-w-0 flex-1 truncate rounded-lg border px-3 py-2.5 font-mono text-[13px]">
              {status.location ?? status.folderName ?? "…"}
            </code>
            {status.state === "needs-permission" ? (
              <Button onPress={onReconnect} data-testid="settings__sync-reconnect">
                {intl.formatMessage({
                  description: "SettingsSync - re-grant folder access",
                  defaultMessage: "Reconnect",
                  id: "WIF87D",
                })}
              </Button>
            ) : (
              <Button variant="secondary" onPress={onSyncNow}>
                {intl.formatMessage({
                  description: "SettingsSync - sync immediately",
                  defaultMessage: "Sync now",
                  id: "xQx8PW",
                })}
              </Button>
            )}
            <Button variant="secondary" onPress={onConnect}>
              {intl.formatMessage({
                description: "SettingsSync - pick a different folder",
                defaultMessage: "Choose…",
                id: "0cSmNI",
              })}
            </Button>
          </div>
          <p className="text-muted text-[13px] leading-relaxed">
            {intl.formatMessage({
              description: "SettingsSync - explains where the folder path is stored",
              defaultMessage:
                "Each computer keeps its own folder choice, so the folder can live in different places on each machine. The folder itself is the source of truth.",
              id: "Dl2joH",
            })}
          </p>
          {status.state === "synced" && (
            <span className="text-success flex items-center gap-2 text-[13px]">
              <CheckIcon className="size-4" aria-hidden />
              {intl.formatMessage({
                description: "SettingsSync - status line when the folder is being watched",
                defaultMessage: "Found klart.json. Watching for changes.",
                id: "yqKHf4",
              })}
            </span>
          )}
          {status.state === "needs-permission" && (
            <span className="text-warning flex items-center gap-2 text-[13px]">
              <ExclamationTriangleIcon className="size-4" aria-hidden />
              {intl.formatMessage({
                description: "SettingsSync - status line when the browser needs permission again",
                defaultMessage: "The browser needs your permission again to open this folder.",
                id: "iFbXEp",
              })}
            </span>
          )}
          {status.state === "error" && (
            <span className="text-danger flex items-center gap-2 text-[13px]">
              <ExclamationTriangleIcon className="size-4" aria-hidden />
              {status.error}
            </span>
          )}
        </div>
      )}

      {method === "git" && isGitSupported && (
        <SettingsGitPanel
          status={status}
          onConnectGit={onConnectGit}
          onCloneGit={onCloneGit}
          onSyncNow={onSyncNow}
          now={now}
        />
      )}

      {method === "github" && (
        <SettingsGitHubPanel
          status={status}
          onConnectGitHub={async (credentials) => {
            const connected = await onConnectGitHub(credentials);
            if (connected) {
              setPending(null);
            }
            return connected;
          }}
          onSyncNow={onSyncNow}
          now={now}
        />
      )}

      <div className="bg-surface flex flex-col gap-1 rounded-xl p-[18px]">
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
            {intl.formatMessage({
              description: "SettingsSync - devices table heading",
              defaultMessage: "Devices using this folder",
              id: "MP5SmJ",
            })}
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
