import type { ReactElement } from "react";
import { ChevronRightIcon, CloudIcon, ComputerDesktopIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Button } from "@heroui/react";
import clsx from "clsx";
import { FormattedRelativeTime, useIntl } from "react-intl";
import type { SyncStatus } from "~/core/sync/SyncAtoms";

export interface SyncStatusCardProps {
  status: SyncStatus;
  onPress: () => void;
  /** Rendered at this time; injected so stories are stable. */
  now?: number;
}

export function SyncStatusCard({ status, onPress, now = Date.now() }: SyncStatusCardProps): ReactElement {
  const intl = useIntl();

  let icon = <ComputerDesktopIcon className="text-muted size-[18px]" aria-hidden />;
  let title: ReactElement | string = intl.formatMessage({
    description: "SyncStatusCard - title when data is only stored in this browser",
    defaultMessage: "Only on this device",
    id: "1rX5M5",
  });
  let subtitle = intl.formatMessage({
    description: "SyncStatusCard - subtitle inviting to set up sync",
    defaultMessage: "Set up folder sync",
    id: "bZWXp/",
  });

  if (status.state === "needs-permission") {
    icon = <ExclamationTriangleIcon className="text-warning size-[18px]" aria-hidden />;
    title = intl.formatMessage({
      description: "SyncStatusCard - title when folder access must be granted again",
      defaultMessage: "Reconnect folder",
      id: "sFC1k5",
    });
    subtitle = status.folderName ?? "";
  } else if (status.state === "error") {
    icon = <ExclamationTriangleIcon className="text-danger size-[18px]" aria-hidden />;
    title = intl.formatMessage({
      description: "SyncStatusCard - title when sync failed",
      defaultMessage: "Sync problem",
      id: "KG4p0i",
    });
    subtitle = status.error ?? status.folderName ?? "";
  } else if (status.state === "syncing" || status.state === "synced") {
    icon = <CloudIcon className="text-success size-[18px]" aria-hidden />;
    const seconds = status.lastSyncedAt ? Math.round((Date.parse(status.lastSyncedAt) - now) / 1000) : null;
    title =
      seconds === null ? (
        intl.formatMessage({
          description: "SyncStatusCard - title while syncing",
          defaultMessage: "Syncing…",
          id: "eP7ub+",
        })
      ) : (
        <>
          {intl.formatMessage({
            description: "SyncStatusCard - prefix before the relative time",
            defaultMessage: "Synced",
            id: "UFubm9",
          })}{" "}
          {seconds > -60 ? (
            intl.formatMessage({
              description: "SyncStatusCard - synced moments ago",
              defaultMessage: "just now",
              id: "WaaNo8",
            })
          ) : (
            <FormattedRelativeTime value={Math.round(seconds / 60)} unit="minute" numeric="auto" />
          )}
        </>
      );
    subtitle = status.folderName ?? "";
  }

  return (
    <Button
      variant="secondary"
      onPress={onPress}
      data-testid="sync-status-card"
      className={clsx(
        "text-foreground h-auto w-full justify-start gap-2.5 rounded-xl px-2.5 py-2.5 text-left font-normal"
      )}
    >
      {icon}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[13px] font-medium">{title}</span>
        <span className="text-muted truncate text-xs">{subtitle}</span>
      </span>
      <ChevronRightIcon className="text-muted size-4" aria-hidden />
    </Button>
  );
}
