import type { ReactElement } from "react";
import { Drawer } from "@heroui/react";
import { useBreakpoint } from "@package/react";
import { useIntl } from "react-intl";
import type { MyDayTaskEditorProps } from "./MyDayTypes";
import type { TaskEditorTask } from "~/components/input/task-editor/TaskEditor";
import { TaskEditor } from "~/components/input/task-editor/TaskEditor";

export interface MyDayTaskEditorPanelProps {
  editor: MyDayTaskEditorProps;
}

/** Takes the suggestions panel's place on wide screens; a bottom sheet on phones and tablets. */
export function MyDayTaskEditorPanel({ editor }: MyDayTaskEditorPanelProps): ReactElement | null {
  const intl = useIntl();
  const isWide = useBreakpoint("xl");
  const heading = intl.formatMessage({
    description: "MyDayTaskEditorPanel - heading of the task editor",
    defaultMessage: "Edit task",
    id: "gaaJnC",
  });

  function form(task: TaskEditorTask, hideHeading: boolean): ReactElement {
    return (
      <TaskEditor
        // Remounts per task so unsaved drafts never carry over to another task.
        key={task.id}
        task={task}
        contexts={editor.contexts}
        onChange={editor.onChange}
        onToggleDone={editor.onToggleDone}
        onToggleImportant={editor.onToggleImportant}
        onToggleMyDay={editor.onToggleMyDay}
        onArchive={editor.onArchive}
        onClose={editor.onClose}
        hideHeading={hideHeading}
      />
    );
  }

  if (isWide) {
    if (!editor.task) {
      return null;
    }
    return (
      <aside
        aria-label={heading}
        className="bg-surface border-separator sticky top-0 flex h-dvh w-[340px] shrink-0 flex-col overflow-y-auto border-l px-4 pt-10 pb-4"
      >
        {form(editor.task, false)}
      </aside>
    );
  }

  return (
    <Drawer isOpen={!!editor.task} onOpenChange={(open) => !open && editor.onClose()}>
      <Drawer.Backdrop>
        <Drawer.Content placement="bottom">
          <Drawer.Dialog className="max-h-[90dvh]">
            <Drawer.Handle />
            <Drawer.Header>
              <Drawer.Heading>{heading}</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body className="overflow-y-auto pb-6">{editor.task && form(editor.task, true)}</Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
