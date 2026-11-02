import type { ReactElement } from "react";
import { CheckIcon, PlusIcon } from "@heroicons/react/20/solid";
import { MoonIcon } from "@heroicons/react/24/outline";
import { Button } from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import type { SuggestionItem } from "./SuggestionList";
import { SuggestionImportantIcon, SuggestionOpenOverlay } from "./SuggestionRow";
import { getWhyText, WHY_TONE_CLASS } from "./SuggestionWhy";

export interface SuggestionTopPickProps {
  item: SuggestionItem;
  /** On its way to My Day: the + has turned into a check. */
  isLeaving: boolean;
  onAdd: () => void;
  onSnooze: () => void;
  onOpen?: () => void;
}

/** The one suggestion most worth pulling in, with its reason and its two choices spelled out. */
export function SuggestionTopPick({ item, isLeaving, onAdd, onSnooze, onOpen }: SuggestionTopPickProps): ReactElement {
  const intl = useIntl();
  const label = intl.formatMessage({
    description: "SuggestionTopPick - label of the card with the best suggestion",
    defaultMessage: "Top pick",
    id: "G9MqUK",
  });

  return (
    <article
      aria-label={label}
      className={clsx(
        `ctx-${item.contextColor}`,
        "suggestion-card relative flex flex-col gap-3 overflow-hidden py-3.5 pr-4 pl-[18px]"
      )}
      data-testid="suggestion-list__top-pick"
    >
      <span className="absolute inset-y-0 left-0 w-1 bg-(--ctx)" aria-hidden />
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-muted font-semibold tracking-wider uppercase">{label}</span>
        <span
          className={clsx(
            "inline-flex h-[22px] items-center rounded-full bg-black/5 px-2 font-medium dark:bg-white/6",
            WHY_TONE_CLASS[item.why.type]
          )}
        >
          {getWhyText(intl, item.why)}
        </span>
      </div>
      <div className="relative">
        {onOpen && <SuggestionOpenOverlay title={item.title} onOpen={onOpen} />}
        <span className="line-clamp-2 text-[17px] leading-snug font-semibold">{item.title}</span>
      </div>
      <div className="text-muted flex items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-(--ctx)" aria-hidden />
          {item.contextName}
        </span>
        {item.important && <SuggestionImportantIcon />}
      </div>
      <div className="flex gap-2">
        <Button
          onPress={onAdd}
          className="text-background h-[38px] flex-1 rounded-[10px] bg-(--ctx) text-sm font-semibold"
          data-testid="suggestion-list__top-pick-add"
        >
          {isLeaving ? (
            <CheckIcon className="slab-pop size-4" aria-hidden />
          ) : (
            <PlusIcon className="size-4" aria-hidden />
          )}
          {intl.formatMessage({
            description: "SuggestionTopPick - button adding the top pick to My Day",
            defaultMessage: "Add to My Day",
            id: "GKNiet",
          })}
        </Button>
        <Button
          variant="secondary"
          onPress={onSnooze}
          className="h-[38px] rounded-[10px] px-3 text-[13px] font-medium"
          data-testid="suggestion-list__top-pick-snooze"
        >
          <MoonIcon className="size-[15px]" aria-hidden />
          {intl.formatMessage({
            description: "SuggestionTopPick - button hiding the top pick until tomorrow",
            defaultMessage: "Not today",
            id: "Hka5ga",
          })}
        </Button>
      </div>
    </article>
  );
}
