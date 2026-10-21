import type { ReactElement } from "react";
import { CalendarDaysIcon, HomeModernIcon, StarIcon, SunIcon } from "@heroicons/react/24/outline";
import { Button, Separator } from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import { getSmartViewLabel } from "./MyDayLabels";
import type { MyDaySidebarProps } from "./MyDayTypes";
import { ContextSwitcher } from "~/components/actions/context-switcher/ContextSwitcher";
import { SyncStatusCard } from "~/components/display/sync-status/SyncStatusCard";
import { SearchField } from "~/components/input/input-field/SearchField";
import type { SmartView } from "~/core/tasks/KlartAtoms";

const SMART_VIEW_ICONS: Record<SmartView, ReactElement> = {
  day: <SunIcon className="size-[18px] text-(--ctx)" />,
  important: <StarIcon className="size-[18px] text-(--star)" />,
  planned: <CalendarDaysIcon className="size-[18px] text-[#0b7285] dark:text-[#7fd1c8]" />,
  tasks: <HomeModernIcon className="size-[18px] text-[#6741d9] dark:text-[#b39dfa]" />,
};

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
        "border-separator flex w-64 shrink-0 flex-col gap-4 border-r px-3 pt-10 pb-4",
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
        type="search"
      />

      <nav
        aria-label={intl.formatMessage({
          description: "MyDaySidebar - smart views nav",
          defaultMessage: "Smart views",
          id: "28obBa",
        })}
        className="flex flex-col gap-0.5"
      >
        {smartViews.items.map((item) => {
          const isActive = item.id === smartViews.active;
          return (
            <Button
              key={item.id}
              variant="ghost"
              aria-current={isActive ? "page" : undefined}
              data-testid={`sidebar__view-${item.id}`}
              onPress={() => smartViews.onSelect(item.id)}
              className={clsx(
                "h-9 w-full justify-start gap-3 rounded-lg px-2.5 text-left",
                isActive ? "bg-surface-secondary font-semibold" : "font-normal"
              )}
            >
              <span aria-hidden className="flex">
                {SMART_VIEW_ICONS[item.id]}
              </span>
              <span className="flex-1">{getSmartViewLabel(intl, item.id)}</span>
              {item.count > 0 && <span className="text-muted text-xs font-normal">{item.count}</span>}
            </Button>
          );
        })}
      </nav>

      <Separator className="mx-2 w-auto" />

      {tags.items.length > 0 && (
        <nav
          aria-label={intl.formatMessage({
            description: "MyDaySidebar - tags nav",
            defaultMessage: "Tags",
            id: "MOwKhu",
          })}
          className="flex min-h-0 flex-col gap-0.5 overflow-y-auto"
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
