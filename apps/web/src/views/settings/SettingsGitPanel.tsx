import { useState, type ChangeEvent, type ReactElement, type ReactNode } from "react";
import { CheckIcon, ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import { Button, Description, Input, Label, TextField } from "@heroui/react";
import { FormattedRelativeTime, useIntl } from "react-intl";
import type { SyncStatus } from "~/core/sync/SyncAtoms";

export interface SettingsGitPanelProps {
  status: SyncStatus;
  onConnectGit: () => void;
  onCloneGit: (url: string) => void;
  onSyncNow: () => void;
  now: number;
  /** Replaces the connected repository's heading, e.g. with the sync's name. */
  title?: ReactNode;
  /** Shown under the connected repository's buttons. */
  footer?: ReactNode;
}

/** Git sync: either the connected clone's state, or how to connect one. */
export function SettingsGitPanel({
  status,
  onConnectGit,
  onCloneGit,
  onSyncNow,
  now,
  title,
  footer,
}: SettingsGitPanelProps): ReactElement {
  const intl = useIntl();
  const [url, setUrl] = useState("");
  const git = status.method === "git" ? status.git : undefined;

  const chooseClone = intl.formatMessage({
    description: "SettingsGit - button picking a folder that already is a Git clone",
    defaultMessage: "Use an existing clone…",
    id: "7+97YO",
  });

  if (status.method !== "git") {
    return (
      <div className="hero-card bg-surface flex flex-col gap-3 rounded-xl p-[18px]" data-testid="settings__git-setup">
        <span className="font-semibold">
          {intl.formatMessage({
            description: "SettingsGit - heading when no repository is connected",
            defaultMessage: "Connect a repository",
            id: "t0khqm",
          })}
        </span>
        <p className="text-muted text-[13px] leading-relaxed">
          {intl.formatMessage({
            description: "SettingsGit - explains that the installed git and its credentials are used",
            defaultMessage:
              "Klart uses the git installed on this computer, so your SSH keys or credential helper sign in to GitHub. Use a private repository.",
            id: "gZ6Ypn",
          })}
        </p>
        <div className="flex flex-wrap items-end gap-2">
          <TextField className="flex min-w-0 flex-[1_1_320px] flex-col gap-1">
            <Label className="text-xs">
              {intl.formatMessage({
                description: "SettingsGit - repository URL field",
                defaultMessage: "Repository URL",
                id: "Vp6UNX",
              })}
            </Label>
            <Input
              value={url}
              data-testid="settings__git-url"
              placeholder="git@github.com:you/klart-data.git"
              className="font-mono"
              onChange={(event: ChangeEvent<HTMLInputElement>) => setUrl(event.target.value)}
            />
            <Description className="text-xs">
              {intl.formatMessage({
                description: "SettingsGit - help under the repository URL field",
                defaultMessage: "You'll pick where to put the clone. An empty repository is fine.",
                id: "aoTIFk",
              })}
            </Description>
          </TextField>
          <Button isDisabled={!url.trim()} onPress={() => onCloneGit(url)} data-testid="settings__git-clone">
            {intl.formatMessage({
              description: "SettingsGit - button cloning the repository",
              defaultMessage: "Clone…",
              id: "gCxcmu",
            })}
          </Button>
        </div>
        <Button variant="secondary" className="self-start" onPress={onConnectGit} data-testid="settings__git-existing">
          {chooseClone}
        </Button>
      </div>
    );
  }

  const minutes = git?.lastSyncedAt ? Math.round((Date.parse(git.lastSyncedAt) - now) / 60_000) : null;

  return (
    <div className="hero-card bg-surface flex flex-col gap-3 rounded-xl p-[18px]" data-testid="settings__git-connected">
      {title ?? (
        <span className="font-semibold">
          {intl.formatMessage({
            description: "SettingsGit - heading for the connected repository",
            defaultMessage: "Repository",
            id: "pvFe0e",
          })}
        </span>
      )}
      <dl className="grid grid-cols-[max-content_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-[13px]">
        <dt className="text-muted">
          {intl.formatMessage({
            description: "SettingsGit - label for the clone's folder",
            defaultMessage: "Folder",
            id: "zJfjus",
          })}
        </dt>
        <dd className="truncate font-mono">{status.location ?? status.folderName}</dd>
        <dt className="text-muted">
          {intl.formatMessage({
            description: "SettingsGit - label for the remote URL",
            defaultMessage: "Remote",
            id: "EHL7kH",
          })}
        </dt>
        <dd className="truncate font-mono">
          {git?.remoteUrl ??
            intl.formatMessage({
              description: "SettingsGit - shown when the clone has no remote",
              defaultMessage: "none (commits stay on this computer)",
              id: "G2/dyP",
            })}
        </dd>
        <dt className="text-muted">
          {intl.formatMessage({
            description: "SettingsGit - label for the branch",
            defaultMessage: "Branch",
            id: "LhKpgj",
          })}
        </dt>
        <dd className="font-mono">{git?.branch ?? "…"}</dd>
      </dl>
      <p className="text-muted text-[13px] leading-relaxed">
        {intl.formatMessage({
          description: "SettingsGit - explains the sync schedule",
          defaultMessage:
            "Pulls when Klart opens and every 5 minutes. Commits and pushes 30 seconds after your last change.",
          id: "xX2Mr2",
        })}
      </p>
      {git?.error ? (
        <span className="text-danger flex items-start gap-2 text-[13px]">
          <ExclamationTriangleIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span className="font-mono break-all whitespace-pre-wrap">{git.error}</span>
        </span>
      ) : minutes !== null ? (
        <span className="text-success flex items-center gap-2 text-[13px]">
          <CheckIcon className="size-4" aria-hidden />
          {intl.formatMessage({
            description: "SettingsGit - prefix before when the last git sync happened",
            defaultMessage: "Synced with the remote",
            id: "RG1Lqy",
          })}{" "}
          <FormattedRelativeTime value={Math.min(0, minutes)} unit="minute" numeric="auto" />
          {!!git?.conflicts &&
            ` · ${intl.formatMessage(
              {
                description: "SettingsGit - conflicts resolved in the last sync",
                defaultMessage: "{count, plural, one {# conflict} other {# conflicts}} resolved, see .conflicts/",
                id: "fKdp9C",
              },
              { count: git.conflicts }
            )}`}
        </span>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onPress={onSyncNow} data-testid="settings__git-sync-now">
          {intl.formatMessage({
            description: "SettingsGit - sync immediately",
            defaultMessage: "Sync now",
            id: "8W2bvW",
          })}
        </Button>
        <Button variant="secondary" onPress={onConnectGit}>
          {intl.formatMessage({
            description: "SettingsGit - pick a different clone",
            defaultMessage: "Use another clone…",
            id: "TMN2Lo",
          })}
        </Button>
      </div>
      {footer}
    </div>
  );
}
