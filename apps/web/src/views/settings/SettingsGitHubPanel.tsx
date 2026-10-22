import { useState, type ChangeEvent, type ReactElement } from "react";
import { CheckIcon, ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import { Button, Description, Input, Label, Link, Spinner, TextField } from "@heroui/react";
import { FormattedRelativeTime, useIntl } from "react-intl";
import { githubErrorText } from "./SettingsGitHubMessages";
import type { SyncStatus } from "~/core/sync/SyncAtoms";
import type { GitHubCredentials } from "~/core/sync/UseFolderSync";

const NEW_TOKEN_URL = "https://github.com/settings/personal-access-tokens/new";

export interface SettingsGitHubPanelProps {
  status: SyncStatus;
  /** Resolves `true` once connected; a failed attempt resolves `false` after telling the user why. */
  onConnectGitHub: (credentials: GitHubCredentials) => Promise<boolean>;
  onSyncNow: () => void;
  now: number;
}

/** GitHub sync: either the connected repository's state, or the sign-in form. */
export function SettingsGitHubPanel({
  status,
  onConnectGitHub,
  onSyncNow,
  now,
}: SettingsGitHubPanelProps): ReactElement {
  const intl = useIntl();
  const connected = status.method === "github";
  const [isEditing, setIsEditing] = useState(false);

  if (!connected || isEditing) {
    return (
      <SettingsGitHubForm
        onConnect={async (credentials) => {
          if (await onConnectGitHub(credentials)) {
            setIsEditing(false);
          }
        }}
        onCancel={connected ? () => setIsEditing(false) : undefined}
      />
    );
  }

  const git = status.git;
  const minutes = git?.lastSyncedAt ? Math.round((Date.parse(git.lastSyncedAt) - now) / 60_000) : null;
  const errorText = git?.error ? (githubErrorText(intl, git.errorKind) ?? git.error) : null;

  return (
    <div
      className="hero-card bg-surface flex flex-col gap-3 rounded-xl p-[18px]"
      data-testid="settings__github-connected"
    >
      <span className="font-semibold">
        {intl.formatMessage({
          description: "SettingsGitHub - heading for the connected repository",
          defaultMessage: "GitHub repository",
          id: "WC41ET",
        })}
      </span>
      <dl className="grid grid-cols-[max-content_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-[13px]">
        <dt className="text-muted">
          {intl.formatMessage({
            description: "SettingsGitHub - label for the repository",
            defaultMessage: "Repository",
            id: "nT1iD+",
          })}
        </dt>
        <dd className="truncate font-mono">{git?.remoteUrl ?? status.folderName}</dd>
        <dt className="text-muted">
          {intl.formatMessage({
            description: "SettingsGitHub - label for the branch",
            defaultMessage: "Branch",
            id: "fYncqT",
          })}
        </dt>
        <dd className="font-mono">{git?.branch ?? "…"}</dd>
      </dl>
      <p className="text-muted text-[13px] leading-relaxed">
        {intl.formatMessage({
          description: "SettingsGitHub - explains the sync schedule",
          defaultMessage:
            "Checks for changes when Klart opens and every minute while it's open. Pushes a few seconds after your last change and when you leave the app.",
          id: "e/5Th6",
        })}
      </p>
      {errorText ? (
        <span className="text-danger flex items-start gap-2 text-[13px]" data-testid="settings__github-error">
          <ExclamationTriangleIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span className="break-words">{errorText}</span>
        </span>
      ) : minutes !== null ? (
        <span className="text-success flex items-center gap-2 text-[13px]">
          <CheckIcon className="size-4" aria-hidden />
          {intl.formatMessage({
            description: "SettingsGitHub - prefix before when the last sync with GitHub happened",
            defaultMessage: "Synced with GitHub",
            id: "VX0uEu",
          })}{" "}
          <FormattedRelativeTime value={Math.min(0, minutes)} unit="minute" numeric="auto" />
        </span>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onPress={onSyncNow} data-testid="settings__github-sync-now">
          {intl.formatMessage({
            description: "SettingsGitHub - sync immediately",
            defaultMessage: "Sync now",
            id: "GaMDDl",
          })}
        </Button>
        <Button variant="secondary" onPress={() => setIsEditing(true)} data-testid="settings__github-change">
          {intl.formatMessage({
            description: "SettingsGitHub - change the repository or token",
            defaultMessage: "Change repository or token…",
            id: "FY5Vaq",
          })}
        </Button>
      </div>
    </div>
  );
}

interface SettingsGitHubFormProps {
  onConnect: (credentials: GitHubCredentials) => Promise<void>;
  /** Shown when already connected, to go back without changing anything. */
  onCancel?: () => void;
}

function SettingsGitHubForm({ onConnect, onCancel }: SettingsGitHubFormProps): ReactElement {
  const intl = useIntl();
  const [owner, setOwner] = useState("");
  const [repository, setRepository] = useState("");
  const [token, setToken] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const isComplete =
    repository.trim() !== "" && token.trim() !== "" && (owner.trim() !== "" || repository.includes("/"));

  async function connect(): Promise<void> {
    setIsConnecting(true);
    try {
      await onConnect({ owner, repository, token });
    } finally {
      setIsConnecting(false);
    }
  }

  return (
    <div className="hero-card bg-surface flex flex-col gap-3 rounded-xl p-[18px]" data-testid="settings__github-setup">
      <span className="font-semibold">
        {intl.formatMessage({
          description: "SettingsGitHub - heading of the sign-in form",
          defaultMessage: "Connect a GitHub repository",
          id: "Dy0/YA",
        })}
      </span>
      <p className="text-muted text-[13px] leading-relaxed">
        {intl.formatMessage({
          description: "SettingsGitHub - explains what the form is for",
          defaultMessage:
            "Syncs straight with GitHub, so it works on your phone and in any browser. Use a private repository; an empty one is fine.",
          id: "YKv/xH",
        })}
      </p>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
        <TextField className="flex min-w-0 flex-col gap-1">
          <Label className="text-xs">
            {intl.formatMessage({
              description: "SettingsGitHub - username field",
              defaultMessage: "GitHub username",
              id: "VPHUx6",
            })}
          </Label>
          <Input
            value={owner}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="you"
            data-testid="settings__github-owner"
            onChange={(event: ChangeEvent<HTMLInputElement>) => setOwner(event.target.value)}
          />
        </TextField>
        <TextField className="flex min-w-0 flex-col gap-1">
          <Label className="text-xs">
            {intl.formatMessage({
              description: "SettingsGitHub - repository field",
              defaultMessage: "Repository",
              id: "fG1gNi",
            })}
          </Label>
          <Input
            value={repository}
            autoCapitalize="none"
            spellCheck={false}
            placeholder="klart-data"
            className="font-mono"
            data-testid="settings__github-repository"
            onChange={(event: ChangeEvent<HTMLInputElement>) => setRepository(event.target.value)}
          />
        </TextField>
      </div>
      <TextField className="flex min-w-0 flex-col gap-1">
        <Label className="text-xs">
          {intl.formatMessage({
            description: "SettingsGitHub - access token field (used instead of a password)",
            defaultMessage: "Personal access token",
            id: "vq/z+Z",
          })}
        </Label>
        <Input
          type="password"
          value={token}
          autoComplete="current-password"
          spellCheck={false}
          placeholder="github_pat_…"
          className="font-mono"
          data-testid="settings__github-token"
          onChange={(event: ChangeEvent<HTMLInputElement>) => setToken(event.target.value)}
        />
        <Description className="text-xs leading-relaxed">
          {intl.formatMessage(
            {
              description: "SettingsGitHub - explains why a token is needed instead of a password, and how to make one",
              defaultMessage:
                "GitHub doesn't accept passwords for this. {link} with access to only this repository and Contents set to Read and write. It's stored on this device only.",
              id: "y+wls0",
            },
            {
              link: (
                <Link href={NEW_TOKEN_URL} target="_blank" rel="noreferrer" className="text-xs">
                  {intl.formatMessage({
                    description: "SettingsGitHub - link to GitHub's page for creating a fine-grained token",
                    defaultMessage: "Create a fine-grained token",
                    id: "RjQxxf",
                  })}
                </Link>
              ),
            }
          )}
        </Description>
      </TextField>
      <div className="flex flex-wrap gap-2">
        <Button
          isDisabled={!isComplete || isConnecting}
          onPress={() => void connect()}
          data-testid="settings__github-connect"
        >
          {isConnecting && <Spinner size="sm" />}
          {intl.formatMessage({
            description: "SettingsGitHub - button checking the token and connecting the repository",
            defaultMessage: "Connect",
            id: "n2u7lA",
          })}
        </Button>
        {onCancel && (
          <Button variant="secondary" onPress={onCancel}>
            {intl.formatMessage({
              description: "SettingsGitHub - leave the form without changing the connection",
              defaultMessage: "Cancel",
              id: "/KVAFG",
            })}
          </Button>
        )}
      </div>
    </div>
  );
}
