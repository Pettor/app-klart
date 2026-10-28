import type { ChangeEvent, KeyboardEvent, ReactElement } from "react";
import { useState } from "react";
import { Button, Input, Label, TextField, ToggleButton } from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import type { ShoppingNewListProps } from "./ShoppingTypes";
import { getShoppingKindLabel, ShoppingKindIcon } from "~/components/display/shopping-list-card/ShoppingKind";
import type { ShoppingListKind } from "~/core/shopping/ShoppingList";
import { SHOPPING_KIND_COLORS, SHOPPING_LIST_KINDS } from "~/core/shopping/ShoppingList";

export interface ShoppingNewListFormProps extends ShoppingNewListProps {
  onDone: () => void;
}

/** Name and kind for a new list. An empty name takes the kind's name. */
export function ShoppingNewListForm({ onCreate, onDone }: ShoppingNewListFormProps): ReactElement {
  const intl = useIntl();
  const [name, setName] = useState("");
  const [kind, setKind] = useState<ShoppingListKind>("grocery");

  function create(): void {
    onCreate(name.trim() || getShoppingKindLabel(intl, kind), kind);
    setName("");
    onDone();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter" && !event.nativeEvent.isComposing) {
      event.preventDefault();
      create();
    } else if (event.key === "Escape") {
      onDone();
    }
  }

  return (
    <div
      className="settings-pane-in bg-surface border-separator flex flex-col gap-2.5 rounded-[14px] border p-3"
      data-testid="shopping__new-list"
    >
      <TextField className="flex flex-col gap-1.5">
        <Label className="text-muted text-xs">
          {intl.formatMessage({
            description: "ShoppingNewListForm - label of the new list's name field",
            defaultMessage: "List name",
            id: "N9+wrf",
          })}
        </Label>
        <Input
          autoFocus
          value={name}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setName(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={intl.formatMessage({
            description: "ShoppingNewListForm - placeholder of the new list's name field",
            defaultMessage: "e.g. Birthday party",
            id: "OyrxHm",
          })}
          data-testid="shopping__new-list-name"
        />
      </TextField>
      {/* A plain grid, not a ToggleButtonGroup: the group joins and sizes its buttons, which breaks the columns. */}
      <div
        role="group"
        aria-label={intl.formatMessage({
          description: "ShoppingNewListForm - aria-label of the list type choice",
          defaultMessage: "List type",
          id: "cFCVuL",
        })}
        className="grid grid-cols-2 gap-1.5"
      >
        {SHOPPING_LIST_KINDS.map((option) => (
          <ToggleButton
            key={option}
            variant="ghost"
            isSelected={kind === option}
            onChange={() => setKind(option)}
            data-testid={`shopping__new-list-kind-${option}`}
            className={clsx(
              `ctx-${SHOPPING_KIND_COLORS[option]}`,
              "border-separator text-muted h-auto w-full min-w-0 justify-start gap-2 rounded-[10px] border px-3 py-2.5 text-[13px] font-normal",
              "data-[selected=true]:border-(--ctx) data-[selected=true]:bg-(--ctx)/15 data-[selected=true]:text-(--ctx)"
            )}
          >
            <ShoppingKindIcon kind={option} className="size-[18px]" />
            <span className="max-w-full truncate">{getShoppingKindLabel(intl, option)}</span>
          </ToggleButton>
        ))}
      </div>
      <Button onPress={create} data-testid="shopping__create-list">
        {intl.formatMessage({
          description: "ShoppingNewListForm - button creating the list",
          defaultMessage: "Create list",
          id: "mm/O2z",
        })}
      </Button>
    </div>
  );
}
