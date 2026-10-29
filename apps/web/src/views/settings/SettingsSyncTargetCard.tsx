import { useState, type ChangeEvent, type KeyboardEvent, type ReactElement } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import { Button, Chip, Input, TextField } from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import { SettingsFolderPanel } from "./SettingsFolderPanel";
import { SettingsGitHubPanel } from "./SettingsGitHubPanel";
import { SettingsGitPanel } from "./SettingsGitPanel";
import type { SyncOverviewTarget } from "~/core/sync/SyncTargets";
import type { GitHubCredentials } from "~/core/sync/UseFolderSync";

export interface SettingsSyncTargetCardProps {
  target: SyncOverviewTarget;
  /** List the contexts this sync holds; only worth it when contexts are split. */
  showContexts: boolean;
  /** More than one sync: offer "Make primary". */
  canMakePrimary: boolean;
  onConnect: () => void;
  onConnectGit: () => void;
  onConnectGitHub: (credentials: GitHubCredentials) => Promise<boolean>;
  onReconnect: () => void;
  onRemove: () => void;
  onRename: (name: string) => void;
  onMakePrimary: () => void;
  onSyncNow: () => void;
  now: number;
}

/** One sync: its name, where it syncs, its state and which contexts it holds. */
export function SettingsSyncTargetCard({
  target,
  showContexts,
  canMakePrimary,
  onConnect,
  onConnectGit,
  onConnectGitHub,
  onReconnect,
  onRemove,
  onRename,
  onMakePrimary,
  onSyncNow,
  now,
}: SettingsSyncTargetCardProps): ReactElement {
  const intl = useIntl();
  // The name is edited in place; it is saved on blur or Enter.
  const [draft, setDraft] = useState<string | null>(null);

  function commit(): void {
    const name = draft?.trim();
    if (name && name !== target.name) {
      onRename(name);
    }
    setDraft(null);
  }

  const title = (
    <div className="flex flex-wrap items-center gap-2">
      <TextField
        className="min-w-0 flex-1"
        aria-label={intl.formatMessage({
          description: "SettingsSyncTarget - aria-label of the sync's name field",
          defaultMessage: "Sync name",
          id: "P8s5tI",
        })}
      >
        <Input
          value={draft ?? target.name}
          data-testid="settings__sync-target-name"
          className="font-semibold"
          onChange={(event: ChangeEvent<HTMLInputElement>) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => event.key === "Enter" && commit()}
        />
      </TextField>
      {target.isPrimary && canMakePrimary && (
        <Chip size="sm" variant="soft" color="accent">
          {intl.formatMessage({
            description: "SettingsSyncTarget - marks the primary sync, which gets new contexts and shopping lists",
            defaultMessage: "Primary",
            id: "GXrMhJ",
          })}
        </Chip>
      )}
    </div>
  );

  const footer = (
    <div className="border-separator flex flex-col gap-2 border-t pt-3">
      {target.status.state === "outdated" && (
        <span className="text-warning flex items-center gap-2 text-[13px]" data-testid="settings__sync-outdated">
          <ExclamationTriangleIcon className="size-4 shrink-0" aria-hidden />
          {intl.formatMessage(
            {
              description: "SettingsSyncTarget - a newer version of the app synced here, so this one paused syncing",
              defaultMessage:
                "A device with version {version} or newer has synced here. Update this app to keep syncing; your changes stay on this device until then.",
              id: "rDWqMD",
            },
            { version: target.status.folderVersion ?? "" }
          )}
        </span>
      )}
      {target.method === "git" && target.status.state === "missing" && (
        <span className="text-danger flex items-center gap-2 text-[13px]">
          <ExclamationTriangleIcon className="size-4" aria-hidden />
          {intl.formatMessage({
            description: "SettingsSyncTarget - the Git clone's folder can't be found",
            defaultMessage: "The clone's folder can't be found. Pick where it is now, or stop syncing with it.",
            id: "dA0yGB",
          })}
        </span>
      )}
      {showContexts && (
        <div className="flex flex-wrap items-center gap-1.5 text-[13px]" data-testid="settings__sync-target-contexts">
          <span className="text-muted">
            {intl.formatMessage({
              description: "SettingsSyncTarget - label before the contexts this sync holds",
              defaultMessage: "Contexts:",
              id: "Ip1Al1",
            })}
          </span>
          {target.contexts.length === 0 && (
            <span className="text-muted">
              {intl.formatMessage({
                description: "SettingsSyncTarget - this sync holds no contexts",
                defaultMessage: "none yet",
                id: "dNzH5f",
              })}
            </span>
          )}
          {target.contexts.map((context) => (
            <span key={context.id} className={clsx(`ctx-${context.color}`, "flex items-center gap-1")}>
              <span className="size-2 rounded-full bg-(--ctx)" aria-hidden />
              {context.name}
            </span>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {canMakePrimary && !target.isPrimary && (
          <Button size="sm" variant="ghost" onPress={onMakePrimary} data-testid="settings__sync-make-primary">
            {intl.formatMessage({
              description: "SettingsSyncTarget - make this the sync that gets new contexts and shopping lists",
              defaultMessage: "Make primary",
              id: "F8qikO",
            })}
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="text-danger"
          onPress={onRemove}
          data-testid="settings__sync-remove"
        >
          {intl.formatMessage({
            description: "SettingsSyncTarget - stop syncing with this sync; the data stays on this device",
            defaultMessage: "Stop syncing",
            id: "UQzpX6",
          })}
        </Button>
      </div>
    </div>
  );

  return (
    <div data-testid="settings__sync-target">
      {target.method === "github" ? (
        <SettingsGitHubPanel
          status={target.status}
          onConnectGitHub={onConnectGitHub}
          onSyncNow={onSyncNow}
          now={now}
          title={title}
          footer={footer}
        />
      ) : target.method === "git" ? (
        <SettingsGitPanel
          status={target.status}
          onConnectGit={onConnectGit}
          onCloneGit={() => undefined}
          onSyncNow={onSyncNow}
          now={now}
          title={title}
          footer={footer}
        />
      ) : (
        <SettingsFolderPanel
          status={target.status}
          onReconnect={onReconnect}
          onSyncNow={onSyncNow}
          onChoose={onConnect}
          title={title}
          footer={footer}
        />
      )}
    </div>
  );
}
