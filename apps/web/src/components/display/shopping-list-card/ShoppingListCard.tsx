import type { ReactElement } from "react";
import { CheckIcon } from "@heroicons/react/20/solid";
import { Button } from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import { ShoppingKindIcon } from "./ShoppingKind";
import { formatRelativeDate } from "~/components/display/task-row/TaskDateFormat";
import type { ContextColor } from "~/core/contexts/KlartContext";
import type { ShoppingListKind } from "~/core/shopping/ShoppingList";
import { addDays } from "~/core/tasks/LocalDate";

/** Display-ready list. Built by the route hook from a domain `ShoppingList`. */
export interface ShoppingListCardList {
  id: string;
  name: string;
  kind: ShoppingListKind;
  color: ContextColor;
  /** Local date the list is for, e.g. a birthday. */
  date: string | null;
  total: number;
  bought: number;
  isCompleted: boolean;
  /** The context the list belongs to, shown under "All contexts"; `null` hides it. */
  context: ShoppingListContext | null;
}

export interface ShoppingListContext {
  name: string;
  color: ContextColor;
}

export interface ShoppingListCardProps {
  list: ShoppingListCardList;
  today: string;
  isSelected?: boolean;
  onPress: (listId: string) => void;
}

/** The context's dot and name, in the context's own color. */
function ContextLabel({ context }: { context: ShoppingListContext }): ReactElement {
  return (
    <span
      className={clsx(`ctx-${context.color}`, "inline-flex min-w-0 items-center gap-1.5 text-xs")}
      data-testid="shopping-list-card__context"
    >
      <span className="size-1.5 shrink-0 rounded-full bg-(--ctx)" aria-hidden />
      <span className="truncate">{context.name}</span>
    </span>
  );
}

/**
 * A list in the lists column: its icon, name, items left with a progress bar, and its date and context when
 * it has them.
 */
export function ShoppingListCard({ list, today, isSelected = false, onPress }: ShoppingListCardProps): ReactElement {
  const intl = useIntl();
  const left = list.total - list.bought;
  const percent = list.total ? Math.round((100 * list.bought) / list.total) : 0;
  // Within three days the date turns amber, like a task that's coming up.
  const isSoon = !!list.date && list.date <= addDays(today, 3);

  if (list.isCompleted) {
    return (
      <Button
        variant="ghost"
        onPress={() => onPress(list.id)}
        aria-current={isSelected ? "page" : undefined}
        data-testid="shopping-list-card"
        className={clsx(
          "text-muted h-auto w-full justify-start gap-3 rounded-xl px-2.5 py-2 text-left font-normal",
          isSelected && "bg-surface-secondary"
        )}
      >
        <span className="grid size-[30px] shrink-0 place-items-center rounded-lg bg-[#17c964]/14 text-[#17a052] dark:text-[#45d483]">
          <CheckIcon className="size-3.5" aria-hidden />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-foreground/85 truncate">{list.name}</span>
          <span className="flex items-center gap-2.5 text-xs">
            {intl.formatMessage(
              {
                description: "ShoppingListCard - how many items of a completed list were bought",
                defaultMessage: "{bought} of {total} bought",
                id: "OBFnh2",
              },
              { bought: list.bought, total: list.total }
            )}
            {list.context && <ContextLabel context={list.context} />}
          </span>
        </span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      onPress={() => onPress(list.id)}
      aria-current={isSelected ? "page" : undefined}
      data-testid="shopping-list-card"
      className={clsx(
        `ctx-${list.color}`,
        "h-auto w-full justify-start gap-3 rounded-[14px] border border-transparent p-2.5 text-left font-normal",
        isSelected && "bg-surface-secondary border-separator"
      )}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-[11px] bg-(--ctx)/15 text-(--ctx)">
        <ShoppingKindIcon kind={list.kind} className="size-5" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="flex items-baseline gap-2">
          <span className="min-w-0 flex-1 truncate text-[15px] font-medium">{list.name}</span>
          <span className="text-muted text-xs">
            {left > 0
              ? intl.formatMessage(
                  {
                    description: "ShoppingListCard - how many items are left to buy",
                    defaultMessage: "{count} left",
                    id: "Xtfe+t",
                  },
                  { count: left }
                )
              : list.total === 0
                ? intl.formatMessage({
                    description: "ShoppingListCard - no item has been added to the list yet",
                    defaultMessage: "No items yet",
                    id: "kkZvzF",
                  })
                : intl.formatMessage({
                    description: "ShoppingListCard - every item on the list is bought",
                    defaultMessage: "All bought",
                    id: "T2gLYl",
                  })}
          </span>
        </span>
        <span aria-hidden className="bg-separator block h-1 overflow-hidden rounded-sm">
          <span
            className="block h-full rounded-sm bg-(--ctx) transition-[width] duration-400"
            style={{ width: `${percent}%` }}
          />
        </span>
        {(list.date || list.context) && (
          <span className="text-muted flex min-w-0 items-center gap-2.5">
            {list.date && (
              <span className={clsx("text-xs", isSoon ? "text-[#b8600f] dark:text-[#f5a524]" : "text-muted")}>
                {formatRelativeDate(intl, list.date, today)}
              </span>
            )}
            {list.context && <ContextLabel context={list.context} />}
          </span>
        )}
      </span>
    </Button>
  );
}
