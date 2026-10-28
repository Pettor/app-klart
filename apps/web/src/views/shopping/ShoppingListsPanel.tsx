import type { ReactElement } from "react";
import { useState } from "react";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Button } from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import { ShoppingNewListForm } from "./ShoppingNewListForm";
import type { ShoppingNewListProps } from "./ShoppingTypes";
import type { ShoppingListCardList } from "~/components/display/shopping-list-card/ShoppingListCard";
import { ShoppingListCard } from "~/components/display/shopping-list-card/ShoppingListCard";

export interface ShoppingListsPanelProps {
  today: string;
  openLists: ShoppingListCardList[];
  doneLists: ShoppingListCardList[];
  selectedId: string | null;
  onSelect: (listId: string) => void;
  newList: ShoppingNewListProps;
  className?: string;
}

/** The lists column: the heading with a new-list button, the open lists, and the completed ones folded away. */
export function ShoppingListsPanel({
  today,
  openLists,
  doneLists,
  selectedId,
  onSelect,
  newList,
  className,
}: ShoppingListsPanelProps): ReactElement {
  const intl = useIntl();
  const [isCreating, setIsCreating] = useState(openLists.length === 0 && doneLists.length === 0);
  const [showDone, setShowDone] = useState(false);

  return (
    <aside
      aria-label={intl.formatMessage({
        description: "ShoppingListsPanel - aria-label of the lists column",
        defaultMessage: "Shopping lists",
        id: "s34e9B",
      })}
      className={clsx("flex-col gap-3.5 px-3.5 pt-4 pb-4 lg:pt-10", className)}
    >
      <div className="flex items-center gap-2 pl-1.5">
        <h1 className="hero:bg-[linear-gradient(90deg,#2d7ff9,#f0523f)] hero:bg-clip-text hero:text-transparent flex-1 text-[30px] font-bold tracking-[-0.01em]">
          {intl.formatMessage({
            description: "ShoppingListsPanel - heading of the shopping screen",
            defaultMessage: "Shopping",
            id: "lNIDVV",
          })}
        </h1>
        <Button
          isIconOnly
          variant="secondary"
          aria-expanded={isCreating}
          onPress={() => setIsCreating(!isCreating)}
          aria-label={intl.formatMessage({
            description: "ShoppingListsPanel - aria-label of the button opening the new list form",
            defaultMessage: "New list",
            id: "8qT16z",
          })}
          data-testid="shopping__open-new-list"
          className="size-9 rounded-[10px]"
        >
          <PlusIcon className="size-[18px]" />
        </Button>
      </div>

      {isCreating && <ShoppingNewListForm onCreate={newList.onCreate} onDone={() => setIsCreating(false)} />}

      <nav
        aria-label={intl.formatMessage({
          description: "ShoppingListsPanel - aria-label of the open lists",
          defaultMessage: "Open lists",
          id: "/NrgeO",
        })}
        className="flex flex-col gap-1"
      >
        {openLists.map((list) => (
          <ShoppingListCard
            key={list.id}
            list={list}
            today={today}
            isSelected={list.id === selectedId}
            onPress={onSelect}
          />
        ))}
      </nav>

      {doneLists.length > 0 && (
        <div className="mt-1 flex flex-col gap-1">
          <Button
            variant="ghost"
            aria-expanded={showDone}
            onPress={() => setShowDone(!showDone)}
            data-testid="shopping__toggle-completed-lists"
            className="text-muted h-8 justify-start gap-1.5 self-start rounded-lg px-2 text-[13px] font-medium"
          >
            <ChevronRightIcon aria-hidden className={clsx("size-3.5 transition-transform", showDone && "rotate-90")} />
            {intl.formatMessage(
              {
                description: "ShoppingListsPanel - button showing the completed lists, with their count",
                defaultMessage: "Completed lists · {count}",
                id: "Sj90Af",
              },
              { count: doneLists.length }
            )}
          </Button>
          {showDone &&
            doneLists.map((list) => (
              <ShoppingListCard
                key={list.id}
                list={list}
                today={today}
                isSelected={list.id === selectedId}
                onPress={onSelect}
              />
            ))}
        </div>
      )}
    </aside>
  );
}
