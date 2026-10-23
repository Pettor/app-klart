import type { ReactElement } from "react";
import { CheckIcon, PlusIcon } from "@heroicons/react/20/solid";
import { Button } from "@heroui/react";
import clsx from "clsx";
import type { IntlShape } from "react-intl";
import { useIntl } from "react-intl";
import { useSuggestionLeave } from "./UseSuggestionLeave";
import {
  DUE_TONE_CLASS,
  formatRelativeDate,
  formatShortDate,
  getDueTone,
} from "~/components/display/task-row/TaskDateFormat";
import type { ContextColor } from "~/core/contexts/KlartContext";
import type { SuggestionReason } from "~/core/tasks/Day";

export interface SuggestionItem {
  id: string;
  title: string;
  contextColor: ContextColor;
  due: string | null;
  tags: string[];
}

export interface SuggestionListGroup {
  reason: SuggestionReason;
  items: SuggestionItem[];
  /** Total in the group when `items` is truncated. */
  total: number;
}

export interface SuggestionListProps {
  groups: SuggestionListGroup[];
  today: string;
  /** Overdue plus due today; disables "Add all due" when 0. */
  dueCount: number;
  onAdd: (taskId: string, reason: SuggestionReason) => void;
  onAddAllDue: () => void;
  /** Hides the heading row, e.g. inside a drawer that has its own. */
  hideHeading?: boolean;
  /** Makes each title pressable, e.g. to open the task editor. */
  onOpen?: (taskId: string) => void;
}

function getGroupLabel(intl: IntlShape, reason: SuggestionReason): string {
  switch (reason) {
    case "overdue":
      return intl.formatMessage({
        description: "SuggestionList - group heading",
        defaultMessage: "Overdue",
        id: "SjtAoB",
      });
    case "due_today":
      return intl.formatMessage({
        description: "SuggestionList - group heading",
        defaultMessage: "Due today",
        id: "ApeFzI",
      });
    case "left_from_yesterday":
      return intl.formatMessage({
        description: "SuggestionList - group heading",
        defaultMessage: "Left from yesterday",
        id: "p4yXPv",
      });
    case "coming_up":
      return intl.formatMessage({
        description: "SuggestionList - group heading",
        defaultMessage: "Coming up",
        id: "7oKDtz",
      });
    case "related_to_today":
      return intl.formatMessage({
        description: "SuggestionList - group heading",
        defaultMessage: "Related to today",
        id: "S+W1eu",
      });
    case "recently_added":
      return intl.formatMessage({
        description: "SuggestionList - group heading",
        defaultMessage: "Recently added",
        id: "xeqjGR",
      });
  }
}

function getReasonText(intl: IntlShape, reason: SuggestionReason, item: SuggestionItem, today: string): string {
  switch (reason) {
    case "overdue":
      return intl.formatMessage(
        {
          description: "SuggestionList - why an overdue task is suggested",
          defaultMessage: "Overdue since {date}",
          id: "bdQ6GE",
        },
        { date: formatShortDate(intl, item.due!) }
      );
    case "due_today":
      return intl.formatMessage({
        description: "SuggestionList - why a task is suggested",
        defaultMessage: "Due today",
        id: "8GxipC",
      });
    case "left_from_yesterday":
      return intl.formatMessage({
        description: "SuggestionList - why a task left from yesterday is suggested",
        defaultMessage: "In My Day yesterday",
        id: "rQBpx7",
      });
    case "related_to_today":
      return intl.formatMessage({
        description: "SuggestionList - why a related task is suggested",
        defaultMessage: "Shares a tag",
        id: "tPBGie",
      });
    case "coming_up":
    case "recently_added":
      return item.due
        ? intl.formatMessage(
            {
              description: "SuggestionList - due date of a suggested task",
              defaultMessage: "Due {date}",
              id: "ynnWTA",
            },
            { date: formatRelativeDate(intl, item.due, today) }
          )
        : intl.formatMessage({
            description: "SuggestionList - shown for a suggested task without a due date",
            defaultMessage: "No due date",
            id: "XVU0wv",
          });
  }
}

