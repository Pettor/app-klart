import { useState, type ReactElement } from "react";
import { Bars3Icon, BellIcon } from "@heroicons/react/24/outline";
import { Button } from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import { MyDayNavDrawer } from "./MyDayNavDrawer";
import type { MyDayContextProps, MyDaySidebarProps, MyDayTagItem } from "./MyDayTypes";
import { ContextSwitcher } from "~/components/actions/context-switcher/ContextSwitcher";

export interface MyDayMobileBarProps {
  context: MyDayContextProps;
  smartViews: MyDaySidebarProps["smartViews"];
  sync: MyDaySidebarProps["sync"];
  shopping: MyDaySidebarProps["shopping"];
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  className?: string;
}

/** Top bar replacing the sidebar on narrow screens; its menu button opens the navigation drawer. */
export function MyDayMobileBar({
  context,
  smartViews,
  sync,
  shopping,
  onOpenNotifications,
  onOpenSettings,
  className,
}: MyDayMobileBarProps): ReactElement {
  const intl = useIntl();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className={clsx("flex items-center gap-1", className)}>
      <Button
        isIconOnly
        variant="ghost"
        onPress={() => setIsDrawerOpen(true)}
        data-testid="my-day__open-nav"
        aria-label={intl.formatMessage({
          description: "MyDayMobileBar - aria-label of the button opening the navigation drawer",
          defaultMessage: "Open menu",
          id: "FNQuIH",
        })}
      >
        <Bars3Icon className="size-5" />
      </Button>
      <ContextSwitcher
        variant="compact"
        options={context.options}
        selectedId={context.selectedId}
        onSelect={context.onSelect}
        onManage={context.onManage}
      />
      <span className="flex-1" />
      <Button
        isIconOnly
        variant="ghost"
        onPress={onOpenNotifications}
        aria-label={intl.formatMessage({
          description: "MyDayMobileBar - aria-label of the notifications button",
          defaultMessage: "Notifications",
          id: "r97zLO",
        })}
      >
        <BellIcon className="size-5" />
      </Button>
      <MyDayNavDrawer
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        smartViews={smartViews}
        sync={sync}
        shopping={shopping}
        onOpenSettings={onOpenSettings}
      />
    </div>
  );
}

export interface MyDayTagChipsProps {
  tags: MyDayTagItem[];
  active: string | null;
  onSelect: (tag: string | null) => void;
  className?: string;
}

/** Horizontally scrolling tag filter for narrow screens. */
export function MyDayTagChips({ tags, active, onSelect, className }: MyDayTagChipsProps): ReactElement | null {
  const intl = useIntl();
  if (tags.length === 0) {
    return null;
  }

  return (
    <div
      role="group"
      aria-label={intl.formatMessage({
        description: "MyDayTagChips - aria-label",
        defaultMessage: "Filter by tag",
        id: "R41b0E",
      })}
      className={clsx("-mx-4 flex gap-2 overflow-x-auto px-4 pb-1", className)}
    >
      {tags.map((item) => {
        const isActive = active === item.tag;
        return (
          <Button
            key={item.tag}
            size="sm"
            variant={isActive ? "primary" : "secondary"}
            aria-pressed={isActive}
            onPress={() => onSelect(isActive ? null : item.tag)}
            className={clsx("h-9 shrink-0 rounded-full", !isActive && "text-foreground")}
          >
            #{item.tag}
          </Button>
        );
      })}
    </div>
  );
}
