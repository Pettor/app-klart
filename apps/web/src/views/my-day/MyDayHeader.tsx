import type { ReactElement } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { BellIcon, LightBulbIcon } from "@heroicons/react/24/outline";
import { Button, Chip, ToggleButton } from "@heroui/react";
import { useBreakpoint } from "@package/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import { MyDayDisplayMenu } from "./MyDayDisplayMenu";
import { getSmartViewLabel } from "./MyDayLabels";
import type { MyDayDisplayProps } from "./MyDayTypes";
import type { SmartView } from "~/core/tasks/KlartAtoms";
import { parseLocalDate } from "~/core/tasks/LocalDate";

export interface MyDayHeaderProps {
  today: string;
  smartView: SmartView;
  contextName: string;
  tag: string | null;
  onClearTag: () => void;
  suggestionCount: number;
  isSuggestionsOpen: boolean;
  onToggleSuggestions: () => void;
  onOpenNotifications: () => void;
  display: MyDayDisplayProps;
  contextColor: string;
}

/** The design's header buttons: flat, 36px tall, a faint fill whether or not they're pressed. */
const HEADER_BUTTON =
  "h-9 min-w-0 gap-2 rounded-lg px-3 text-[13px] font-normal text-foreground bg-black/5 hover:bg-black/9 " +
  "data-[selected=true]:bg-black/5 dark:bg-white/8 dark:hover:bg-white/12 dark:data-[selected=true]:bg-white/8";

export function MyDayHeader({
  today,
  smartView,
  contextName,
  tag,
  onClearTag,
  suggestionCount,
  isSuggestionsOpen,
  onToggleSuggestions,
  onOpenNotifications,
  display,
  contextColor,
}: MyDayHeaderProps): ReactElement {
  const intl = useIntl();
  const isDesktop = useBreakpoint("lg");

  return (
    <header className="flex flex-wrap items-start gap-4 max-lg:flex-nowrap max-lg:items-end">
      <div className="flex min-w-[200px] flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-[30px] leading-tight font-bold tracking-tight">{getSmartViewLabel(intl, smartView)}</h1>
          <Chip
            size="sm"
            variant="soft"
            className="h-6 rounded-full bg-black/6 px-2.5 text-xs font-semibold text-(--ctx) max-lg:hidden dark:bg-white/10"
          >
            {contextName}
          </Chip>
          {tag && (
            <Button
              size="sm"
              variant="secondary"
              onPress={onClearTag}
              className="h-6 min-w-0 gap-1.5 rounded-full bg-(--tag)/20 pr-1.5 pl-2.5 text-xs font-semibold text-(--tag)"
              aria-label={intl.formatMessage(
                {
                  description: "MyDayHeader - aria-label of the button clearing the tag filter",
                  defaultMessage: "Clear tag filter #{tag}",
                  id: "gjGKQu",
                },
                { tag }
              )}
            >
              #{tag}
              <XMarkIcon className="size-3" aria-hidden />
            </Button>
          )}
        </div>
        <span className="text-foreground/80 text-sm">
          {intl.formatDate(parseLocalDate(today), { weekday: "long", day: "numeric", month: "long" })}
        </span>
      </div>

      <div className="flex gap-2">
        <Button
          isIconOnly
          variant="ghost"
          onPress={onOpenNotifications}
          className={clsx(HEADER_BUTTON, "w-9 px-0 max-sm:hidden")}
          aria-label={intl.formatMessage({
            description: "MyDayHeader - aria-label of the notifications button",
            defaultMessage: "Notifications",
            id: "uNJYxM",
          })}
        >
          <BellIcon className="size-4" />
        </Button>
        <MyDayDisplayMenu
          display={display}
          variant={isDesktop ? "popover" : "sheet"}
          contextColor={contextColor}
          className={isDesktop ? HEADER_BUTTON : undefined}
        />
        <ToggleButton
          isSelected={isSuggestionsOpen}
          onChange={onToggleSuggestions}
          className={clsx(HEADER_BUTTON, "max-sm:hidden")}
          data-testid="my-day__toggle-suggestions"
        >
          <LightBulbIcon className="size-4" aria-hidden />
          {intl.formatMessage({
            description: "MyDayHeader - toggles the suggestions panel",
            defaultMessage: "Suggestions",
            id: "nKIanK",
          })}
          <span className="font-semibold text-(--ctx)">{suggestionCount}</span>
        </ToggleButton>
      </div>
    </header>
  );
}
