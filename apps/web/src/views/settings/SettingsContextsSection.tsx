import { useState, type ChangeEvent, type KeyboardEvent, type ReactElement } from "react";
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, TrashIcon } from "@heroicons/react/20/solid";
import { Button, Input, Label, Radio, RadioGroup, TextField } from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import { SettingsSectionShell } from "./SettingsSectionShell";
import { useContextCardDraft } from "./UseContextCardDraft";
import type { ContextColor } from "~/core/contexts/KlartContext";
import { CONTEXT_COLORS } from "~/core/contexts/KlartContext";

export interface SettingsContextItem {
  id: string;
  name: string;
  color: ContextColor;
  tag: string;
  openTaskCount: number;
}

export interface SettingsContextsSectionProps {
  contexts: SettingsContextItem[];
  onCreate: (name: string, color: ContextColor) => void;
  onUpdate: (id: string, patch: { name?: string; tag?: string; color?: ContextColor }) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
}

function onEnter(commit: () => void): (event: KeyboardEvent<HTMLInputElement>) => void {
  return (event) => {
    if (event.key === "Enter") {
      commit();
    }
  };
}

interface ContextCardProps {
  context: SettingsContextItem;
  index: number;
  count: number;
  onUpdate: SettingsContextsSectionProps["onUpdate"];
  onRemove: SettingsContextsSectionProps["onRemove"];
  onMove: SettingsContextsSectionProps["onMove"];
}

