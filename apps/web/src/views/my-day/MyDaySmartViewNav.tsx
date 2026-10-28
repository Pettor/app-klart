import type { ReactElement } from "react";
import { CalendarDaysIcon, HomeModernIcon, ShoppingCartIcon, StarIcon, SunIcon } from "@heroicons/react/24/outline";
import { Button } from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import { getSmartViewLabel } from "./MyDayLabels";
import type { MyDaySidebarProps } from "./MyDayTypes";
import type { SmartView } from "~/core/tasks/KlartAtoms";

/** Each smart view's icon, in its own color. Also used by the collapsed sidebar. */
export const SMART_VIEW_ICONS: Record<SmartView, ReactElement> = {
  day: <SunIcon className="size-[18px] text-(--ctx)" />,
  important: <StarIcon className="size-[18px] text-(--star)" />,
  planned: <CalendarDaysIcon className="midnight:text-[#3ddcc0] size-[18px] text-[#0b7285] dark:text-[#7fd1c8]" />,
  tasks: <HomeModernIcon className="midnight:text-[#a78bfa] size-[18px] text-[#6741d9] dark:text-[#b39dfa]" />,
};

/** The Shopping row's icon, green like a full cart. Also used by the collapsed sidebar. */
export const SHOPPING_ICON = (
  <ShoppingCartIcon className="midnight:text-[#45d483] size-[18px] text-[#2b8a4b] dark:text-[#45d483]" />
);

export interface MyDaySmartViewNavProps {
  smartViews: MyDaySidebarProps["smartViews"];
  shopping: MyDaySidebarProps["shopping"];
  /** Prefix for each item's `data-testid`, e.g. `sidebar` → `sidebar__view-day`. */
  testIdPrefix: string;
  /** Taller rows for touch targets. */
  isLarge?: boolean;
}

interface NavRowProps {
  icon: ReactElement;
  label: string;
  count: number;
  isActive: boolean;
  isLarge?: boolean;
  testId: string;
  onPress: () => void;
}

function NavRow({ icon, label, count, isActive, isLarge, testId, onPress }: NavRowProps): ReactElement {
  return (
    <Button
      variant="ghost"
      aria-current={isActive ? "page" : undefined}
      data-testid={testId}
      onPress={onPress}
      className={clsx(
        "w-full justify-start gap-3 rounded-lg px-2.5 text-left",
        isLarge ? "h-11" : "h-9",
        isActive ? "bg-surface-secondary font-semibold" : "font-normal"
      )}
    >
      <span aria-hidden className="flex">
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {count > 0 && <span className="text-muted text-xs font-normal">{count}</span>}
    </Button>
  );
}

/** My Day / Important / Planned / Tasks / Shopping, shared by the sidebar and the mobile drawer. */
export function MyDaySmartViewNav({
  smartViews,
  shopping,
  testIdPrefix,
  isLarge,
}: MyDaySmartViewNavProps): ReactElement {
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
      {smartViews.items.map((item) => (
        <NavRow
          key={item.id}
          icon={SMART_VIEW_ICONS[item.id]}
          label={getSmartViewLabel(intl, item.id)}
          count={item.count}
          isActive={!shopping.isActive && item.id === smartViews.active}
          isLarge={isLarge}
          testId={`${testIdPrefix}__view-${item.id}`}
          onPress={() => smartViews.onSelect(item.id)}
        />
      ))}
      <NavRow
        icon={SHOPPING_ICON}
        label={intl.formatMessage({
          description: "MyDaySmartViewNav - navigation entry opening the shopping lists",
          defaultMessage: "Shopping",
          id: "VoY8uZ",
        })}
        count={shopping.count}
        isActive={shopping.isActive}
        isLarge={isLarge}
        testId={`${testIdPrefix}__shopping`}
        onPress={shopping.onOpen}
      />
    </nav>
  );
}
