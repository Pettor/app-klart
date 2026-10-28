import type { ReactElement, ReactNode } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Button, Separator, Tooltip } from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import { getSmartViewLabel } from "./MyDayLabels";
import { MyDaySidebarIcon } from "./MyDaySidebarIcon";
import { SHOPPING_ICON, SMART_VIEW_ICONS } from "./MyDaySmartViewNav";
import type { MyDaySidebarCollapseProps, MyDaySidebarProps } from "./MyDayTypes";
import { isMac } from "~/components/actions/command-palette/CommandShortcut";
import { ContextSwitcher } from "~/components/actions/context-switcher/ContextSwitcher";
import { SyncStatusCard } from "~/components/display/sync-status/SyncStatusCard";

export interface MyDaySidebarRailProps extends MyDaySidebarProps {
  collapse: MyDaySidebarCollapseProps;
  /** Shows the tags button, as the full sidebar shows its tag list. */
  showTags: boolean;
  className?: string;
}

/** The text of the shortcut that collapses and expands the sidebar. */
export function getSidebarShortcut(): string {
  return isMac() ? "⌘\\" : "Ctrl+\\";
}

interface RailButtonProps {
  label: string;
  tooltip?: string;
  onPress: () => void;
  isActive?: boolean;
  testId?: string;
  className?: string;
  children: ReactNode;
}

function RailButton({ label, tooltip, onPress, isActive, testId, className, children }: RailButtonProps): ReactElement {
  return (
    <Tooltip delay={300}>
      <Button
        isIconOnly
        variant="ghost"
        onPress={onPress}
        aria-label={label}
        aria-current={isActive ? "page" : undefined}
        data-testid={testId}
        className={clsx("relative size-10 rounded-[10px]", isActive && "bg-surface", className)}
      >
        {children}
      </Button>
      <Tooltip.Content placement="right">{tooltip ?? label}</Tooltip.Content>
    </Tooltip>
  );
}

/** The sidebar collapsed to a 64px rail of icons: context, search, smart views, tags and sync. */
export function MyDaySidebarRail({
  context,
  smartViews,
  tags,
  sync,
  shopping,
  collapse,
  showTags,
  className,
}: MyDaySidebarRailProps): ReactElement {
  const intl = useIntl();
  const expandLabel = intl.formatMessage({
    description: "MyDaySidebarRail - aria-label of the button expanding the sidebar",
    defaultMessage: "Expand sidebar",
    id: "R0EQCk",
  });
  const shoppingLabel = intl.formatMessage({
    description: "MyDaySidebarRail - aria-label of the button opening the shopping lists",
    defaultMessage: "Shopping",
    id: "l3AXLa",
  });

  return (
    <aside
      aria-label={intl.formatMessage({
        description: "MyDaySidebarRail - aria-label of the collapsed sidebar",
        defaultMessage: "Navigation",
        id: "bu7ykk",
      })}
      className={clsx(
        `ctx-${context.selectedColor}`,
        "sidebar-in border-separator z-10 w-16 shrink-0 flex-col items-center gap-2 border-r pt-10 pb-4",
        className
      )}
      data-testid="my-day__sidebar-rail"
    >
      <RailButton
        label={expandLabel}
        tooltip={`${expandLabel} (${getSidebarShortcut()})`}
        onPress={collapse.onToggle}
        testId="my-day__expand-sidebar"
        className="text-muted"
      >
        <MyDaySidebarIcon direction="expand" className="size-[18px]" />
      </RailButton>

      <ContextSwitcher
        variant="rail"
        options={context.options}
        selectedId={context.selectedId}
        onSelect={context.onSelect}
        onManage={context.onManage}
      />

      <RailButton
        label={intl.formatMessage({
          description: "MyDaySidebarRail - aria-label of the button expanding the sidebar to search",
          defaultMessage: "Search",
          id: "8gVZMw",
        })}
        onPress={collapse.onSearch}
        className="text-muted"
      >
        <MagnifyingGlassIcon className="size-[18px]" />
      </RailButton>

      <Separator className="my-1 w-7" />

      <nav
        aria-label={intl.formatMessage({
          description: "MyDaySidebarRail - smart views nav",
          defaultMessage: "Smart views",
          id: "QFvm0B",
        })}
        className="flex flex-col items-center gap-1"
      >
        {smartViews.items.map((item) => {
          const label = getSmartViewLabel(intl, item.id);
          return (
            <RailButton
              key={item.id}
              label={item.count > 0 ? `${label}, ${item.count}` : label}
              tooltip={label}
              onPress={() => smartViews.onSelect(item.id)}
              isActive={!shopping.isActive && item.id === smartViews.active}
              testId={`rail__view-${item.id}`}
            >
              {SMART_VIEW_ICONS[item.id]}
              {item.count > 0 && (
                <span
                  aria-hidden
                  className="bg-separator text-foreground absolute top-[3px] right-[3px] h-4 min-w-4 rounded-full px-1 text-center text-[10px] leading-4 font-semibold"
                >
                  {item.count}
                </span>
              )}
            </RailButton>
          );
        })}
        <RailButton
          label={shopping.count > 0 ? `${shoppingLabel}, ${shopping.count}` : shoppingLabel}
          tooltip={shoppingLabel}
          onPress={shopping.onOpen}
          isActive={shopping.isActive}
          testId="rail__shopping"
        >
          {SHOPPING_ICON}
          {shopping.count > 0 && (
            <span
              aria-hidden
              className="bg-separator text-foreground absolute top-[3px] right-[3px] h-4 min-w-4 rounded-full px-1 text-center text-[10px] leading-4 font-semibold"
            >
              {shopping.count}
            </span>
          )}
        </RailButton>
      </nav>

      {showTags && (
        <>
          <Separator className="my-1 w-7" />
          <RailButton
            label={intl.formatMessage({
              description: "MyDaySidebarRail - aria-label of the button expanding the sidebar to its tags",
              defaultMessage: "Tags",
              id: "s3HdCK",
            })}
            onPress={collapse.onToggle}
            className="text-lg font-bold text-(--tag)"
          >
            #{tags.active && <span aria-hidden className="absolute top-1.5 right-1.5 size-2 rounded-full bg-(--ctx)" />}
          </RailButton>
        </>
      )}

      <div className="mt-auto">
        <SyncStatusCard status={sync.status} onPress={sync.onPress} variant="icon" />
      </div>
    </aside>
  );
}
