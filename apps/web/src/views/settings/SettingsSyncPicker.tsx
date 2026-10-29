import { useState, type ReactElement } from "react";
import { Button, Radio, RadioGroup } from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import { SettingsGitHubPanel } from "./SettingsGitHubPanel";
import { SettingsGitPanel } from "./SettingsGitPanel";
import type { SyncMethod, SyncStatus } from "~/core/sync/SyncAtoms";
import type { GitHubCredentials } from "~/core/sync/UseFolderSync";

const NOT_CONNECTED: SyncStatus = { state: "local", method: "local" };

export interface SettingsSyncPickerProps {
  isSupported: boolean;
  isDesktop: boolean;
  isGitSupported: boolean | null;
  /** Setting up the first sync: "this browser only" is offered too, and selected. */
  isFirst: boolean;
  onConnect: () => void;
  onConnectGit: () => void;
  onCloneGit: (url: string) => void;
  /** Resolves `true` once connected. */
  onConnectGitHub: (credentials: GitHubCredentials) => Promise<boolean>;
  /** Adding another sync: leave without adding one. */
  onCancel?: () => void;
  now: number;
}

/** Picks how to sync and sets it up. Choosing Git or GitHub only reveals its setup. */
export function SettingsSyncPicker({
  isSupported,
  isDesktop,
  isGitSupported,
  isFirst,
  onConnect,
  onConnectGit,
  onCloneGit,
  onConnectGitHub,
  onCancel,
  now,
}: SettingsSyncPickerProps): ReactElement {
  const intl = useIntl();
  const [method, setMethod] = useState<SyncMethod | null>(isFirst ? "local" : null);

  function handleMethod(value: string): void {
    if (value === "folder") {
      onConnect();
    } else {
      setMethod(value as SyncMethod);
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
  ];
  if (isFirst) {
    options.push({
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
    });
  }

  return (
    <div className="flex flex-col gap-3.5" data-testid="settings__sync-picker">
      {!isFirst && (
        <div className="flex items-center gap-2">
          <span className="flex-1 font-semibold">
            {intl.formatMessage({
              description: "SettingsSync - heading when adding another sync",
              defaultMessage: "Add another sync",
              id: "vh6mQA",
            })}
          </span>
          {onCancel && (
            <Button size="sm" variant="ghost" onPress={onCancel}>
              {intl.formatMessage({
                description: "SettingsSync - stop adding another sync",
                defaultMessage: "Cancel",
                id: "6jbcVW",
              })}
            </Button>
          )}
        </div>
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
              "hero-card bg-surface items-start gap-3 rounded-xl border-2 border-transparent p-4",
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

      {method === "git" && isGitSupported && (
        <SettingsGitPanel
          status={NOT_CONNECTED}
          onConnectGit={onConnectGit}
          onCloneGit={onCloneGit}
          onSyncNow={() => undefined}
          now={now}
        />
      )}

      {method === "github" && (
        <SettingsGitHubPanel
          status={NOT_CONNECTED}
          onConnectGitHub={onConnectGitHub}
          onSyncNow={() => undefined}
          now={now}
        />
      )}
    </div>
  );
}
