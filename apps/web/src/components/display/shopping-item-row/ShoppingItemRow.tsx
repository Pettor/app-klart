import type { ReactElement } from "react";
import { ArrowUpRightIcon, StarIcon, SunIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import { Button, Link, ToggleButton } from "@heroui/react";
import { useBreakpoint } from "@package/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import { formatKronor } from "~/components/display/shopping-list-card/ShoppingKind";
import { TaskCheck } from "~/components/display/task-row/TaskRowParts";
import { useTaskCompletion } from "~/components/display/task-row/UseTaskCompletion";
import { formatTaskLink } from "~/core/tasks/TaskLink";

/** Display-ready item. Built by the route hook from a domain `ShoppingItem`. */
export interface ShoppingItemRowItem {
  id: string;
  name: string;
  /** Shown as `× 2` when more than one. */
  qty: number | null;
  /** What the item costs in all, price times quantity. */
  total: number | null;
  link: string | null;
  note: string;
  bought: boolean;
  important: boolean;
  /** Linked to a task in today's My Day. */
  isInMyDay: boolean;
}

export interface ShoppingItemRowProps {
  item: ShoppingItemRowItem;
  onToggleBought: (itemId: string, bought: boolean) => void;
  onToggleImportant?: (itemId: string) => void;
  onToggleMyDay?: (itemId: string) => void;
  onRemove?: (itemId: string) => void;
  /** Draws a line above the row, between it and the one before. */
  hasSeparator?: boolean;
}

/**
 * One item on a shopping list: its price and link, then the sun, star and remove buttons. Checking it strikes the name
 * and lets the row collapse into "In the cart". The sun makes it a task in My Day; the buttons show on hover unless
 * they're on.
 */
export function ShoppingItemRow({
  item,
  onToggleBought,
  onToggleImportant,
  onToggleMyDay,
  onRemove,
  hasSeparator = false,
}: ShoppingItemRowProps): ReactElement {
  const intl = useIntl();
  const isPhone = !useBreakpoint("sm");
  const completion = useTaskCompletion(item.id, item.bought, onToggleBought, { leave: !item.bought });
  const host = item.link ? formatTaskLink(item.link) : null;

  return (
    <div className={clsx("slab-leave [--slab-gap:0px]", completion.phase === "leaving" && "slab-leaving")}>
      <div className="slab-leave-in">
        <div
          data-testid="shopping-item"
          className={clsx(
            "shop-row hover:bg-surface-secondary/60 flex min-h-[52px] items-center gap-1 py-1 pr-2 pl-1.5 transition-colors",
            hasSeparator && "border-separator border-t",
            completion.isChecking && "slab-checking",
            completion.phase === "leaving" && "opacity-0 transition-opacity duration-300"
          )}
        >
          <TaskCheck
            done={item.bought}
            isChecking={completion.isChecking}
            onPress={completion.toggle}
            testId="shopping-item__toggle"
          />
          <div className="flex min-w-0 flex-1 items-baseline gap-2.5">
            <span
              className={clsx(
                "min-w-0 truncate text-[15px]",
                item.bought ? "text-muted line-through" : item.important ? "font-semibold" : "font-normal"
              )}
              data-testid="shopping-item__name"
            >
              <span className={clsx(!item.bought && "slab-title")}>{item.name}</span>
            </span>
            {item.qty !== null && item.qty > 1 && (
              <span className="text-muted shrink-0 text-[13px]">
                {intl.formatMessage(
                  {
                    description: "ShoppingItemRow - how many of the item to buy",
                    defaultMessage: "× {qty}",
                    id: "0owFsn",
                  },
                  { qty: item.qty }
                )}
              </span>
            )}
            {item.note && !isPhone && <span className="text-muted min-w-0 truncate text-[13px]">{item.note}</span>}
          </div>

          {item.total !== null && (
            <span
              className={clsx("shrink-0 text-[13px] tabular-nums", item.bought ? "text-muted" : "text-foreground/85")}
            >
              {formatKronor(intl, item.total)}
            </span>
          )}

          {item.link && host && !item.bought && (
            <Link
              href={item.link}
              target="_blank"
              rel="noreferrer"
              aria-label={intl.formatMessage(
                {
                  description: "ShoppingItemRow - aria-label of the link to the product, opened in a new tab",
                  defaultMessage: "Open {name} on {host}",
                  id: "PL37zh",
                },
                { name: item.name, host }
              )}
              data-testid="shopping-item__link"
              className="inline-flex h-7 shrink-0 items-center gap-1 rounded-full bg-(--tag)/14 px-2.5 text-xs text-(--tag) no-underline transition hover:bg-(--tag)/28"
            >
              {!isPhone && host}
              <ArrowUpRightIcon className="size-3" aria-hidden />
            </Link>
          )}

          {!item.bought && onToggleMyDay && (
            <ToggleButton
              size="sm"
              variant="ghost"
              isIconOnly={!item.isInMyDay}
              isSelected={item.isInMyDay}
              onChange={() => onToggleMyDay(item.id)}
              aria-label={
                item.isInMyDay
                  ? intl.formatMessage({
                      description: "ShoppingItemRow - aria-label of the sun button when the item is a My Day task",
                      defaultMessage: "In My Day, press to remove",
                      id: "ASsfzR",
                    })
                  : intl.formatMessage({
                      description: "ShoppingItemRow - aria-label of the sun button making the item a My Day task",
                      defaultMessage: "Add to My Day",
                      id: "xrRmUp",
                    })
              }
              data-testid="shopping-item__my-day"
              className={clsx(
                "h-[30px] shrink-0 gap-1.5 rounded-full px-2 text-xs font-medium",
                item.isInMyDay ? "bg-accent/16 text-accent data-[selected=true]:bg-accent/16" : "slab-reveal text-muted"
              )}
            >
              <SunIcon className="size-4" aria-hidden />
              {item.isInMyDay &&
                !isPhone &&
                intl.formatMessage({
                  description: "ShoppingItemRow - label on the sun button of an item that's a My Day task",
                  defaultMessage: "My Day",
                  id: "JW90RN",
                })}
            </ToggleButton>
          )}

          {!item.bought && onToggleImportant && (
            <ToggleButton
              isIconOnly
              size="sm"
              variant="ghost"
              isSelected={item.important}
              onChange={() => onToggleImportant(item.id)}
              aria-label={intl.formatMessage({
                description: "ShoppingItemRow - aria-label of the important toggle",
                defaultMessage: "Important",
                id: "OoSCVe",
              })}
              data-testid="shopping-item__important"
              className={clsx(
                "size-[30px] shrink-0 rounded-full data-[selected=true]:bg-transparent",
                item.important ? "text-(--star)" : "slab-reveal text-muted"
              )}
            >
              {item.important ? <StarIcon className="size-4" /> : <StarOutlineIcon className="size-4" />}
            </ToggleButton>
          )}

          {!item.bought && onRemove && (
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              onPress={() => onRemove(item.id)}
              aria-label={intl.formatMessage(
                {
                  description: "ShoppingItemRow - aria-label of the button removing the item from the list",
                  defaultMessage: "Remove {name}",
                  id: "DxmStJ",
                },
                { name: item.name }
              )}
              data-testid="shopping-item__remove"
              className="slab-reveal text-muted size-[30px] shrink-0 rounded-full"
            >
              <XMarkIcon className="size-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
