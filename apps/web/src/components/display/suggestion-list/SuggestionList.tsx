import type { ReactElement } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Button, ToggleButton } from "@heroui/react";
import clsx from "clsx";
import type { IntlShape } from "react-intl";
import { useIntl } from "react-intl";
import { SuggestionRow } from "./SuggestionRow";
import { SuggestionTopPick } from "./SuggestionTopPick";
import type { SuggestionFilter } from "./UseSuggestionFilter";
import { useSuggestionFilter } from "./UseSuggestionFilter";
import { useSuggestionLeave } from "./UseSuggestionLeave";
import { SearchField } from "~/components/input/input-field/SearchField";
import type { ContextColor } from "~/core/contexts/KlartContext";
import type { SuggestionReason } from "~/core/tasks/Day";
import type { SuggestionKind, SuggestionWhy } from "~/core/tasks/Suggestions";

export interface SuggestionItem {
  id: string;
  title: string;
  contextColor: ContextColor;
  contextName: string;
  important: boolean;
  tags: string[];
  reason: SuggestionReason;
  why: SuggestionWhy;
  kinds: SuggestionKind[];
}

export interface SuggestionListProps {
  /** Every suggestion, best first. */
  items: SuggestionItem[];
  /** How many need attention today. */
  urgentCount: number;
  /** Overdue plus due today; hides "Add all due" when 0. */
  dueCount: number;
  /** Suggestions hidden until tomorrow; offers an undo when above 0. */
  snoozedCount: number;
  onAdd: (taskId: string, reason: SuggestionReason) => void;
  onAddAllDue: () => void;
  onSnooze: (taskId: string) => void;
  onUndoSnooze: () => void;
  /** Hides the heading, e.g. inside a drawer that has its own. */
  hideHeading?: boolean;
  /** Makes each title pressable, e.g. to open the task editor. */
  onOpen?: (taskId: string) => void;
}

const LINK_BUTTON =
  "h-auto min-h-0 min-w-0 transform-none rounded-sm p-0 text-xs font-normal text-(--tag) " +
  "data-[hovered=true]:bg-transparent data-[pressed=true]:bg-transparent";

const MORE_BUTTON = "h-8 self-start rounded-lg px-2.5 text-[13px] font-medium text-(--tag)";

function getFilterLabel(intl: IntlShape, filter: SuggestionFilter): string {
  switch (filter) {
    case "pick":
      return intl.formatMessage({
        description: "SuggestionList - filter chip showing the ranked list",
        defaultMessage: "For you",
        id: "j9wp5H",
      });
    case "overdue":
      return intl.formatMessage({
        description: "SuggestionList - filter chip",
        defaultMessage: "Overdue",
        id: "YbkNMd",
      });
    case "soon":
      return intl.formatMessage({
        description: "SuggestionList - filter chip",
        defaultMessage: "Soon",
        id: "srKjhT",
      });
    case "related":
      return intl.formatMessage({
        description: "SuggestionList - filter chip for tasks sharing a tag with today's",
        defaultMessage: "Goes with today",
        id: "M3cGA9",
      });
    case "important":
      return intl.formatMessage({
        description: "SuggestionList - filter chip",
        defaultMessage: "Important",
        id: "OITCau",
      });
  }
}

