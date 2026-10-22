import type { ReactElement } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { BellIcon, CodeBracketIcon, LightBulbIcon } from "@heroicons/react/24/outline";
import { Button, Chip, ToggleButton } from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import { getSmartViewLabel } from "./MyDayLabels";
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
  isJsonOpen: boolean;
  onToggleJson: () => void;
  onOpenNotifications: () => void;
  /** Shows every task's tags instead of only on hover or focus. */
  showTags: boolean;
  onShowTagsChange: (showTags: boolean) => void;
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
  isJsonOpen,
  onToggleJson,
  onOpenNotifications,
  showTags,
  onShowTagsChange,
}: MyDayHeaderProps): ReactElement {
  const intl = useIntl();

  return (
    <header className="flex flex-wrap items-start gap-4">
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
        <ToggleButton
          isSelected={showTags}
          onChange={onShowTagsChange}
          className={clsx(HEADER_BUTTON, "pl-2.5")}
          data-testid="my-day__toggle-tags"
        >
          {/* A small switch drawn inside the button, as in the design; the button itself is the toggle. */}
          <span
            aria-hidden
            className={clsx(
              "relative h-4 w-7 shrink-0 rounded-full transition-colors",
              showTags ? "bg-(--ctx)" : "bg-foreground/20"
            )}
          >
            <span
              className={clsx(
                "absolute top-0.5 size-3 rounded-full bg-white shadow-[0_1px_3px_rgb(0_0_0/0.4)] transition-[left]",
                showTags ? "left-3.5" : "left-0.5"
              )}
            />
          </span>
          {intl.formatMessage({
            description: "MyDayHeader - toggle showing every task's tags",
            defaultMessage: "Tags",
            id: "QaRsVG",
          })}
        </ToggleButton>
        <ToggleButton
          isSelected={isJsonOpen}
          onChange={onToggleJson}
          className={clsx(HEADER_BUTTON, "max-sm:hidden")}
          data-testid="my-day__toggle-json"
        >
          <CodeBracketIcon className="size-4" aria-hidden />
          {intl.formatMessage({
            description: "MyDayHeader - toggles the agent JSON panel",
            defaultMessage: "JSON",
            id: "dG/6c2",
          })}
        </ToggleButton>
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
