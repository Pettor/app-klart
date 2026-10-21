import type { ReactElement } from "react";
import { LightBulbIcon } from "@heroicons/react/24/outline";
import { Button } from "@heroui/react";
import { useBreakpoint } from "@package/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import { MyDayAgentJson } from "./MyDayAgentJson";
import { MyDayHeader } from "./MyDayHeader";
import { MyDayMobileBar, MyDayTagChips } from "./MyDayMobileBar";
import { MyDaySidebar } from "./MyDaySidebar";
import { MyDaySuggestionsPanel } from "./MyDaySuggestionsPanel";
import { MyDayTaskEditorPanel } from "./MyDayTaskEditorPanel";
import { MyDayTaskList } from "./MyDayTaskList";
import type {
  MyDayQuickAddProps,
  MyDaySidebarProps,
  MyDaySuggestionsProps,
  MyDayTask,
  MyDayTaskActions,
  MyDayTaskEditorProps,
} from "./MyDayTypes";
import { QuickAddInput } from "~/components/input/quick-add/QuickAddInput";

export interface MyDayViewProps extends MyDaySidebarProps {
  today: string;
  tasks: MyDayTask[];
  doneTasks: MyDayTask[];
  showContextOnTasks: boolean;
  taskActions: MyDayTaskActions;
  quickAdd: MyDayQuickAddProps;
  suggestions: MyDaySuggestionsProps;
  editor: MyDayTaskEditorProps;
  agentJson: { isOpen: boolean; onToggle: () => void; json: string };
  onOpenSettings: () => void;
  onOpenNotifications: () => void;
}

export function MyDayView({
  today,
  context,
  search,
  smartViews,
  tags,
  sync,
  tasks,
  doneTasks,
  showContextOnTasks,
  taskActions,
  quickAdd,
  suggestions,
  editor,
  agentJson,
  onOpenSettings,
  onOpenNotifications,
}: MyDayViewProps): ReactElement {
  const intl = useIntl();
  const isPhone = !useBreakpoint("sm");
  const isWide = useBreakpoint("xl");

  return (
    <div className="bg-background text-foreground flex min-h-dvh text-sm">
      <MyDaySidebar
        context={context}
        search={search}
        smartViews={smartViews}
        tags={tags}
        sync={sync}
        className="sticky top-0 hidden h-dvh lg:flex"
      />

      <main
        className={clsx(
          `ctx-${context.selectedColor}`,
          "flex min-w-0 flex-1 flex-col gap-5 bg-(--ctx-backdrop) px-4 pt-4 pb-4 sm:px-8 lg:pt-10"
        )}
      >
        <MyDayMobileBar
          context={context}
          onOpenNotifications={onOpenNotifications}
          onOpenSettings={onOpenSettings}
          className="lg:hidden"
        />

        <MyDayHeader
          today={today}
          smartView={smartViews.active}
          contextName={context.selectedName}
          tag={tags.active}
          onClearTag={() => tags.onSelect(null)}
          suggestionCount={suggestions.count}
          isSuggestionsOpen={suggestions.isOpen}
          onToggleSuggestions={suggestions.onToggle}
          isJsonOpen={agentJson.isOpen}
          onToggleJson={agentJson.onToggle}
          onOpenNotifications={onOpenNotifications}
        />

        <MyDayTagChips tags={tags.items} active={tags.active} onSelect={tags.onSelect} className="lg:hidden" />

        {agentJson.isOpen && <MyDayAgentJson json={agentJson.json} />}

        <MyDayTaskList
          today={today}
          smartView={smartViews.active}
          tasks={tasks}
          doneTasks={doneTasks}
          showContext={showContextOnTasks}
          actions={taskActions}
          selectedTaskId={editor.task?.id}
        />

        <div className="sticky bottom-0 mt-auto flex flex-col gap-2 bg-(--ctx-backdrop) pt-2 pb-[env(safe-area-inset-bottom)]">
          <Button
            variant="secondary"
            onPress={suggestions.onToggle}
            className="h-11 self-start rounded-full sm:hidden"
            data-testid="my-day__open-suggestions"
          >
            <LightBulbIcon className="size-[18px]" aria-hidden />
            {intl.formatMessage(
              {
                description: "MyDayView - mobile button opening the suggestions sheet",
                defaultMessage: "Suggestions · {count}",
                id: "70RKSI",
              },
              { count: suggestions.count }
            )}
          </Button>
          <QuickAddInput
            value={quickAdd.value}
            onChange={quickAdd.onChange}
            onSubmit={quickAdd.onSubmit}
            preview={quickAdd.preview}
            today={today}
            compact={isPhone}
          />
        </div>
      </main>

      {/* On wide screens the editor takes the suggestions panel's place. */}
      <MyDayTaskEditorPanel editor={editor} />
      {!(isWide && editor.task) && (
        <MyDaySuggestionsPanel
          today={today}
          contextColor={context.selectedColor}
          suggestions={suggestions}
          onOpenTask={taskActions.onOpen}
        />
      )}
    </div>
  );
}
