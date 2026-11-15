import type { CSSProperties, ReactElement } from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Button } from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import { ShoppingItemEditorPanel } from "./ShoppingItemEditorPanel";
import { ShoppingListPanel } from "./ShoppingListPanel";
import { ShoppingListsPanel } from "./ShoppingListsPanel";
import type {
  ShoppingDraftProps,
  ShoppingItemEditorState,
  ShoppingListActions,
  ShoppingListGroup,
  ShoppingMoveTarget,
  ShoppingNewListProps,
  ShoppingSelectedList,
  ShoppingSortProps,
} from "./ShoppingTypes";
import { useShoppingListsWidth } from "./UseShoppingListsWidth";
import type { ShoppingListCardList } from "~/components/display/shopping-list-card/ShoppingListCard";
import type { ShoppingItemSort, ShoppingListSort } from "~/core/shopping/ShoppingSort";

export interface ShoppingViewProps {
  today: string;
  /** The open lists, under headings when sorted by context or kind. */
  openGroups: ShoppingListGroup[];
  doneLists: ShoppingListCardList[];
  listSort: ShoppingSortProps<ShoppingListSort>;
  /** How the selected list orders its items. */
  itemSort: ShoppingSortProps<ShoppingItemSort>;
  /** The list shown on the right; `null` when there are no lists. */
  selected: ShoppingSelectedList | null;
  /** On phones the screen shows either the lists or one list; this picks the list. */
  isListShownOnPhone: boolean;
  onSelectList: (listId: string) => void;
  /** Phones: back from a list to the lists. */
  onBackToLists: () => void;
  newList: ShoppingNewListProps;
  draft: ShoppingDraftProps;
  moveTargets: ShoppingMoveTarget[];
  listActions: ShoppingListActions;
  itemEditor: ShoppingItemEditorState;
}

/** The Shopping page: the lists, the one picked, and the item being edited. My Day's sidebar stays beside it. */
export function ShoppingView({
  today,
  openGroups,
  doneLists,
  listSort,
  itemSort,
  selected,
  isListShownOnPhone,
  onSelectList,
  onBackToLists,
  newList,
  draft,
  moveTargets,
  listActions,
  itemEditor,
}: ShoppingViewProps): ReactElement {
  const intl = useIntl();
  const showList = isListShownOnPhone && !!selected;
  const listsWidth = useShoppingListsWidth();

  return (
    <main
      aria-label={intl.formatMessage({
        description: "ShoppingView - aria-label of the shopping page",
        defaultMessage: "Shopping",
        id: "tUX3ra",
      })}
      className="flex min-w-0 flex-1"
    >
      {/* Wide screens: a column pinned to the screen's height, which the handle on its right edge widens. */}
      <div
        className={clsx(
          "relative w-full lg:sticky lg:top-0 lg:block lg:h-dvh lg:w-(--shopping-lists-width) lg:shrink-0",
          showList && "hidden"
        )}
        style={{ "--shopping-lists-width": `${listsWidth.width}px` } as CSSProperties}
      >
        <ShoppingListsPanel
          today={today}
          openGroups={openGroups}
          doneLists={doneLists}
          selectedId={selected?.id ?? null}
          onSelect={onSelectList}
          newList={newList}
          listSort={listSort}
          className="lg:bg-surface/40 lg:border-separator flex w-full lg:h-full lg:overflow-y-auto lg:border-r"
        />
        <div className="hidden lg:contents">{listsWidth.handle}</div>
      </div>

      <section
        className={clsx(
          "min-w-0 flex-1 flex-col gap-5 px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)+24px)] sm:px-8 lg:flex lg:pt-10",
          showList ? "flex" : "hidden"
        )}
      >
        <Button
          variant="ghost"
          onPress={onBackToLists}
          data-testid="shopping__back"
          className="-ml-2 self-start lg:hidden"
        >
          <ArrowLeftIcon className="size-4" aria-hidden />
          {intl.formatMessage({
            description: "ShoppingView - phone button going back from a list to all lists",
            defaultMessage: "Lists",
            id: "+L0l6b",
          })}
        </Button>
        {selected ? (
          <ShoppingListPanel
            key={selected.id}
            list={selected}
            draft={draft}
            moveTargets={moveTargets}
            actions={listActions}
            editingItemId={itemEditor.item?.id ?? null}
            itemSort={itemSort}
          />
        ) : (
          <p className="text-muted max-w-[760px] p-8 text-center">
            {intl.formatMessage({
              description: "ShoppingView - shown when there are no lists yet",
              defaultMessage: "No lists yet. Press + to start one.",
              id: "ZEIua2",
            })}
          </p>
        )}
      </section>

      <ShoppingItemEditorPanel editor={itemEditor} actions={listActions} />
    </main>
  );
}
