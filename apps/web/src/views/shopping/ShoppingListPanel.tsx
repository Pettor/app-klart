import type { ChangeEvent, KeyboardEvent, ReactElement } from "react";
import { CheckIcon, ChevronRightIcon, EllipsisHorizontalIcon } from "@heroicons/react/20/solid";
import { Button, Chip, Dropdown, Input, Label, TextField } from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import { ShoppingCompleteDialog } from "./ShoppingCompleteDialog";
import { ShoppingDeleteDialog } from "./ShoppingDeleteDialog";
import { ShoppingItemInput } from "./ShoppingItemInput";
import { getShoppingCategoryLabel } from "./ShoppingLabels";
import type {
  ShoppingDraftProps,
  ShoppingListActions,
  ShoppingMoveTarget,
  ShoppingSelectedList,
} from "./ShoppingTypes";
import { useShoppingListPanel } from "./UseShoppingListPanel";
import { ShoppingItemRow } from "~/components/display/shopping-item-row/ShoppingItemRow";
import {
  formatKronor,
  getShoppingKindLabel,
  ShoppingKindIcon,
} from "~/components/display/shopping-list-card/ShoppingKind";
import { formatShortDate } from "~/components/display/task-row/TaskDateFormat";
import { toLocalDate } from "~/core/tasks/LocalDate";

export interface ShoppingListPanelProps {
  list: ShoppingSelectedList;
  draft: ShoppingDraftProps;
  moveTargets: ShoppingMoveTarget[];
  actions: ShoppingListActions;
}

