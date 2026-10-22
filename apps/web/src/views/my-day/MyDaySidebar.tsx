import type { ReactElement } from "react";
import { Button, Separator } from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import { MyDaySmartViewNav } from "./MyDaySmartViewNav";
import type { MyDaySidebarProps } from "./MyDayTypes";
import { ContextSwitcher } from "~/components/actions/context-switcher/ContextSwitcher";
import { SyncStatusCard } from "~/components/display/sync-status/SyncStatusCard";
import { SearchField } from "~/components/input/input-field/SearchField";

export interface MyDaySidebarComponentProps extends MyDaySidebarProps {
  className?: string;
}

export function MyDaySidebar({
  context,
  search,
  smartViews,
  tags,
  sync,
  className,
}: MyDaySidebarComponentProps): ReactElement {
  const intl = useIntl();

  return (
    <aside
      className={clsx(
        `ctx-${context.selectedColor}`,
        "border-separator flex w-60 shrink-0 flex-col gap-4 border-r px-3 pt-10 pb-4",
        className
      )}
    >
      <div className="flex items-center px-2">
        <span className="text-[15px] font-bold">
          {intl.formatMessage({
            description: "MyDaySidebar - app name",
            defaultMessage: "Klart",
            id: "fk1n2t",
          })}
        </span>
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

      <MyDaySmartViewNav smartViews={smartViews} testIdPrefix="sidebar" />

      <Separator className="mx-2 w-auto" />

      {tags.items.length > 0 && (
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

      <div className="mt-auto">
        <SyncStatusCard status={sync.status} onPress={sync.onPress} />
      </div>
    </aside>
  );
}
