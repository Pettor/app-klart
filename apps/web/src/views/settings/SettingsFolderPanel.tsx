import type { ReactElement, ReactNode } from "react";
import { CheckIcon, ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import { Button } from "@heroui/react";
import { useIntl } from "react-intl";
import type { SyncStatus } from "~/core/sync/SyncAtoms";

export interface SettingsFolderPanelProps {
  status: SyncStatus;
  onReconnect: () => void;
  onSyncNow: () => void;
  /** Picks a different folder for this sync. */
  onChoose: () => void;
  /** Replaces the heading, e.g. with the sync's name. */
  title?: ReactNode;
  /** Shown at the bottom of the card. */
  footer?: ReactNode;
}

/** Folder sync: the connected folder and its state. */
export function SettingsFolderPanel({
  status,
  onReconnect,
  onSyncNow,
  onChoose,
  title,
  footer,
}: SettingsFolderPanelProps): ReactElement {
  const intl = useIntl();

  return (
    <div
      className="hero-card bg-surface flex flex-col gap-3 rounded-xl p-[18px]"
      data-testid="settings__folder-connected"
    >
      {title ?? (
        <span className="font-semibold">
          {intl.formatMessage({
            description: "SettingsSync - connected folder heading",
            defaultMessage: "Data folder",
            id: "zujlWi",
          })}
        </span>
      )}
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
        <Button variant="secondary" onPress={onChoose}>
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
      {status.state === "missing" && (
        <span className="text-danger flex items-center gap-2 text-[13px]" data-testid="settings__folder-missing">
          <ExclamationTriangleIcon className="size-4" aria-hidden />
          {intl.formatMessage({
            description: "SettingsSync - status line when the sync's folder can't be found",
            defaultMessage: "The folder can't be found. Choose where it is now, or stop syncing with it.",
            id: "szeq3a",
          })}
        </span>
      )}
      {status.state === "error" && (
        <span className="text-danger flex items-center gap-2 text-[13px]">
          <ExclamationTriangleIcon className="size-4" aria-hidden />
          {status.error}
        </span>
      )}
      {footer}
    </div>
  );
}
