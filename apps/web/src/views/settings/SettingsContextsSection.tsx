import type { ChangeEvent, KeyboardEvent, ReactElement } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CloudIcon,
  ComputerDesktopIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";
import { Button, Input, Label, ListBox, Radio, RadioGroup, Select, TextField } from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import { SettingsSectionShell } from "./SettingsSectionShell";
import { useContextCardDraft } from "./UseContextCardDraft";
import { useNewContextDraft } from "./UseNewContextDraft";
import type { ContextColor } from "~/core/contexts/KlartContext";
import { CONTEXT_COLORS } from "~/core/contexts/KlartContext";

export interface SettingsContextItem {
  id: string;
  name: string;
  color: ContextColor;
  tag: string;
  openTaskCount: number;
  /** Hidden on this device: it keeps syncing but isn't shown anywhere else. */
  isHidden: boolean;
  /** The sync it lives in, or `null` when it's kept on this device only. Left out when nothing syncs. */
  syncName?: string | null;
}

export interface SettingsContextsSectionProps {
  contexts: SettingsContextItem[];
  /** The syncs a new context can live in, primary first. Empty when nothing syncs. */
  syncs: { id: string; name: string }[];
  /** `syncId` is where the new context lives from then on; `null` when nothing syncs. */
  onCreate: (name: string, color: ContextColor, syncId: string | null) => void;
  onUpdate: (id: string, patch: { name?: string; tag?: string; color?: ContextColor }) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onHiddenChange: (id: string, isHidden: boolean) => void;
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
  /** Its ⌥ shortcut number among the shown contexts; `null` when hidden or past ⌥9. */
  shortcut: number | null;
  /** It's the only context shown, so it can't be hidden. */
  isLastShown: boolean;
  onUpdate: SettingsContextsSectionProps["onUpdate"];
  onRemove: SettingsContextsSectionProps["onRemove"];
  onMove: SettingsContextsSectionProps["onMove"];
  onHiddenChange: SettingsContextsSectionProps["onHiddenChange"];
}

function ContextSyncLabel({ syncName }: { syncName: string | null }): ReactElement {
  const intl = useIntl();
  const Icon = syncName === null ? ComputerDesktopIcon : CloudIcon;
  const label =
    syncName ??
    intl.formatMessage({
      description: "SettingsContexts - a context kept on this device, in no sync",
      defaultMessage: "This device only",
      id: "cIBG2X",
    });

  return (
    <span
      className="text-muted flex min-w-0 items-center gap-1 text-xs"
      title={intl.formatMessage(
        {
          description: "SettingsContexts - tooltip of the sync a context lives in",
          defaultMessage: "Lives in {sync}",
          id: "fI0X9B",
        },
        { sync: label }
      )}
      data-testid="settings-context-card__sync"
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      <span className="truncate">{label}</span>
    </span>
  );
}

function ContextCard({
  context,
  index,
  count,
  shortcut,
  isLastShown,
  onUpdate,
  onRemove,
  onMove,
  onHiddenChange,
}: ContextCardProps): ReactElement {
  const intl = useIntl();
  const draft = useContextCardDraft(context, (patch) => onUpdate(context.id, patch));

  return (
    <div
      data-testid="settings-context-card"
      data-hidden={context.isHidden || undefined}
      className={clsx(
        `ctx-${context.color}`,
        "hero-card bg-surface flex flex-col gap-3 rounded-xl border-t-[3px] p-4",
        context.isHidden && "opacity-60"
      )}
      style={{ borderTopColor: "var(--ctx)" }}
    >
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-(--ctx)" aria-hidden />
          <span className="flex-1 font-semibold">{context.name}</span>
          {context.isHidden ? (
            <span className="text-muted text-xs">
              {intl.formatMessage({
                description: "SettingsContexts - marks a context hidden on this device",
                defaultMessage: "Hidden",
                id: "ofC1VR",
              })}
            </span>
          ) : (
            shortcut !== null && <span className="text-muted text-xs">⌥{shortcut}</span>
          )}
        </div>
        {context.syncName !== undefined && <ContextSyncLabel syncName={context.syncName} />}
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
          isDisabled={!context.isHidden && isLastShown}
          onPress={() => onHiddenChange(context.id, !context.isHidden)}
          aria-label={intl.formatMessage(
            {
              description: "SettingsContexts - show or hide a context on this device",
              defaultMessage: "{hidden, select, true {Show {name}} other {Hide {name}}}",
              id: "SaOYok",
            },
            { hidden: String(context.isHidden), name: context.name }
          )}
          data-testid="settings-context-card__visibility"
        >
          {context.isHidden ? <EyeIcon className="size-4" /> : <EyeSlashIcon className="size-4" />}
        </Button>
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
  syncs,
  onCreate,
  onUpdate,
  onRemove,
  onMove,
  onHiddenChange,
}: SettingsContextsSectionProps): ReactElement {
  const intl = useIntl();
  const draft = useNewContextDraft(
    contexts.map((context) => context.color),
    syncs,
    onCreate
  );
  const shown = contexts.filter((context) => !context.isHidden);
  const syncLabel = intl.formatMessage({
    description: "SettingsContexts - label of the sync picker for a new context",
    defaultMessage: "Sync for the new context",
    id: "fuoSBA",
  });

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
        {contexts.map((context, index) => {
          const shownIndex = shown.indexOf(context);
          return (
            <ContextCard
              key={context.id}
              context={context}
              index={index}
              count={contexts.length}
              shortcut={shownIndex >= 0 && shownIndex < 9 ? shownIndex + 1 : null}
              isLastShown={shown.length <= 1}
              onUpdate={onUpdate}
              onRemove={onRemove}
              onMove={onMove}
              onHiddenChange={onHiddenChange}
            />
          );
        })}
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
            value={draft.name}
            data-testid="settings__new-context-name"
            placeholder={intl.formatMessage({
              description: "SettingsContexts - placeholder of the new context name field",
              defaultMessage: "e.g. Football club",
              id: "Jyha0S",
            })}
            onChange={(event: ChangeEvent<HTMLInputElement>) => draft.setName(event.target.value)}
            onKeyDown={onEnter(draft.create)}
          />
        </TextField>
        {syncs.length > 1 && draft.syncId && (
          <Select
            aria-label={syncLabel}
            value={draft.syncId}
            onChange={(key) => key && draft.setSyncId(String(key))}
            className="w-52"
            data-testid="settings__new-context-sync"
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {syncs.map((sync) => (
                  <ListBox.Item key={sync.id} id={sync.id} textValue={sync.name}>
                    {sync.name}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        )}
        <Button
          variant="secondary"
          onPress={draft.create}
          isDisabled={!draft.name.trim()}
          data-testid="settings__new-context"
        >
          <PlusIcon className="size-4" aria-hidden />
          {intl.formatMessage({
            description: "SettingsContexts - add context button",
            defaultMessage: "New context",
            id: "2qvlRi",
          })}
        </Button>
      </div>
      {syncs.length > 0 && (
        <p className="text-muted text-[13px] leading-relaxed">
          {intl.formatMessage({
            description: "SettingsContexts - explains where contexts live and what hiding does",
            defaultMessage:
              "A context lives in the sync it was created in, along with its tasks and lists, and stays there. Hiding a context only hides it on this device; it keeps syncing.",
            id: "54hyIU",
          })}
        </p>
      )}
    </SettingsSectionShell>
  );
}
