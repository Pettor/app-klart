import type { ReactElement } from "react";
import { CheckIcon, PlusIcon, StarIcon } from "@heroicons/react/20/solid";
import { MoonIcon } from "@heroicons/react/24/outline";
import { Button } from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import type { SuggestionItem } from "./SuggestionList";
import { getWhyText, WHY_TONE_CLASS } from "./SuggestionWhy";

export interface SuggestionOpenOverlayProps {
  title: string;
  onOpen: () => void;
}

/**
 * An invisible button over a suggestion's text, so every line of it opens the task.
 * It must be the pressed element itself: React Aria drops a press released outside the button's box.
 */
export function SuggestionOpenOverlay({ title, onOpen }: SuggestionOpenOverlayProps): ReactElement {
  const intl = useIntl();

  return (
    <Button
      variant="ghost"
      aria-label={intl.formatMessage(
        {
          description: "SuggestionList - aria-label of a suggestion's title, which opens the task editor",
          defaultMessage: "Edit task: {title}",
          id: "JF1JER",
        },
        { title }
      )}
      onPress={onOpen}
      className="absolute inset-0 h-auto min-h-0 w-auto transform-none rounded-md p-0 data-[hovered=true]:bg-transparent data-[pressed=true]:bg-transparent"
      data-testid="suggestion-list__open"
    />
  );
}

export function SuggestionImportantIcon(): ReactElement {
  const intl = useIntl();

  return (
    <StarIcon
      role="img"
      className="text-warning size-3 shrink-0"
      aria-label={intl.formatMessage({
        description: "SuggestionList - label of the star on an important task",
        defaultMessage: "Important",
        id: "dA5R1z",
      })}
    />
  );
}

export interface SuggestionRowProps {
  item: SuggestionItem;
  /** On its way to My Day: the + has turned into a check. */
  isLeaving: boolean;
  onAdd: () => void;
  onSnooze: () => void;
  onOpen?: () => void;
}

/** One "Next up" suggestion. "Not today" stays out of the way until the row is hovered. */
export function SuggestionRow({ item, isLeaving, onAdd, onSnooze, onOpen }: SuggestionRowProps): ReactElement {
  const intl = useIntl();

  return (
    <div className={clsx(`ctx-${item.contextColor}`, "suggestion-row flex items-center gap-2.5 py-2 pr-1.5 pl-2.5")}>
      <span className="size-1.5 shrink-0 rounded-full bg-(--ctx)" aria-hidden />
      <div className="relative flex min-w-0 flex-1 flex-col gap-0.5">
        {onOpen && <SuggestionOpenOverlay title={item.title} onOpen={onOpen} />}
        <span className="truncate text-sm">{item.title}</span>
        <span className={clsx("inline-flex items-center gap-1.5 text-xs", WHY_TONE_CLASS[item.why.type])}>
          {getWhyText(intl, item.why)}
          {item.important && <SuggestionImportantIcon />}
        </span>
      </div>
      <div className="slab-reveal shrink-0">
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          aria-label={intl.formatMessage(
            {
              description: "SuggestionList - aria-label of the button hiding a suggestion until tomorrow",
              defaultMessage: "Not today: {title}",
              id: "OL1Trx",
            },
            { title: item.title }
          )}
          onPress={onSnooze}
          className="text-muted size-8 rounded-lg"
        >
          <MoonIcon className="size-[15px]" />
        </Button>
      </div>
      <Button
        isIconOnly
        size="sm"
        variant="outline"
        aria-label={intl.formatMessage(
          {
            description: "SuggestionList - aria-label of the button adding a suggestion to My Day",
            defaultMessage: "Add {title} to My Day",
            id: "qSIYMN",
          },
          { title: item.title }
        )}
        onPress={onAdd}
        className={clsx("size-8 shrink-0 rounded-lg", isLeaving && "text-(--ctx)")}
      >
        {isLeaving ? <CheckIcon className="slab-pop size-4" /> : <PlusIcon className="size-4" />}
      </Button>
    </div>
  );
}
