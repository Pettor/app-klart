import type { KeyboardEvent, ReactElement } from "react";
import { ArrowTopRightOnSquareIcon, CheckIcon, StarIcon, SunIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import {
  Button,
  FieldError,
  Input,
  Label,
  Link,
  ListBox,
  Select,
  TextArea,
  TextField,
  ToggleButton,
} from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import { useTaskEditor } from "./UseTaskEditor";
import type { ContextColor } from "~/core/contexts/KlartContext";
import { formatTaskLink } from "~/core/tasks/TaskLink";

/** Everything the editor shows and edits. Built by the route hook from a domain `Task`. */
export interface TaskEditorTask {
  id: string;
  title: string;
  done: boolean;
  important: boolean;
  /** Local date `YYYY-MM-DD`. */
  due: string | null;
  /** Local date-time `YYYY-MM-DDTHH:MM`. */
  remindAt: string | null;
  /** Tags without the context's own routing tag. */
  tags: string[];
  links: string[];
  notes: string;
  contextId: string;
  contextColor: ContextColor;
  isInMyDay: boolean;
  /** Where the task lives in the data folder, e.g. `tasks/work/<id>.json`. */
  file: string;
}

export interface TaskEditorContextOption {
  id: string;
  name: string;
  color: ContextColor;
}

export type TaskEditorPatch = Partial<
  Pick<TaskEditorTask, "title" | "due" | "remindAt" | "tags" | "links" | "notes" | "contextId">
>;

export interface TaskEditorProps {
  task: TaskEditorTask;
  contexts: TaskEditorContextOption[];
  onChange: (patch: TaskEditorPatch) => void;
  onToggleDone: () => void;
  onToggleImportant: () => void;
  onToggleMyDay: () => void;
  onArchive: () => void;
  onClose: () => void;
  /** Hides the heading row, e.g. inside a drawer that has its own. */
  hideHeading?: boolean;
}

const FIELD_LABEL_CLASS = "text-muted text-xs font-normal";

function blurOnEnter(event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>): void {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    event.currentTarget.blur();
  }
}

