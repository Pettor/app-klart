import type { ReactElement } from "react";
import { ArrowTopRightOnSquareIcon, LinkIcon } from "@heroicons/react/20/solid";
import { Button, Drawer, Link, Popover } from "@heroui/react";
import { useIntl } from "react-intl";
import { formatTaskLink } from "~/core/tasks/TaskLink";

export interface TaskLinksButtonProps {
  /** Two or more `http(s)://` links. */
  links: string[];
  /** The task's title, shown above the list. */
  title: string;
  /** A popover beside the button, or a bottom sheet on phones. */
  variant: "popover" | "sheet";
}

/** The link without its scheme, e.g. `github.com/acme/repo/pull/412`. */
function formatLinkPath(link: string): string {
  return link.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

/** One button standing in for all of a task's links, with their count; pressing it lists them. */
export function TaskLinksButton({ links, title, variant }: TaskLinksButtonProps): ReactElement {
  const intl = useIntl();
  const isSheet = variant === "sheet";
  const label = intl.formatMessage(
    {
      description: "TaskLinksButton - aria-label of the button listing a task's links, and heading of that list",
      defaultMessage: "{count} links",
      id: "GX7kZ4",
    },
    { count: links.length }
  );

  const list = (
    <div className="flex flex-col gap-0.5">
      <div className="flex flex-col gap-0.5 px-3 pt-2 pb-2">
        <span className="text-muted text-[13px] font-semibold">{label}</span>
        <span className={isSheet ? "text-[15px] font-semibold" : "line-clamp-2 text-sm font-semibold"}>{title}</span>
      </div>
      {links.map((link) => {
        const host = formatTaskLink(link);
        return (
          <Link
            key={link}
            href={link}
            target="_blank"
            rel="noreferrer"
            data-testid="task-links__link"
            className="text-foreground hover:bg-surface-secondary flex min-h-14 items-center gap-3 rounded-xl px-3 py-1.5 no-underline"
          >
            <span
              aria-hidden
              className="bg-surface-tertiary grid size-[34px] shrink-0 place-items-center rounded-[10px] text-sm font-bold text-(--tag)"
            >
              {host.charAt(0).toUpperCase()}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="font-medium">{host}</span>
              <span className="text-muted truncate text-xs">{formatLinkPath(link)}</span>
            </span>
            <ArrowTopRightOnSquareIcon className="text-muted size-4 shrink-0" aria-hidden />
          </Link>
        );
      })}
    </div>
  );

  const trigger = (
    <Button
      isIconOnly
      variant="ghost"
      aria-label={label}
      data-testid="task-row__links"
      className="relative z-10 size-9 shrink-0 overflow-visible rounded-[10px] bg-(--tag)/14 text-(--tag) hover:bg-(--tag)/28 max-sm:size-10 max-sm:rounded-xl"
    >
      <LinkIcon className="size-4" aria-hidden />
      <span
        aria-hidden
        className="bg-accent text-accent-foreground absolute -top-1 -right-1 h-[18px] min-w-[18px] rounded-full px-[5px] text-[11px] leading-[18px] font-bold ring-2 ring-(--slab)"
      >
        {links.length}
      </span>
    </Button>
  );

  if (isSheet) {
    return (
      <Drawer>
        {trigger}
        <Drawer.Backdrop>
          <Drawer.Content placement="bottom">
            <Drawer.Dialog aria-label={label} className="pb-[max(1rem,env(safe-area-inset-bottom))]">
              <Drawer.Handle />
              <Drawer.Body className="px-2">{list}</Drawer.Body>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    );
  }

  return (
    <Popover>
      {trigger}
      <Popover.Content placement="bottom end" className="w-80">
        <Popover.Dialog aria-label={label} className="p-1.5">
          {list}
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}