function ContextCard({ context, index, count, onUpdate, onRemove, onMove }: ContextCardProps): ReactElement {
  const intl = useIntl();
  const draft = useContextCardDraft(context, (patch) => onUpdate(context.id, patch));

  return (
    <div
      data-testid="settings-context-card"
      className={clsx(`ctx-${context.color}`, "hero-card bg-surface flex flex-col gap-3 rounded-xl border-t-[3px] p-4")}
      style={{ borderTopColor: "var(--ctx)" }}
    >
      <div className="flex items-center gap-2">
        <span className="size-2.5 rounded-full bg-(--ctx)" aria-hidden />
        <span className="flex-1 font-semibold">{context.name}</span>
        {index < 9 && <span className="text-muted text-xs">⌥{index + 1}</span>}
      </div>
      <TextField className="flex flex-col gap-1">
        <Label className="text-muted text-xs">
          {intl.formatMessage({
            description: "SettingsContexts - context name field",
            defaultMessage: "Name",
            id: "3Co7al",
          })}
        </Label>
        <Input
          value={draft.name}
          onChange={(event: ChangeEvent<HTMLInputElement>) => draft.setName(event.target.value)}
          onBlur={draft.commit}
          onKeyDown={onEnter(draft.commit)}
        />
      </TextField>
      <TextField className="flex flex-col gap-1">
        <Label className="text-muted text-xs">
          {intl.formatMessage({
            description: "SettingsContexts - routing tag field; typing #tag in quick add moves the task here",
            defaultMessage: "Routing tag",
            id: "fhp2kC",
          })}
        </Label>
        <Input
          value={draft.tag}
          onChange={(event: ChangeEvent<HTMLInputElement>) => draft.setTag(event.target.value)}
          onBlur={draft.commit}
          onKeyDown={onEnter(draft.commit)}
          className="font-mono"
        />
      </TextField>
      <RadioGroup
        orientation="horizontal"
        value={context.color}
        onChange={(value) => onUpdate(context.id, { color: value as ContextColor })}
        aria-label={intl.formatMessage({
          description: "SettingsContexts - color picker",
          defaultMessage: "Color",
          id: "+5V2wn",
        })}
        className="flex flex-wrap gap-1.5"
      >
        {CONTEXT_COLORS.map((color) => (
          <Radio
            key={color}
            value={color}
            aria-label={color}
            className={clsx(
              `ctx-${color}`,
              "size-7 rounded-full border-2 border-transparent bg-(--ctx) p-0",
              "data-[selected=true]:border-foreground data-[focus-visible=true]:border-focus"
            )}
          >
            <Radio.Content className="size-full" />
          </Radio>
        ))}
      </RadioGroup>
      <div className="text-muted flex items-center gap-1 text-xs">
        <span className="flex-1">
          {intl.formatMessage(
            {
              description: "SettingsContexts - open tasks in a context",
              defaultMessage: "{count, plural, =0 {No open tasks} one {# open task} other {# open tasks}}",
              id: "RPStZV",
            },
            { count: context.openTaskCount }
          )}
        </span>
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          isDisabled={index === 0}
          onPress={() => onMove(context.id, -1)}
          aria-label={intl.formatMessage({
            description: "SettingsContexts - move context up",
            defaultMessage: "Move up",
            id: "Qsfhri",
          })}
        >
          <ArrowUpIcon className="size-4" />
        </Button>
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          isDisabled={index === count - 1}
          onPress={() => onMove(context.id, 1)}
          aria-label={intl.formatMessage({
            description: "SettingsContexts - move context down",
            defaultMessage: "Move down",
            id: "THKqiT",
          })}
        >
          <ArrowDownIcon className="size-4" />
        </Button>
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          isDisabled={count <= 1}
          onPress={() => onRemove(context.id)}
          aria-label={intl.formatMessage(
            {
              description: "SettingsContexts - remove a context; its tasks move to the first context",
              defaultMessage: "Remove {name}",
              id: "yleOjM",
            },
            { name: context.name }
          )}
        >
          <TrashIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function SettingsContextsSection({
  contexts,
  onCreate,
  onUpdate,
  onRemove,
  onMove,
}: SettingsContextsSectionProps): ReactElement {
  const intl = useIntl();
  const [newName, setNewName] = useState("");

  function create(): void {
    if (!newName.trim()) {
      return;
    }
    const used = new Set(contexts.map((context) => context.color));
    onCreate(newName, CONTEXT_COLORS.find((color) => !used.has(color)) ?? "teal");
    setNewName("");
  }

  return (
    <SettingsSectionShell
      id="contexts"
      title={intl.formatMessage({
        description: "SettingsContexts - section heading",
        defaultMessage: "Contexts",
        id: "6JGs/A",
      })}
      description={intl.formatMessage({
        description: "SettingsContexts - section intro",
        defaultMessage:
          "Create as many contexts as you need. Each has its own color, My Day and suggestions; tags do the rest. Switch from the dropdown or with ⌥1, ⌥2, ⌥3. All contexts (⌥0) is always available. Removing a context moves its tasks to the first one.",
        id: "HSJrIf",
      })}
    >
      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
        {contexts.map((context, index) => (
          <ContextCard
            key={context.id}
            context={context}
            index={index}
            count={contexts.length}
            onUpdate={onUpdate}
            onRemove={onRemove}
            onMove={onMove}
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <TextField
          aria-label={intl.formatMessage({
            description: "SettingsContexts - aria-label of the new context name field",
            defaultMessage: "New context name",
            id: "0AorMA",
          })}
        >
          <Input
            value={newName}
            data-testid="settings__new-context-name"
            placeholder={intl.formatMessage({
              description: "SettingsContexts - placeholder of the new context name field",
              defaultMessage: "e.g. Football club",
              id: "Jyha0S",
            })}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setNewName(event.target.value)}
            onKeyDown={onEnter(create)}
          />
        </TextField>
        <Button variant="secondary" onPress={create} isDisabled={!newName.trim()} data-testid="settings__new-context">
          <PlusIcon className="size-4" aria-hidden />
          {intl.formatMessage({
            description: "SettingsContexts - add context button",
            defaultMessage: "New context",
            id: "2qvlRi",
          })}
        </Button>
      </div>
    </SettingsSectionShell>
  );
}