/** Edits one task in place. Toggles and pickers save at once; text fields save on blur or Enter. */
export function TaskEditor({
  task,
  contexts,
  onChange,
  onToggleDone,
  onToggleImportant,
  onToggleMyDay,
  onArchive,
  onClose,
  hideHeading = false,
}: TaskEditorProps): ReactElement {
  const intl = useIntl();
  const drafts = useTaskEditor(task, onChange);

  return (
    <div className={clsx(`ctx-${task.contextColor}`, "flex flex-1 flex-col gap-3.5")} data-testid="task-editor">
      {!hideHeading && (
        <div className="flex items-center gap-2">
          <h2 className="text-muted flex-1 text-xs font-semibold tracking-wider uppercase">
            {intl.formatMessage({
              description: "TaskEditor - panel heading",
              defaultMessage: "Edit task",
              id: "dfjnER",
            })}
          </h2>
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            aria-label={intl.formatMessage({
              description: "TaskEditor - aria-label of the button closing the editor",
              defaultMessage: "Close editor",
              id: "/4iXHi",
            })}
            onPress={onClose}
            data-testid="task-editor__close"
          >
            <XMarkIcon className="size-4" />
          </Button>
        </div>
      )}

      <div className="bg-surface-secondary flex items-start gap-2.5 rounded-xl p-3">
        <Button
          isIconOnly
          variant="ghost"
          size="sm"
          aria-label={
            task.done
              ? intl.formatMessage({
                  description: "TaskEditor - aria-label for marking a completed task as not completed",
                  defaultMessage: "Mark not completed",
                  id: "/AGam0",
                })
              : intl.formatMessage({
                  description: "TaskEditor - aria-label for completing a task",
                  defaultMessage: "Complete task",
                  id: "0sa5wx",
                })
          }
          onPress={onToggleDone}
          className="shrink-0 rounded-full"
          data-testid="task-editor__toggle"
        >
          {task.done ? (
            <span className="grid size-5 place-items-center rounded-full bg-(--ctx)">
              <CheckIcon className="text-background size-3.5" />
            </span>
          ) : (
            <span className="block size-5 rounded-full border-2" style={{ borderColor: "var(--ctx)" }} />
          )}
        </Button>
        <TextField
          aria-label={intl.formatMessage({
            description: "TaskEditor - aria-label of the title field",
            defaultMessage: "Title",
            id: "OtSHnr",
          })}
          value={drafts.title}
          onChange={drafts.setTitle}
          className="min-w-0 flex-1"
        >
          <TextArea
            rows={2}
            onBlur={drafts.commitTitle}
            onKeyDown={blurOnEnter}
            className={clsx(
              "resize-none border-0 bg-transparent px-0 py-1 text-[17px] leading-snug font-semibold shadow-none",
              task.done && "text-muted line-through"
            )}
            data-testid="task-editor__title"
          />
        </TextField>
        <ToggleButton
          isIconOnly
          variant="ghost"
          size="sm"
          isSelected={task.important}
          onChange={onToggleImportant}
          aria-label={intl.formatMessage({
            description: "TaskEditor - aria-label for the important toggle",
            defaultMessage: "Important",
            id: "MsVAQu",
          })}
          className={clsx(
            "shrink-0 data-[selected=true]:bg-transparent",
            task.important ? "text-(--star)" : "text-muted"
          )}
          data-testid="task-editor__important"
        >
          {task.important ? <StarIcon className="size-[18px]" /> : <StarOutlineIcon className="size-[18px]" />}
        </ToggleButton>
      </div>

      <Button
        variant="secondary"
        onPress={onToggleMyDay}
        className={clsx("h-11 justify-start rounded-xl px-3", task.isInMyDay && "text-(--ctx)")}
        data-testid="task-editor__my-day"
      >
        <SunIcon className="size-[18px]" />
        {task.isInMyDay
          ? intl.formatMessage({
              description: "TaskEditor - button removing the task from My Day",
              defaultMessage: "In My Day · remove",
              id: "F9Dm4x",
            })
          : intl.formatMessage({
              description: "TaskEditor - button adding the task to My Day",
              defaultMessage: "Add to My Day",
              id: "sM1o5T",
            })}
      </Button>

      <div className="grid grid-cols-2 gap-2.5">
        <Select
          value={task.contextId}
          onChange={(key) => key && onChange({ contextId: String(key) })}
          className="flex min-w-0 flex-col gap-1"
          data-testid="task-editor__context"
        >
          <Label className={FIELD_LABEL_CLASS}>
            {intl.formatMessage({
              description: "TaskEditor - label of the context picker",
              defaultMessage: "Context",
              id: "UrqvLo",
            })}
          </Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {contexts.map((context) => (
                <ListBox.Item key={context.id} id={context.id} textValue={context.name}>
                  <span className={clsx(`ctx-${context.color}`, "size-2 shrink-0 rounded-full bg-(--ctx)")} />
                  {context.name}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>

        <TextField
          value={task.due ?? ""}
          onChange={(value) => onChange({ due: value || null })}
          className="flex min-w-0 flex-col gap-1"
        >
          <Label className={FIELD_LABEL_CLASS}>
            {intl.formatMessage({
              description: "TaskEditor - label of the due date field",
              defaultMessage: "Due",
              id: "drwO1k",
            })}
          </Label>
          <Input type="date" data-testid="task-editor__due" />
        </TextField>
      </div>

      <TextField
        value={task.remindAt ?? ""}
        onChange={(value) => onChange({ remindAt: value || null })}
        className="flex flex-col gap-1"
      >
        <Label className={FIELD_LABEL_CLASS}>
          {intl.formatMessage({
            description: "TaskEditor - label of the reminder field",
            defaultMessage: "Reminder",
            id: "cFN2n/",
          })}
        </Label>
        <Input type="datetime-local" data-testid="task-editor__reminder" />
      </TextField>

      <TextField value={drafts.tags} onChange={drafts.setTags} className="flex flex-col gap-1">
        <Label className={FIELD_LABEL_CLASS}>
          {intl.formatMessage({
            description: "TaskEditor - label of the tags field",
            defaultMessage: "Tags",
            id: "d35Usm",
          })}
        </Label>
        <Input
          placeholder={intl.formatMessage({
            description: "TaskEditor - placeholder of the tags field",
            defaultMessage: "#errands #home",
            id: "u2CPIX",
          })}
          onBlur={drafts.commitTags}
          onKeyDown={blurOnEnter}
          className="text-(--tag)"
          data-testid="task-editor__tags"
        />
      </TextField>

      <div className="flex flex-col gap-1">
        <TextField
          value={drafts.newLink}
          onChange={drafts.setNewLink}
          isInvalid={drafts.isNewLinkInvalid}
          className="flex flex-col gap-1"
        >
          <Label className={FIELD_LABEL_CLASS}>
            {intl.formatMessage({
              description: "TaskEditor - label of the links field",
              defaultMessage: "Links",
              id: "1IMBlB",
            })}
          </Label>
          {task.links.map((link) => (
            <div key={link} className="bg-surface-secondary flex items-center gap-1 rounded-lg py-0.5 pr-0.5 pl-3">
              <span className="min-w-0 flex-1 truncate text-sm" title={link}>
                {formatTaskLink(link)}
              </span>
              <Link
                href={link}
                target="_blank"
                rel="noreferrer"
                aria-label={intl.formatMessage(
                  {
                    description: "TaskEditor - aria-label for opening a link in a new tab",
                    defaultMessage: "Open link to {host}",
                    id: "OnkVyV",
                  },
                  { host: formatTaskLink(link) }
                )}
                className="text-foreground grid size-8 place-items-center rounded-md"
                data-testid="task-editor__link"
              >
                <ArrowTopRightOnSquareIcon className="size-4" />
              </Link>
              <Button
                isIconOnly
                variant="ghost"
                size="sm"
                aria-label={intl.formatMessage(
                  {
                    description: "TaskEditor - aria-label for removing a link from the task",
                    defaultMessage: "Remove link to {host}",
                    id: "sDQKaL",
                  },
                  { host: formatTaskLink(link) }
                )}
                onPress={() => drafts.removeLink(link)}
              >
                <XMarkIcon className="size-4" />
              </Button>
            </div>
          ))}
          <Input
            type="url"
            placeholder={intl.formatMessage({
              description: "TaskEditor - placeholder of the field adding a link",
              defaultMessage: "Add a link: https://",
              id: "Bf2E+1",
            })}
            onBlur={drafts.commitNewLink}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                drafts.commitNewLink();
              }
            }}
            data-testid="task-editor__new-link"
          />
          <FieldError>
            {intl.formatMessage({
              description: "TaskEditor - error shown when a link isn't an http(s) URL or www. address",
              defaultMessage: "Links must start with http://, https:// or www.",
              id: "FjHUYj",
            })}
          </FieldError>
        </TextField>
      </div>

      <TextField value={drafts.notes} onChange={drafts.setNotes} className="flex flex-col gap-1">
        <Label className={FIELD_LABEL_CLASS}>
          {intl.formatMessage({
            description: "TaskEditor - label of the notes field",
            defaultMessage: "Notes",
            id: "58rsv2",
          })}
        </Label>
        <TextArea
          rows={4}
          placeholder={intl.formatMessage({
            description: "TaskEditor - placeholder of the notes field",
            defaultMessage: "Add a note",
            id: "dk9jNg",
          })}
          onBlur={drafts.commitNotes}
          className="resize-y leading-relaxed"
          data-testid="task-editor__notes"
        />
      </TextField>

      <div className="border-separator text-muted mt-auto flex items-center gap-2 border-t pt-2.5 text-xs">
        <span className="min-w-0 flex-1 truncate">
          {intl.formatMessage(
            {
              description: "TaskEditor - footer saying changes save on their own, with the task's file path",
              defaultMessage: "Saved automatically · {file}",
              id: "vY8h3F",
            },
            { file: <code className="font-mono">{task.file}</code> }
          )}
        </span>
        <Button variant="danger-soft" size="sm" onPress={onArchive} data-testid="task-editor__archive">
          {intl.formatMessage({
            description: "TaskEditor - button archiving (deleting) the task",
            defaultMessage: "Delete task",
            id: "VzgUtL",
          })}
        </Button>
      </div>
    </div>
  );
}
