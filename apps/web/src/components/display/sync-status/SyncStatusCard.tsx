import type { ReactElement } from "react";
import { CheckIcon, ExclamationTriangleIcon as ExclamationTriangleSolidIcon } from "@heroicons/react/20/solid";
import {
  ArrowPathIcon,
  ArrowUpCircleIcon,
  ChevronRightIcon,
  CloudIcon,
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { Button, Tooltip } from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import type { SyncOverview, SyncOverviewContext, SyncOverviewTarget } from "~/core/sync/SyncTargets";

export interface SyncStatusCardProps {
  overview: SyncOverview;
  onPress: () => void;
  /** Rendered at this time; injected so stories are stable. */
  now?: number;
  /** `icon` is the square button in the collapsed sidebar, with the status in a tooltip. */
  variant?: "card" | "icon";
}

function ContextDots({ contexts }: { contexts: SyncOverviewContext[] }): ReactElement {
  return (
    <span className="flex shrink-0 items-center gap-0.5" title={contexts.map((context) => context.name).join(", ")}>
      {contexts.map((context) => (
        <span key={context.id} className={clsx(`ctx-${context.color}`, "size-2 rounded-full bg-(--ctx)")} />
      ))}
    </span>
  );
}

function TargetStateIcon({ target }: { target: SyncOverviewTarget }): ReactElement {
  if (target.hasProblem || target.status.state === "needs-permission" || target.status.state === "outdated") {
    return (
      <ExclamationTriangleSolidIcon
        className={clsx("size-3.5 shrink-0", target.hasProblem ? "text-danger" : "text-warning")}
        aria-hidden
      />
    );
  }
  if (!target.status.lastSyncedAt) {
    return <ArrowPathIcon className="text-muted size-3.5 shrink-0 animate-spin" aria-hidden />;
  }
  return <CheckIcon className="text-success size-3.5 shrink-0" aria-hidden />;
}

/** One line per sync: its state, its name and the contexts it holds; then contexts kept on this device. */
function SyncTargetRows({ overview }: { overview: SyncOverview }): ReactElement {
  const intl = useIntl();
  return (
    <span className="flex flex-col gap-1 pt-1" data-testid="sync-status-card__targets">
      {overview.targets.map((target) => (
        <span key={target.id} className="flex items-center gap-1.5 text-xs" data-testid="sync-status-card__target">
          <TargetStateIcon target={target} />
          <span className="min-w-0 flex-1 truncate">{target.name}</span>
          <ContextDots contexts={target.contexts} />
        </span>
      ))}
      {overview.localContexts.length > 0 && (
        <span className="text-muted flex items-center gap-1.5 text-xs">
          <ComputerDesktopIcon className="size-3.5 shrink-0" aria-hidden />
          <span className="min-w-0 flex-1 truncate">
            {intl.formatMessage({
              description: "SyncStatusCard - row for contexts that aren't synced anywhere",
              defaultMessage: "This device only",
              id: "geJLpJ",
            })}
          </span>
          <ContextDots contexts={overview.localContexts} />
        </span>
      )}
    </span>
  );
}

export function SyncStatusCard({
  overview,
  onPress,
  now = Date.now(),
  variant = "card",
}: SyncStatusCardProps): ReactElement {
  const intl = useIntl();
  const { targets } = overview;
  // One sync covering every context reads as before; several (or contexts left out) list each sync.
  const showTargets = targets.length > 1 || (targets.length > 0 && overview.localContexts.length > 0);
  const troubled = targets.find((target) => target.hasProblem);

  let icon = <ComputerDesktopIcon className="text-muted size-[18px]" aria-hidden />;
  let title = intl.formatMessage({
    description: "SyncStatusCard - title when data is only stored in this browser",
    defaultMessage: "Only on this device",
    id: "1rX5M5",
  });
  let subtitle = intl.formatMessage({
    description: "SyncStatusCard - subtitle inviting to set up sync",
    defaultMessage: "Set up folder sync",
    id: "bZWXp/",
  });
  const targetNames = targets.map((target) => target.name).join(", ");

  if (overview.state === "outdated") {
    icon = <ArrowUpCircleIcon className="text-warning size-[18px]" aria-hidden />;
    title = intl.formatMessage({
      description: "SyncStatusCard - title when a newer version of the app synced and this one paused syncing",
      defaultMessage: "Update to keep syncing",
      id: "gxtfYp",
    });
    subtitle = intl.formatMessage(
      {
        description: "SyncStatusCard - subtitle naming the version the sync needs",
        defaultMessage: "Needs version {version} or newer",
        id: "xv9HsF",
      },
      { version: overview.folderVersion ?? "" }
    );
  } else if (overview.state === "needs-permission") {
    icon = <ExclamationTriangleIcon className="text-warning size-[18px]" aria-hidden />;
    title = intl.formatMessage({
      description: "SyncStatusCard - title when folder access must be granted again",
      defaultMessage: "Reconnect folder",
      id: "sFC1k5",
    });
    subtitle = targets.find((target) => target.status.state === "needs-permission")?.name ?? "";
  } else if (overview.state === "error") {
    icon = <ExclamationTriangleIcon className="text-danger size-[18px]" aria-hidden />;
    title = intl.formatMessage({
      description: "SyncStatusCard - title when sync failed",
      defaultMessage: "Sync problem",
      id: "KG4p0i",
    });
    subtitle =
      troubled?.status.state === "missing"
        ? intl.formatMessage(
            {
              description: "SyncStatusCard - a sync's folder can't be found on this computer",
              defaultMessage: "{name}: folder not found",
              id: "BZUHUe",
            },
            { name: troubled.name }
          )
        : (overview.error ?? troubled?.name ?? "");
  } else if (overview.state === "syncing" || overview.state === "synced") {
    icon = <CloudIcon className="text-success size-[18px]" aria-hidden />;
    const seconds = overview.lastSyncedAt ? Math.round((Date.parse(overview.lastSyncedAt) - now) / 1000) : null;
    if (seconds === null) {
      title = intl.formatMessage({
        description: "SyncStatusCard - title while syncing",
        defaultMessage: "Syncing…",
        id: "eP7ub+",
      });
    } else {
      const ago =
        seconds > -60
          ? intl.formatMessage({
              description: "SyncStatusCard - synced moments ago",
              defaultMessage: "just now",
              id: "WaaNo8",
            })
          : intl.formatRelativeTime(Math.round(seconds / 60), "minute", { numeric: "auto" });
      title = `${intl.formatMessage({
        description: "SyncStatusCard - prefix before the relative time",
        defaultMessage: "Synced",
        id: "UFubm9",
      })} ${ago}`;
    }
    subtitle =
      showTargets && seconds !== null
        ? intl.formatMessage(
            {
              description: "SyncStatusCard - subtitle when every sync is up to date",
              defaultMessage: "{count, plural, one {# sync} other {# syncs}}, all contexts up to date",
              id: "UUyVwX",
            },
            { count: targets.length }
          )
        : targetNames;
  }

  if (variant === "icon") {
    return (
      <Tooltip delay={300}>
        <Button
          isIconOnly
          variant="ghost"
          onPress={onPress}
          aria-label={subtitle ? `${title}. ${subtitle}` : title}
          data-testid="sync-status-card"
          className="relative size-10 rounded-[10px] [&_svg]:size-5"
        >
          {icon}
          {showTargets && (
            <span className="bg-surface-secondary text-foreground absolute right-0.5 bottom-0.5 rounded-full px-1 text-[9px] leading-tight font-semibold">
              {targets.length}
            </span>
          )}
        </Button>
        <Tooltip.Content placement="right" className="flex max-w-60 flex-col">
          <span className="font-medium">{title}</span>
          {showTargets ? <SyncTargetRows overview={overview} /> : subtitle && <span>{subtitle}</span>}
        </Tooltip.Content>
      </Tooltip>
    );
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
      <span className="self-start">{icon}</span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[13px] font-medium">{title}</span>
        <span className="text-muted truncate text-xs">{subtitle}</span>
        {showTargets && <SyncTargetRows overview={overview} />}
      </span>
      <ChevronRightIcon className="text-muted size-4 self-center" aria-hidden />
    </Button>
  );
}