export function SuggestionList({
  groups,
  today,
  dueCount,
  onAdd,
  onAddAllDue,
  hideHeading = false,
  onOpen,
}: SuggestionListProps): ReactElement {
  const intl = useIntl();
  const leave = useSuggestionLeave(groups, onAdd, onAddAllDue);

  return (
    <div className="flex flex-col gap-[18px]" data-testid="suggestion-list">
      <div className="flex items-center gap-2">
        {!hideHeading && (
          <h2 className="flex-1 text-base font-bold">
            {intl.formatMessage({
              description: "SuggestionList - panel heading",
              defaultMessage: "Suggestions",
              id: "MQaGev",
            })}
          </h2>
        )}
        <Button
          size="sm"
          className={clsx(
            "text-background h-8 rounded-lg bg-(--ctx) px-3 text-[13px] font-semibold",
            hideHeading && "ml-auto"
          )}
          isDisabled={dueCount === 0}
          onPress={leave.addAllDue}
          data-testid="suggestion-list__add-all-due"
        >
          {intl.formatMessage({
            description: "SuggestionList - button adding every overdue and due-today task to My Day",
            defaultMessage: "Add all due",
            id: "IorSng",
          })}
        </Button>
      </div>

      {groups.length === 0 && (
        <p className="text-muted text-sm">
          {intl.formatMessage({
            description: "SuggestionList - empty state",
            defaultMessage: "All caught up. Nothing due, overdue or left from yesterday.",
            id: "xxzRU/",
          })}
        </p>
      )}

      {groups.map((group) => (
        <section
          key={group.reason}
          className="flex flex-col gap-2.5 [--slab-gap:--spacing(2.5)]"
          aria-label={getGroupLabel(intl, group.reason)}
        >
          <h3 className="text-foreground/85 flex items-center gap-2 text-[13px] font-semibold">
            {getGroupLabel(intl, group.reason)}
            <span className="text-muted font-medium">{group.total}</span>
          </h3>
          {group.items.map((item) => {
            const isLeaving = leave.leavingIds.has(item.id);
            return (
              // Slides out toward My Day and collapses once added.
              <div key={item.id} className={clsx("slab-leave slab-leave-side", isLeaving && "slab-leaving")}>
                <div className="slab-leave-in">
                  <div
                    className={clsx(
                      `ctx-${item.contextColor}`,
                      "slab flex min-h-14 items-center gap-2.5 py-1.5 pr-1.5 pl-3"
                    )}
                  >
                    <span className="w-1 self-stretch rounded-sm bg-(--ctx)" aria-hidden />
                    <div className="relative flex min-w-0 flex-1 flex-col gap-0.5">
                      {onOpen && (
                        // An invisible button over the whole column, so the reason line opens the task too.
                        // It must be the pressed element itself: React Aria drops a press released outside the button's box.
                        <Button
                          variant="ghost"
                          aria-label={intl.formatMessage(
                            {
                              description:
                                "SuggestionList - aria-label of a suggestion's title, which opens the task editor",
                              defaultMessage: "Edit task: {title}",
                              id: "JF1JER",
                            },
                            { title: item.title }
                          )}
                          onPress={() => onOpen(item.id)}
                          className="absolute inset-0 h-auto min-h-0 w-auto transform-none rounded-md p-0 data-[hovered=true]:bg-transparent data-[pressed=true]:bg-transparent"
                          data-testid="suggestion-list__open"
                        />
                      )}
                      <span className="text-sm">{item.title}</span>
                      <span className="text-muted flex flex-wrap gap-1.5 text-xs">
                        <span className={item.due ? DUE_TONE_CLASS[getDueTone(item.due, today)] : undefined}>
                          {getReasonText(intl, group.reason, item, today)}
                        </span>
                        {item.tags.map((tag) => (
                          <span key={tag} className="text-(--tag)">
                            #{tag}
                          </span>
                        ))}
                      </span>
                    </div>
                    <Button
                      isIconOnly
                      variant="ghost"
                      aria-label={intl.formatMessage(
                        {
                          description: "SuggestionList - aria-label of the button adding a suggestion to My Day",
                          defaultMessage: "Add {title} to My Day",
                          id: "qSIYMN",
                        },
                        { title: item.title }
                      )}
                      onPress={() => leave.add(item.id, group.reason)}
                      className={clsx(isLeaving && "text-(--ctx)")}
                    >
                      {isLeaving ? (
                        <CheckIcon className="slab-pop size-[18px]" />
                      ) : (
                        <PlusIcon className="size-[18px]" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      ))}

      <p className="text-muted mt-auto text-xs leading-relaxed">
        {intl.formatMessage(
          {
            description: "SuggestionList - footnote explaining the ranking and the agent file",
            defaultMessage:
              "Ranked: overdue, due today, left from yesterday, coming up, then by shared tags with today. The same list is in {file} for agents.",
            id: "S6u+DD",
          },
          { file: <code className="text-foreground/85 font-mono">views/suggestions.json</code> }
        )}
      </p>
    </div>
  );
}
