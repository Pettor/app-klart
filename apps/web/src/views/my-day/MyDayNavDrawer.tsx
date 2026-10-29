import type { ReactElement } from "react";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { Button, Drawer, Separator } from "@heroui/react";
import { useIntl } from "react-intl";
import { MyDaySmartViewNav } from "./MyDaySmartViewNav";
import type { MyDaySidebarProps } from "./MyDayTypes";
import { SyncStatusCard } from "~/components/display/sync-status/SyncStatusCard";

export interface MyDayNavDrawerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  smartViews: MyDaySidebarProps["smartViews"];
  sync: MyDaySidebarProps["sync"];
  shopping: MyDaySidebarProps["shopping"];
  onOpenSettings: () => void;
}

/** Slide-in navigation for narrow screens: smart views, settings and sync status. */
export function MyDayNavDrawer({
  isOpen,
  onOpenChange,
  smartViews,
  sync,
  shopping,
  onOpenSettings,
}: MyDayNavDrawerProps): ReactElement {
  const intl = useIntl();

  // Every action in the drawer navigates somewhere, so it closes behind it.
  function closeAfter<T extends unknown[]>(action: (...args: T) => void): (...args: T) => void {
    return (...args) => {
      onOpenChange(false);
      action(...args);
    };
  }

  return (
    <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Backdrop>
        <Drawer.Content placement="left">
          <Drawer.Dialog
            className="w-72 max-w-[85vw]"
            data-testid="my-day__nav-drawer"
            aria-label={intl.formatMessage({
              description: "MyDayNavDrawer - aria-label of the navigation drawer",
              defaultMessage: "Navigation",
              id: "byLepq",
            })}
          >
            <Drawer.Header>
              <Drawer.Heading className="text-[15px] font-bold">
                {intl.formatMessage({
                  description: "MyDayNavDrawer - app name",
                  defaultMessage: "Klart",
                  id: "+cr12k",
                })}
              </Drawer.Heading>
              <Drawer.CloseTrigger />
            </Drawer.Header>
            <Drawer.Body className="flex flex-col gap-4">
              <MyDaySmartViewNav
                smartViews={{ ...smartViews, onSelect: closeAfter(smartViews.onSelect) }}
                shopping={{ ...shopping, onOpen: closeAfter(shopping.onOpen) }}
                testIdPrefix="nav-drawer"
                isLarge
              />
              <Separator />
              <Button
                variant="ghost"
                onPress={closeAfter(onOpenSettings)}
                data-testid="nav-drawer__settings"
                className="h-11 w-full justify-start gap-3 rounded-lg px-2.5 text-left font-normal"
              >
                <Cog6ToothIcon className="size-[18px]" aria-hidden />
                {intl.formatMessage({
                  description: "MyDayNavDrawer - button opening settings",
                  defaultMessage: "Settings and sync",
                  id: "400jFy",
                })}
              </Button>
            </Drawer.Body>
            <Drawer.Footer className="pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="w-full">
                <SyncStatusCard overview={sync.overview} onPress={closeAfter(sync.onPress)} />
              </div>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
