import type { ReactElement } from "react";
import { Drawer } from "@heroui/react";
import { useBreakpoint } from "@package/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import type { MyDaySuggestionsProps } from "./MyDayTypes";
import type { MyDayPane } from "./UseMyDayPaneWidth";
import { SuggestionList } from "~/components/display/suggestion-list/SuggestionList";

export interface MyDaySuggestionsPanelProps {
  today: string;
  contextColor: string;
  suggestions: MyDaySuggestionsProps;
  onOpenTask?: (taskId: string) => void;
  pane: MyDayPane;
}

/** A side panel on wide screens; a bottom sheet on phones and tablets. */
export function MyDaySuggestionsPanel({
  today,
  contextColor,
  suggestions,
  onOpenTask,
  pane,
}: MyDaySuggestionsPanelProps): ReactElement | null {
  const intl = useIntl();
  const isWide = useBreakpoint("xl");

  function list(hideHeading: boolean): ReactElement {
    return (
      <SuggestionList
        groups={suggestions.groups}
        today={today}
        dueCount={suggestions.dueCount}
        onAdd={suggestions.onAdd}
        onAddAllDue={suggestions.onAddAllDue}
        hideHeading={hideHeading}
        onOpen={onOpenTask}
      />
    );
  }

  if (isWide) {
    if (!suggestions.isOpen) {
      return null;
    }
    return (
      <aside
        aria-label={intl.formatMessage({
          description: "MyDaySuggestionsPanel - aria-label of the side panel",
          defaultMessage: "Suggestions",
          id: "uG7SvG",
        })}
        className={clsx(
          `ctx-${contextColor}`,
          "bg-surface hero:bg-[#111114] border-separator relative flex max-w-[60vw] shrink-0 flex-col border-l px-4 pt-10 pb-4"
        )}
        style={{ width: pane.width }}
      >
        {pane.handle}
        {list(false)}
      </aside>
    );
  }

  return (
    <Drawer isOpen={suggestions.isOpen} onOpenChange={(open) => open !== suggestions.isOpen && suggestions.onToggle()}>
      <Drawer.Backdrop>
        <Drawer.Content placement="bottom" className={`ctx-${contextColor}`}>
          <Drawer.Dialog className="max-h-[85dvh]">
            <Drawer.Handle />
            <Drawer.Header>
              <Drawer.Heading>
                {intl.formatMessage({
                  description: "MyDaySuggestionsPanel - heading of the bottom sheet",
                  defaultMessage: "Suggestions",
                  id: "G6LTsu",
                })}
              </Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body className="overflow-y-auto pb-6">{list(true)}</Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