/** The selected list: header with Complete and a rename/delete menu, the add-item field, items to buy, and the cart. */
export function ShoppingListPanel({ list, draft, moveTargets, actions }: ShoppingListPanelProps): ReactElement {
  const intl = useIntl();
  const panel = useShoppingListPanel(list, moveTargets, actions);
  const isEmpty = list.groups.length === 0;

  function handleNameKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter" && !event.nativeEvent.isComposing) {
      event.preventDefault();
      panel.commitRename();
    } else if (event.key === "Escape") {
      panel.cancelRename();
    }
  }
  const progress = intl.formatMessage(
    {
      description: "ShoppingListPanel - how many of the list's items are bought",
      defaultMessage: "{bought} of {total} bought",
      id: "JNphqN",
    },
    { bought: list.bought, total: list.total }
  );

  const completeLabel = intl.formatMessage({
    description: "ShoppingListPanel - button completing the list",
    defaultMessage: "Complete list",
    id: "zOV/bo",
  });

  return (
    <div className={clsx(`ctx-${list.color}`, "@container flex w-full max-w-[760px] flex-col gap-5")}>
      <header className="flex items-start gap-4">
        <span className="grid size-13 shrink-0 place-items-center rounded-[14px] bg-(--ctx)/15 text-(--ctx)">
          <ShoppingKindIcon kind={list.kind} className="size-[26px]" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          {panel.nameDraft !== null ? (
            <TextField
              aria-label={intl.formatMessage({
                description: "ShoppingListPanel - aria-label of the field renaming the list",
                defaultMessage: "List name",
                id: "/VpcBS",
              })}
            >
              <Input
                autoFocus
                value={panel.nameDraft}
                onChange={(event: ChangeEvent<HTMLInputElement>) => panel.setNameDraft(event.target.value)}
                onKeyDown={handleNameKeyDown}
                onBlur={panel.commitRename}
                data-testid="shopping__rename-input"
                className="h-[42px] text-[24px] font-bold"
              />
            </TextField>
          ) : (
            <h2
              className="text-[28px] leading-tight font-bold tracking-[-0.01em] wrap-break-word"
              data-testid="shopping__list-name"
            >
              {list.name}
            </h2>
          )}
          <div className="text-muted flex flex-wrap items-center gap-2 text-[13px]">
            {list.context && (
              <Chip
                size="sm"
                variant="soft"
                className={`ctx-${list.context.color} gap-1.5`}
                data-testid="shopping__list-context"
              >
                <span className="size-1.5 rounded-full bg-(--ctx)" aria-hidden />
                {list.context.name}
              </Chip>
            )}
            {list.date && (
              <Chip size="sm" variant="soft">
                {formatShortDate(intl, list.date)}
              </Chip>
            )}
            <span data-testid="shopping__progress">
              {list.completedAt
                ? intl.formatMessage(
                    {
                      description: "ShoppingListPanel - when a completed list was completed, and how much was bought",
                      defaultMessage: "Completed {date} · {progress}",
                      id: "9uju8d",
                    },
                    { date: formatShortDate(intl, toLocalDate(new Date(list.completedAt))), progress }
                  )
                : progress}
            </span>
            {list.sum !== null && (
              <span>
                {intl.formatMessage(
                  {
                    description: "ShoppingListPanel - roughly what the whole list costs",
                    defaultMessage: "· ≈ {sum}",
                    id: "odZ1EH",
                  },
                  { sum: formatKronor(intl, list.sum) }
                )}
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!list.isCompleted ? (
            // In a narrow panel only the check shows, so the list name keeps the room.
            <Button
              onPress={panel.askComplete}
              aria-label={completeLabel}
              data-testid="shopping__complete-list"
              className="h-[38px] min-w-[38px] gap-1.5 rounded-[10px] bg-[#17c964] px-2.5 text-[13px] font-semibold text-[#0c0c0f] @lg:px-3.5"
            >
              <CheckIcon className="size-4" aria-hidden />
              <span className="hidden @lg:inline">{completeLabel}</span>
            </Button>
          ) : (
            <Button
              variant="secondary"
              onPress={actions.onReopen}
              data-testid="shopping__reopen-list"
              className="h-[38px]"
            >
              {intl.formatMessage({
                description: "ShoppingListPanel - button reopening a completed list",
                defaultMessage: "Reopen list",
                id: "1P2DOj",
              })}
            </Button>
          )}
          <Dropdown>
            <Button
              isIconOnly
              variant="ghost"
              className="text-muted size-[38px] rounded-[10px]"
              data-testid="shopping__list-menu"
              aria-label={intl.formatMessage({
                description: "ShoppingListPanel - aria-label of the menu with the list's actions",
                defaultMessage: "List actions",
                id: "jKhkEc",
              })}
            >
              <EllipsisHorizontalIcon className="size-5" />
            </Button>
            <Dropdown.Popover>
              <Dropdown.Menu
                onAction={(key) => {
                  if (key === "rename") {
                    panel.startRename();
                  } else if (key === "delete") {
                    panel.askDelete();
                  }
                }}
              >
                <Dropdown.Item id="rename" textValue="rename" data-testid="shopping__rename-list">
                  <Label>
                    {intl.formatMessage({
                      description: "ShoppingListPanel - menu item renaming the list",
                      defaultMessage: "Rename",
                      id: "IZLSe5",
                    })}
                  </Label>
                </Dropdown.Item>
                <Dropdown.Item id="delete" textValue="delete" variant="danger" data-testid="shopping__delete-list">
                  <Label>
                    {intl.formatMessage({
                      description: "ShoppingListPanel - menu item deleting the list",
                      defaultMessage: "Delete list",
                      id: "xVXVgh",
                    })}
                  </Label>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>
      </header>

      {panel.isDeleting && (
        <ShoppingDeleteDialog
          name={list.name}
          itemCount={list.total}
          onDelete={panel.confirmDelete}
          onCancel={panel.cancelDelete}
        />
      )}

      {panel.isCompleting && (
        <ShoppingCompleteDialog
          leftNames={panel.leftNames}
          moveTargets={moveTargets}
          moveTarget={panel.moveTarget}
          onMoveTargetChange={panel.setMoveTarget}
          onMove={panel.completeMoving}
          onCompleteAnyway={panel.completeAnyway}
          onCancel={panel.cancelComplete}
        />
      )}

      {!list.isCompleted && <ShoppingItemInput {...draft} />}

      {!list.isCompleted && isEmpty && (
        <div
          className="text-muted border-separator rounded-2xl border border-dashed p-9 text-center leading-relaxed"
          data-testid="shopping__empty"
        >
          {list.total === 0
            ? intl.formatMessage(
                {
                  description: "ShoppingListPanel - empty state when no item has been added to the list yet",
                  defaultMessage: "No items yet.{br}Add the first one above.",
                  id: "jZjOlo",
                },
                { br: <br key="br" /> }
              )
            : intl.formatMessage(
                {
                  description: "ShoppingListPanel - empty state when nothing is left to buy",
                  defaultMessage: "Nothing left to buy.{br}Add items above, or complete the list.",
                  id: "TJebpJ",
                },
                { br: <br key="br" /> }
              )}
        </div>
      )}

      {list.groups.map((group) => {
        const label = group.category
          ? getShoppingCategoryLabel(intl, group.category)
          : getShoppingKindLabel(intl, list.kind);
        return (
          <section key={group.category ?? "all"} aria-label={label} className="flex flex-col gap-1.5">
            {group.category && (
              <h3 className="text-muted ml-1.5 text-xs font-semibold tracking-[0.06em] uppercase">{label}</h3>
            )}
            <div className="slab overflow-hidden [--slab-radius:14px]">
              {group.items.map((item, index) => (
                <ShoppingItemRow
                  key={item.id}
                  item={item}
                  hasSeparator={index > 0}
                  onToggleBought={actions.onToggleBought}
                  onToggleImportant={actions.onToggleImportant}
                  onToggleMyDay={actions.onToggleItemMyDay}
                  onRemove={actions.onRemoveItem}
                />
              ))}
            </div>
          </section>
        );
      })}

      {list.boughtItems.length > 0 && (
        <section
          aria-label={intl.formatMessage({
            description: "ShoppingListPanel - aria-label of the bought items",
            defaultMessage: "In the cart",
            id: "faZajI",
          })}
          className="flex flex-col gap-1.5"
        >
          {!list.isCompleted && (
            <Button
              variant="ghost"
              aria-expanded={panel.isCartOpen}
              onPress={panel.toggleCart}
              data-testid="shopping__toggle-cart"
              className="text-muted h-8 self-start rounded-lg pr-2.5 pl-1.5 text-[13px] font-medium"
            >
              <ChevronRightIcon
                aria-hidden
                className={clsx("size-3.5 transition-transform", panel.isCartOpen && "rotate-90")}
              />
              {intl.formatMessage(
                {
                  description: "ShoppingListPanel - button showing the bought items, with their count",
                  defaultMessage: "In the cart · {count}",
                  id: "J5bBzI",
                },
                { count: list.boughtItems.length }
              )}
            </Button>
          )}
          {panel.isCartOpen && (
            <div
              className="settings-pane-in border-separator overflow-hidden rounded-[14px] border opacity-90"
              data-testid="shopping__cart"
            >
              {list.boughtItems.map((item, index) => (
                <ShoppingItemRow
                  key={item.id}
                  item={item}
                  hasSeparator={index > 0}
                  onToggleBought={actions.onToggleBought}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
