import type { ReactElement } from "react";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { Button, Separator, Tooltip } from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import { MyDaySidebarIcon } from "./MyDaySidebarIcon";
import { getSidebarShortcut } from "./MyDaySidebarRail";
import { MyDaySmartViewNav } from "./MyDaySmartViewNav";
import type { MyDaySidebarCollapseProps, MyDaySidebarProps } from "./MyDayTypes";
import { ContextSwitcher } from "~/components/actions/context-switcher/ContextSwitcher";
import { SyncStatusCard } from "~/components/display/sync-status/SyncStatusCard";
import { SearchField } from "~/components/input/input-field/SearchField";

export interface MyDaySidebarComponentProps extends MyDaySidebarProps {
  collapse: MyDaySidebarCollapseProps;
  /** Shows the tag list, which filters My Day. */
  showTags: boolean;
  /** Opens settings on its General section. */
  onOpenSettings: () => void;
  className?: string;
}

export function MyDaySidebar({
  context,
  search,
  smartViews,
  tags,
  sync,
  shopping,
  collapse,
  showTags,
  onOpenSettings,
  className,
}: MyDaySidebarComponentProps): ReactElement {
  const intl = useIntl();
  const collapseLabel = intl.formatMessage({
    description: "MyDaySidebar - aria-label of the button collapsing the sidebar",
    defaultMessage: "Collapse sidebar",
    id: "X3977j",
  });

  return (
    <aside
      className={clsx(
        `ctx-${context.selectedColor}`,
        "sidebar-in border-separator flex w-60 shrink-0 flex-col gap-4 border-r px-3 pt-10 pb-4",
        className
      )}
    >
      <div className="flex items-center gap-2.5 pl-2">
        <span className="text-[15px] font-bold">
          {intl.formatMessage({
            description: "MyDaySidebar - app name",
            defaultMessage: "Klart",
            id: "fk1n2t",
          })}
        </span>
        <Tooltip delay={300}>
          <Button
            isIconOnly
            variant="ghost"
            onPress={collapse.onToggle}
            aria-label={collapseLabel}
            data-testid="my-day__collapse-sidebar"
            className="text-muted ml-auto size-[34px] min-w-0 rounded-lg"
          >
            <MyDaySidebarIcon direction="collapse" className="size-[18px]" />
          </Button>
          <Tooltip.Content placement="right">{`${collapseLabel} (${getSidebarShortcut()})`}</Tooltip.Content>
        </Tooltip>
      </div>

      <ContextSwitcher
        options={context.options}
        selectedId={context.selectedId}
        onSelect={context.onSelect}
        onManage={context.onManage}
      />

      <SearchField
        ariaLabel={intl.formatMessage({
          description: "MyDaySidebar - aria-label of the task search",
          defaultMessage: "Search tasks",
          id: "2FpFaN",
        })}
        placeholder={intl.formatMessage({
          description: "MyDaySidebar - placeholder of the task search",
          defaultMessage: "Search or #tag",
          id: "ZTdVH6",
        })}
        value={search.value}
        onChange={search.onChange}
        focusRequest={search.focusRequest}
        tags={search.tags}
        shortcutHint="/"
      />

      <MyDaySmartViewNav smartViews={smartViews} shopping={shopping} testIdPrefix="sidebar" />

      {showTags && tags.items.length > 0 && <Separator className="mx-2 w-auto" />}

      {showTags && tags.items.length > 0 && (
        <nav
          aria-label={intl.formatMessage({
            description: "MyDaySidebar - tags nav",
            defaultMessage: "Tags",
            id: "MOwKhu",
          })}
          className="-mx-1 -mb-1 flex min-h-0 flex-col gap-0.5 overflow-y-auto px-1 pb-1"
        >
          <span className="text-muted px-2.5 pb-1 text-[11px] font-semibold tracking-wider uppercase">
            {intl.formatMessage({
              description: "MyDaySidebar - tags heading",
              defaultMessage: "Tags",
              id: "7NBn+i",
            })}
          </span>
          {tags.items.map((item) => {
            const isActive = tags.active === item.tag;
            return (
              <Button
                key={item.tag}
                variant="ghost"
                aria-pressed={isActive}
                onPress={() => tags.onSelect(isActive ? null : item.tag)}
                className={clsx(
                  "h-[34px] w-full justify-start gap-3 rounded-lg px-2.5 text-left",
                  isActive ? "bg-surface-secondary font-semibold" : "font-normal"
                )}
              >
                <span aria-hidden className="w-[18px] text-center font-semibold text-(--tag)">
                  #
                </span>
                <span className="min-w-0 flex-1 truncate">{item.tag}</span>
                <span className="text-muted text-xs font-normal">{item.count}</span>
              </Button>
            );
          })}
        </nav>
      )}

      <div className="mt-auto flex flex-col gap-2">
        <Button
          variant="ghost"
          onPress={onOpenSettings}
          data-testid="my-day__settings"
          className="h-9 w-full justify-start gap-3 rounded-lg px-2.5 text-left font-normal"
        >
          <Cog6ToothIcon className="size-[18px]" aria-hidden />
          {intl.formatMessage({
            description: "MyDaySidebar - button opening settings",
            defaultMessage: "Settings",
            id: "vJgYBY",
          })}
        </Button>
        <SyncStatusCard overview={sync.overview} onPress={sync.onPress} />
      </div>
    </aside>
  );
}
