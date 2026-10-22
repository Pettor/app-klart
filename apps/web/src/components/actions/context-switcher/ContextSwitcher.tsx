import type { ReactElement } from "react";
import { AdjustmentsHorizontalIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import type { Selection } from "@heroui/react";
import { Button, Dropdown, Kbd, Label, Separator } from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import { isMac } from "~/components/actions/command-palette/CommandShortcut";
import type { ContextColor } from "~/core/contexts/KlartContext";

export interface ContextSwitcherOption {
  /** Context id, or `"all"`. */
  id: string;
  name: string;
  color: ContextColor | "all";
  /** Open tasks in today's My Day. */
  dayCount: number;
  /** Shortcut digit shown next to the option, e.g. `1` for ⌥1. */
  shortcut?: string;
}

export interface ContextSwitcherProps {
  options: ContextSwitcherOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  onManage: () => void;
  /** `compact` is the pill used in the mobile top bar. */
  variant?: "sidebar" | "compact";
}

const MANAGE_KEY = "__manage";

export function ContextSwitcher({
  options,
  selectedId,
  onSelect,
  onManage,
  variant = "sidebar",
}: ContextSwitcherProps): ReactElement {
  const intl = useIntl();
  const selected = options.find((option) => option.id === selectedId) ?? options[0];

  function handleSelection(keys: Selection): void {
    if (keys === "all") {
      return;
    }
    const [key] = [...keys];
    if (key !== undefined && key !== MANAGE_KEY) {
      onSelect(String(key));
    }
  }

  return (
    <Dropdown>
      <Button
        variant="secondary"
        data-testid="context-switcher__trigger"
        aria-label={intl.formatMessage(
          {
            description: "ContextSwitcher - aria-label of the trigger button",
            defaultMessage: "Context: {name}",
            id: "LKm8Ll",
          },
          { name: selected?.name ?? "" }
        )}
        className={clsx(
          `ctx-${selected?.color ?? "all"}`,
          "text-foreground",
          variant === "sidebar"
            ? "border-border bg-surface hover:bg-surface-secondary h-11 w-full justify-start gap-2.5 rounded-[10px] border px-3 text-left"
            : "h-9 rounded-full px-3.5"
        )}
      >
        <span className="size-2.5 shrink-0 rounded-full bg-(--ctx)" aria-hidden />
        {variant === "sidebar" ? (
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-muted text-[11px] font-normal">
              {intl.formatMessage({
                description: "ContextSwitcher - small caption above the selected context",
                defaultMessage: "Context",
                id: "nhTiO/",
              })}
            </span>
            <span className="truncate text-sm leading-tight font-semibold">{selected?.name}</span>
          </span>
        ) : (
          <span className="text-sm font-semibold">{selected?.name}</span>
        )}
        {variant === "sidebar" && selected?.shortcut && (
          <span className="text-muted text-xs font-normal" aria-hidden>
            {isMac() ? "⌥" : "Alt+"}
            {selected.shortcut}
          </span>
        )}
        <ChevronDownIcon className="text-muted size-4 shrink-0" aria-hidden />
      </Button>
      <Dropdown.Popover className="min-w-60">
        <Dropdown.Menu
          aria-label={intl.formatMessage({
            description: "ContextSwitcher - aria-label of the menu",
            defaultMessage: "Switch context",
            id: "nNwuaz",
          })}
          selectionMode="single"
          selectedKeys={new Set([selectedId])}
          onSelectionChange={handleSelection}
          onAction={(key) => key === MANAGE_KEY && onManage()}
        >
          <Dropdown.Section>
            {options.map((option) => (
              <Dropdown.Item key={option.id} id={option.id} textValue={option.name} className={`ctx-${option.color}`}>
                <span className="size-2.5 shrink-0 rounded-full bg-(--ctx)" aria-hidden />
                <Label className="flex-1">{option.name}</Label>
                {option.dayCount > 0 && <span className="text-muted text-xs">{option.dayCount}</span>}
                {option.shortcut && (
                  <Kbd slot="keyboard" className="text-xs">
                    {isMac() ? <Kbd.Abbr keyValue="option" /> : <Kbd.Content>Alt</Kbd.Content>}
                    <Kbd.Content>{option.shortcut}</Kbd.Content>
                  </Kbd>
                )}
              </Dropdown.Item>
            ))}
          </Dropdown.Section>
          <Separator />
          <Dropdown.Item id={MANAGE_KEY} textValue="manage">
            <AdjustmentsHorizontalIcon className="text-muted size-4" aria-hidden />
            <Label>
              {intl.formatMessage({
                description: "ContextSwitcher - menu item opening context settings",
                defaultMessage: "Manage contexts",
                id: "n90nx0",
              })}
            </Label>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
