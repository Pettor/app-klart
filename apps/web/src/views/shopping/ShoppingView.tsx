import type { ReactElement } from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Button } from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import { ShoppingListPanel } from "./ShoppingListPanel";
import { ShoppingListsPanel } from "./ShoppingListsPanel";
import type {
  ShoppingDraftProps,
  ShoppingListActions,
  ShoppingMoveTarget,
  ShoppingNewListProps,
  ShoppingSelectedList,
} from "./ShoppingTypes";
import type { ShoppingListCardList } from "~/components/display/shopping-list-card/ShoppingListCard";

export interface ShoppingViewProps {
  today: string;
  openLists: ShoppingListCardList[];
  doneLists: ShoppingListCardList[];
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
}

/** The Shopping page: the lists, then the one picked. My Day's sidebar stays beside it. */
export function ShoppingView({
  today,
  openLists,
  doneLists,
  selected,
  isListShownOnPhone,
  onSelectList,
  onBackToLists,
  newList,
  draft,
  moveTargets,
  listActions,
}: ShoppingViewProps): ReactElement {
  const intl = useIntl();
  const showList = isListShownOnPhone && !!selected;

  return (
    <main
      aria-label={intl.formatMessage({
        description: "ShoppingView - aria-label of the shopping page",
        defaultMessage: "Shopping",
        id: "tUX3ra",
      })}
      className="flex min-w-0 flex-1"
    >
      <ShoppingListsPanel
        today={today}
        openLists={openLists}
        doneLists={doneLists}
        selectedId={selected?.id ?? null}
        onSelect={onSelectList}
        newList={newList}
        className={clsx(
          "lg:bg-surface/40 lg:border-separator w-full lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-[300px] lg:shrink-0 lg:overflow-y-auto lg:border-r",
          showList ? "hidden" : "flex"
        )}
      />

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
    </main>
  );
}