export function SuggestionList({
  items,
  urgentCount,
  dueCount,
  snoozedCount,
  onAdd,
  onAddAllDue,
  onSnooze,
  onUndoSnooze,
  hideHeading = false,
  onOpen,
}: SuggestionListProps): ReactElement {
  const intl = useIntl();
  const leave = useSuggestionLeave(items, onAdd, onAddAllDue);
  const view = useSuggestionFilter(items);
  const { topPick } = view;
  const hasFreshOverdue = items.some((item) => item.why.type === "overdue");
  const findLabel = intl.formatMessage({
    description: "SuggestionList - aria-label of the search for a task to add",
    defaultMessage: "Find a task to add",
    id: "52f/sk",
  });
  const restLabel = topPick
    ? intl.formatMessage({
        description: "SuggestionList - heading of the suggestions after the top pick",
        defaultMessage: "Next up",
        id: "ISz1oJ",
      })
    : view.isSearching
      ? intl.formatMessage({
          description: "SuggestionList - heading of the search results",
          defaultMessage: "Matches",
          id: "/HpvAZ",
        })
      : undefined;

  function getEmptyText(): string {
    if (view.isSearching) {
      return intl.formatMessage(
        {
          description: "SuggestionList - shown when no task matches the search",
          defaultMessage: 'No open task matches "{query}".',
          id: "gg4leg",
        },
        { query: view.query.trim() }
      );
    }
    return view.activeFilter === "pick"
      ? intl.formatMessage({
          description: "SuggestionList - empty state",
          defaultMessage: "All caught up. Nothing worth pulling in right now.",
          id: "CRl70u",
        })
      : intl.formatMessage({
          description: "SuggestionList - shown when a filter chip matches nothing",
          defaultMessage: "Nothing here right now.",
          id: "QXXzRI",
        });
  }

  return (
    <div className="flex min-h-full flex-col gap-4 [--slab-gap:--spacing(4)]" data-testid="suggestion-list">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          {!hideHeading && (
            <h2 className="text-lg font-bold">
              {intl.formatMessage({
                description: "SuggestionList - panel heading",
                defaultMessage: "Suggestions",
                id: "MQaGev",
              })}
            </h2>
          )}
          <p className={clsx("text-muted text-[13px]", !hideHeading && "mt-1")}>
            {urgentCount > 0
              ? intl.formatMessage(
                  {
                    description: "SuggestionList - subheading counting the suggestions that need attention",
                    defaultMessage: "{count, plural, one {# needs attention today} other {# need attention today}}",
                    id: "mdet66",
                  },
                  { count: urgentCount }
                )
              : intl.formatMessage({
                  description: "SuggestionList - subheading when no suggestion is urgent",
                  defaultMessage: "Nothing urgent. Here is what fits today.",
                  id: "tSYhsj",
                })}
          </p>
        </div>
        <ToggleButton
          isIconOnly
          variant="ghost"
          isSelected={view.isSearchOpen}
          onChange={view.toggleSearch}
          aria-label={findLabel}
          className="size-9 shrink-0 rounded-[10px]"
          data-testid="suggestion-list__toggle-search"
        >
          <MagnifyingGlassIcon className="size-[18px]" />
        </ToggleButton>
      </div>

      {view.isSearchOpen && (
        <SearchField
          value={view.query}
          onChange={view.setQuery}
          ariaLabel={findLabel}
          placeholder={intl.formatMessage({
            description: "SuggestionList - placeholder of the search for a task to add",
            defaultMessage: "Find any open task or #tag",
            id: "xm6a87",
          })}
          focusRequest={1}
        />
      )}

      <div
        role="group"
        aria-label={intl.formatMessage({
          description: "SuggestionList - aria-label of the filter chips",
          defaultMessage: "Filter suggestions",
          id: "FXXfSZ",
        })}
        className="flex flex-wrap gap-1.5"
      >
        {view.filters.map((filter) => {
          const isActive = view.activeFilter === filter;
          return (
            <ToggleButton
              key={filter}
              size="sm"
              isSelected={isActive}
              onChange={() => view.pickFilter(filter)}
              className={clsx(
                "border-separator h-[30px] min-w-0 gap-1.5 rounded-full border px-3 text-[13px] font-medium",
                isActive
                  ? "bg-foreground text-background data-[hovered=true]:bg-foreground data-[selected=true]:bg-foreground"
                  : "text-foreground/85 bg-transparent"
              )}
              data-testid={`suggestion-list__filter-${filter}`}
            >
              {filter === "overdue" && hasFreshOverdue && (
                <span className="bg-danger size-1.5 rounded-full" aria-hidden />
              )}
              {getFilterLabel(intl, filter)}
            </ToggleButton>
          );
        })}
      </div>

      {view.isEmpty && <p className="text-muted mt-2 text-sm">{getEmptyText()}</p>}

      {topPick && (
        <div
          key={topPick.id}
          className={clsx("slab-leave slab-leave-side", leave.leavingIds.has(topPick.id) && "slab-leaving")}
        >
          <div className="slab-leave-in">
            <SuggestionTopPick
              item={topPick}
              isLeaving={leave.leavingIds.has(topPick.id)}
              onAdd={() => leave.add(topPick.id, topPick.reason)}
              onSnooze={() => onSnooze(topPick.id)}
              onOpen={onOpen && (() => onOpen(topPick.id))}
            />
          </div>
        </div>
      )}

      {view.rest.length > 0 && (
        <section aria-label={restLabel} className="flex flex-col gap-2">
          {restLabel && <h3 className="text-muted mt-1 text-xs font-semibold tracking-wider uppercase">{restLabel}</h3>}
          <ul className="flex flex-col gap-0.5 [--slab-gap:--spacing(0.5)]">
            {view.rest.map((item) => {
              const isLeaving = leave.leavingIds.has(item.id);
              return (
                // Slides out toward My Day and collapses once added.
                <li key={item.id} className={clsx("slab-leave slab-leave-side", isLeaving && "slab-leaving")}>
                  <div className="slab-leave-in">
                    <SuggestionRow
                      item={item}
                      isLeaving={isLeaving}
                      onAdd={() => leave.add(item.id, item.reason)}
                      onSnooze={() => onSnooze(item.id)}
                      onOpen={onOpen && (() => onOpen(item.id))}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          {view.canShowMore && (
            <Button
              variant="ghost"
              onPress={() => view.setIsExpanded(true)}
              className={MORE_BUTTON}
              data-testid="suggestion-list__more"
            >
              {intl.formatMessage({
                description: "SuggestionList - button showing more suggestions",
                defaultMessage: "Show a few more",
                id: "QLCo5B",
              })}
            </Button>
          )}
          {view.canShowFewer && (
            <Button
              variant="ghost"
              onPress={() => view.setIsExpanded(false)}
              className={MORE_BUTTON}
              data-testid="suggestion-list__fewer"
            >
              {intl.formatMessage({
                description: "SuggestionList - button showing fewer suggestions",
                defaultMessage: "Show fewer",
                id: "I7X3ab",
              })}
            </Button>
          )}
        </section>
      )}

      <div className="border-separator text-muted mt-auto flex flex-col gap-2.5 border-t pt-3 text-xs">
        {(snoozedCount > 0 || dueCount > 0) && (
          <div className="flex flex-wrap items-center gap-2">
            {snoozedCount > 0 && (
              <>
                <span>
                  {intl.formatMessage(
                    {
                      description: "SuggestionList - how many suggestions are hidden with Not today",
                      defaultMessage: "{count} hidden until tomorrow",
                      id: "FwXrjw",
                    },
                    { count: snoozedCount }
                  )}
                </span>
                <Button
                  variant="ghost"
                  onPress={onUndoSnooze}
                  className={LINK_BUTTON}
                  data-testid="suggestion-list__undo-snooze"
                >
                  {intl.formatMessage({
                    description: "SuggestionList - button bringing back the suggestions hidden until tomorrow",
                    defaultMessage: "Undo",
                    id: "rmdZqQ",
                  })}
                </Button>
              </>
            )}
            {snoozedCount > 0 && dueCount > 0 && <span aria-hidden>·</span>}
            {dueCount > 0 && (
              <Button
                variant="ghost"
                onPress={leave.addAllDue}
                className={LINK_BUTTON}
                data-testid="suggestion-list__add-all-due"
              >
                {intl.formatMessage(
                  {
                    description: "SuggestionList - button adding every overdue and due-today task to My Day",
                    defaultMessage: "Add all due ({count})",
                    id: "E01wlq",
                  },
                  { count: dueCount }
                )}
              </Button>
            )}
          </div>
        )}
        <p className="leading-normal">
          {intl.formatMessage(
            {
              description: "SuggestionList - footnote explaining the ranking and the agent file",
              defaultMessage:
                "Ranked by how overdue, how soon, importance and tags shared with today. Agents get every candidate in {file}.",
              id: "YefScL",
            },
            { file: <code className="text-foreground/85 font-mono">views/suggestions.json</code> }
          )}
        </p>
      </div>
    </div>
  );
}
