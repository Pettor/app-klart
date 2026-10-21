import type { ReactElement } from "react";
import { CalendarDaysIcon, HomeModernIcon, StarIcon, SunIcon } from "@heroicons/react/24/outline";
import { Button } from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import { getSmartViewLabel } from "./MyDayLabels";
import type { MyDaySidebarProps } from "./MyDayTypes";
import type { SmartView } from "~/core/tasks/KlartAtoms";

const SMART_VIEW_ICONS: Record<SmartView, ReactElement> = {
  day: <SunIcon className="size-[18px] text-(--ctx)" />,
  important: <StarIcon className="size-[18px] text-(--star)" />,
  planned: <CalendarDaysIcon className="size-[18px] text-[#0b7285] dark:text-[#7fd1c8]" />,
  tasks: <HomeModernIcon className="size-[18px] text-[#6741d9] dark:text-[#b39dfa]" />,
};

export interface MyDaySmartViewNavProps {
  smartViews: MyDaySidebarProps["smartViews"];
  /** Prefix for each item's `data-testid`, e.g. `sidebar` → `sidebar__view-day`. */
  testIdPrefix: string;
  /** Taller rows for touch targets. */
  isLarge?: boolean;
}

/** The My Day / Important / Planned / Tasks list shared by the sidebar and the mobile drawer. */
export function MyDaySmartViewNav({ smartViews, testIdPrefix, isLarge }: MyDaySmartViewNavProps): ReactElement {
  const intl = useIntl();

  return (
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
            data-testid={`${testIdPrefix}__view-${item.id}`}
            onPress={() => smartViews.onSelect(item.id)}
            className={clsx(
              "w-full justify-start gap-3 rounded-lg px-2.5 text-left",
              isLarge ? "h-11" : "h-9",
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
  );
}
