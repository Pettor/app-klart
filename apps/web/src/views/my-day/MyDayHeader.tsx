import type { ReactElement } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { BellIcon, CodeBracketIcon, LightBulbIcon } from "@heroicons/react/24/outline";
import { Button, Chip, ToggleButton } from "@heroui/react";
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
}

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
}: MyDayHeaderProps): ReactElement {
  const intl = useIntl();

  return (
    <header className="flex flex-wrap items-start gap-4">
      <div className="flex min-w-[200px] flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-[30px] leading-tight font-bold tracking-tight">{getSmartViewLabel(intl, smartView)}</h1>
          <Chip size="sm" variant="soft" className="bg-foreground/10 font-semibold text-(--ctx)">
            {contextName}
          </Chip>
          {tag && (
            <Button
              size="sm"
              variant="secondary"
              onPress={onClearTag}
              className="h-6 gap-1.5 rounded-full px-2.5 text-xs font-semibold text-(--tag)"
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

      <div className="hidden gap-2 sm:flex">
        <Button
          isIconOnly
          variant="secondary"
          onPress={onOpenNotifications}
          aria-label={intl.formatMessage({
            description: "MyDayHeader - aria-label of the notifications button",
            defaultMessage: "Notifications",
            id: "uNJYxM",
          })}
        >
          <BellIcon className="size-4" />
        </Button>
        <ToggleButton isSelected={isJsonOpen} onChange={onToggleJson} data-testid="my-day__toggle-json">
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
