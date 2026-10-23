import type { ChangeEvent, KeyboardEvent, ReactElement, Ref } from "react";
import { LinkIcon, PlusIcon } from "@heroicons/react/20/solid";
import { Chip, InputGroup, InputGroupInput, InputGroupPrefix, InputGroupSuffix, Kbd, TextField } from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import { formatReminder, formatRelativeDate } from "~/components/display/task-row/TaskDateFormat";
import type { ContextColor } from "~/core/contexts/KlartContext";
import { formatTaskLink } from "~/core/tasks/TaskLink";

/** What the typed line will become, shown live under the input. */
export interface QuickAddPreview {
  title: string;
  contextName: string;
  contextColor: ContextColor;
  due: string | null;
  remindAt: string | null;
  important: boolean;
  /** Tags other than the context's routing tag. */
  tags: string[];
  links: string[];
}

export interface QuickAddInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  /** `null` while the input is empty. */
  preview: QuickAddPreview | null;
  today: string;
  /** Shorter placeholder for narrow screens. */
  compact?: boolean;
  inputRef?: Ref<HTMLInputElement>;
}

export function QuickAddInput({
  value,
  onChange,
  onSubmit,
  preview,
  today,
  compact = false,
  inputRef,
}: QuickAddInputProps): ReactElement {
  const intl = useIntl();

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter" && !event.nativeEvent.isComposing) {
      event.preventDefault();
      onSubmit();
    }
  }

  return (
    <div className={clsx(preview && `ctx-${preview.contextColor}`, "flex flex-col gap-2")}>
      {preview && (
        <div
          aria-live="polite"
          data-testid="quick-add__preview"
          className="bg-surface/80 flex flex-wrap items-center gap-1.5 rounded-xl px-3 py-2 text-xs"
        >
          <span className="text-muted">
            {intl.formatMessage({
              description: "QuickAddInput - label in front of the parsed task preview",
              defaultMessage: "Will create",
              id: "TJPgwX",
            })}
          </span>
          <span className="text-sm font-semibold">“{preview.title || "…"}”</span>
          <Chip size="sm" variant="soft">
            <span className="size-1.5 rounded-full bg-(--ctx)" aria-hidden />
            <Chip.Label>{preview.contextName}</Chip.Label>
          </Chip>
          {preview.due && (
            <Chip size="sm" variant="soft">
              {intl.formatMessage(
                {
                  description: "QuickAddInput - preview chip with the due date",
                  defaultMessage: "Due {date} ({iso})",
                  id: "Qa5/+9",
                },
                { date: formatRelativeDate(intl, preview.due, today), iso: preview.due }
              )}
            </Chip>
          )}
          {preview.remindAt && (
            <Chip size="sm" variant="soft">
              {intl.formatMessage(
                {
                  description: "QuickAddInput - preview chip with the reminder time",
                  defaultMessage: "Remind {when}",
                  id: "DSdjMz",
                },
                { when: formatReminder(intl, preview.remindAt, today) }
              )}
            </Chip>
          )}
          {preview.important && (
            <Chip size="sm" variant="soft" color="warning">
              {intl.formatMessage({
                description: "QuickAddInput - preview chip shown when the task is important",
                defaultMessage: "Important",
                id: "3iaKL4",
              })}
            </Chip>
          )}
          {preview.tags.map((tag) => (
            <Chip key={tag} size="sm" variant="soft" color="accent">
              #{tag}
            </Chip>
          ))}
          {preview.links.map((link) => (
            <Chip key={link} size="sm" variant="soft">
              <LinkIcon className="size-3" aria-hidden />
              <Chip.Label>{formatTaskLink(link)}</Chip.Label>
            </Chip>
          ))}
        </div>
      )}
      <TextField
        aria-label={intl.formatMessage({
          description: "QuickAddInput - accessible name of the quick-add field",
          defaultMessage: "Add a task",
          id: "6Jk2vH",
        })}
        className="w-full"
      >
        <InputGroup className="hero:bg-[rgb(32_33_36/0.92)] h-13 rounded-[10px]">
          <InputGroupPrefix>
            <PlusIcon className="size-5 text-(--ctx)" aria-hidden />
          </InputGroupPrefix>
          <InputGroupInput
            ref={inputRef}
            data-testid="quick-add__input"
            value={value}
            onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            enterKeyHint="done"
            placeholder={
              compact
                ? intl.formatMessage({
                    description: "QuickAddInput - short placeholder showing the syntax on phones",
                    defaultMessage: "Add a task  #tag @fri ^09:00",
                    id: "xKmpPA",
                  })
                : intl.formatMessage({
                    description: "QuickAddInput - placeholder showing the quick-add syntax",
                    defaultMessage: "Add a task  ·  #work #acme  @fri  ^09:00  !",
                    id: "mPCg6n",
                  })
            }
          />
          {!compact && (
            <InputGroupSuffix>
              <Kbd className="text-muted bg-transparent text-xs font-normal shadow-none">
                <Kbd.Abbr keyValue="enter" />
                <Kbd.Content>
                  {intl.formatMessage({
                    description: "QuickAddInput - hint that Enter adds the task",
                    defaultMessage: "add",
                    id: "ZhX/uh",
                  })}
                </Kbd.Content>
              </Kbd>
            </InputGroupSuffix>
          )}
        </InputGroup>
      </TextField>
    </div>
  );
}
