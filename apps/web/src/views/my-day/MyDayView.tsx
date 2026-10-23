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
import { MyDaySidebarRail } from "./MyDaySidebarRail";
import { MyDaySuggestionsPanel } from "./MyDaySuggestionsPanel";
import { MyDayTaskEditorPanel } from "./MyDayTaskEditorPanel";
import { MyDayTaskList } from "./MyDayTaskList";
import type {
  MyDayDisplayProps,
  MyDayQuickAddProps,
  MyDaySidebarCollapseProps,
  MyDaySidebarProps,
  MyDaySuggestionsProps,
  MyDayTask,
  MyDayTaskActions,
  MyDayTaskEditorProps,
} from "./MyDayTypes";
import { useMyDayArrivals } from "./UseMyDayArrivals";
import { useMyDayPaneWidth } from "./UseMyDayPaneWidth";
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
  /** Today as `views/today.json`, shown when the Display menu's Agent JSON option is on. */
  agentJson: string;
  /** What My Day shows besides task titles. */
  display: MyDayDisplayProps;
  sidebar: MyDaySidebarCollapseProps;
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
  suggestions: suggestionsProp,
  editor,
  agentJson,
  display,
  sidebar,
  onOpenSettings,
  onOpenNotifications,
}: MyDayViewProps): ReactElement {
  const intl = useIntl();
  const isPhone = !useBreakpoint("sm");
  const isWide = useBreakpoint("xl");
  const pane = useMyDayPaneWidth();
  const { arrivingIds, suggestions } = useMyDayArrivals(
    tasks.map((task) => task.id),
    suggestionsProp
  );
  const { options } = display;
  // A tag picked elsewhere (search, a task) keeps the list visible so it can be cleared.
  const showTagFilter = options.tagFilter || !!tags.active;

  return (
    <div className="bg-background text-foreground flex min-h-dvh text-sm">
      {/* Stays mounted while collapsed, so its search field keeps its state. */}
      <MyDaySidebar
        context={context}
        search={search}
        smartViews={smartViews}
        tags={tags}
        sync={sync}
        collapse={sidebar}
        showTags={showTagFilter}
        className={clsx("sticky top-0 hidden h-dvh", !sidebar.isCollapsed && "lg:flex")}
      />
      {sidebar.isCollapsed && (
        <MyDaySidebarRail
          context={context}
          search={search}
          smartViews={smartViews}
          tags={tags}
          sync={sync}
          collapse={sidebar}
          showTags={showTagFilter}
          className="sticky top-0 hidden h-dvh lg:flex"
        />
      )}

      <main
        className={clsx(
          `ctx-${context.selectedColor}`,
          "hero-glow flex min-w-0 flex-1 flex-col gap-5 bg-(--ctx-backdrop) bg-no-repeat px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)+12px)] sm:px-8 sm:pb-0 lg:pt-10"
        )}
      >
        <MyDayMobileBar
          context={context}
          smartViews={smartViews}
          sync={sync}
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
          onOpenNotifications={onOpenNotifications}
          display={display}
          contextColor={context.selectedColor}
        />

        {options.tagFilter && (
          <MyDayTagChips tags={tags.items} active={tags.active} onSelect={tags.onSelect} className="lg:hidden" />
        )}

        {options.agentJson && <MyDayAgentJson json={agentJson} className="max-lg:hidden" />}

        <MyDayTaskList
          today={today}
          smartView={smartViews.active}
          tasks={tasks}
          doneTasks={doneTasks}
          showContext={showContextOnTasks}
          actions={taskActions}
          selectedTaskId={editor.task?.id}
          showTags={options.taskTags}
          showMeta={options.details}
          showLinks={options.links}
          isCompletedExpanded={options.completed}
          onToggleCompleted={() => display.onChange({ ...options, completed: !options.completed })}
          arrivingIds={arrivingIds}
        />

        {/* On phones it floats above the list, clear of the screen's bottom edge. */}
        <div
          className={clsx(
            "sticky mt-auto flex flex-col gap-2",
            "max-sm:bg-surface/85 max-sm:bottom-[calc(env(safe-area-inset-bottom)+12px)] max-sm:rounded-3xl max-sm:p-2 max-sm:shadow-lg max-sm:backdrop-blur-md",
            "sm:bottom-0 sm:bg-(--ctx-backdrop) sm:pt-2 sm:pb-[calc(env(safe-area-inset-bottom)+16px)]"
          )}
        >
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
      <MyDayTaskEditorPanel editor={editor} pane={pane} />
      {!(isWide && editor.task) && (
        <MyDaySuggestionsPanel
          today={today}
          contextColor={context.selectedColor}
          suggestions={suggestions}
          onOpenTask={taskActions.onOpen}
          pane={pane}
        />
      )}
    </div>
  );
}
