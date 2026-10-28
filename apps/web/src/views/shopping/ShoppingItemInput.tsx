import type { ChangeEvent, KeyboardEvent, ReactElement } from "react";
import { LinkIcon, PlusIcon } from "@heroicons/react/20/solid";
import { Chip, InputGroup, InputGroupInput, InputGroupPrefix, InputGroupSuffix, Kbd, TextField } from "@heroui/react";
import { useBreakpoint } from "@package/react";
import { useIntl } from "react-intl";
import { getShoppingCategoryLabel } from "./ShoppingLabels";
import type { ShoppingDraftProps } from "./ShoppingTypes";
import { formatKronor } from "~/components/display/shopping-list-card/ShoppingKind";

/** The add-item field: `2x milk`, `199 kr`, a pasted link. What it reads shows live underneath. */
export function ShoppingItemInput({ value, onChange, onSubmit, preview }: ShoppingDraftProps): ReactElement {
  const intl = useIntl();
  const isPhone = !useBreakpoint("sm");

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter" && !event.nativeEvent.isComposing) {
      event.preventDefault();
      onSubmit();
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <TextField
        aria-label={intl.formatMessage({
          description: "ShoppingItemInput - accessible name of the add-item field",
          defaultMessage: "Add item",
          id: "Rdez8A",
        })}
        className="w-full"
      >
        <InputGroup className="hero:bg-[rgb(32_33_36/0.92)] h-13 rounded-[14px]">
          <InputGroupPrefix>
            <PlusIcon className="size-5 text-(--ctx)" aria-hidden />
          </InputGroupPrefix>
          <InputGroupInput
            data-testid="shopping__item-input"
            value={value}
            onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            enterKeyHint="done"
            placeholder={
              isPhone
                ? intl.formatMessage({
                    description: "ShoppingItemInput - short placeholder on phones",
                    defaultMessage: "Add item · 2x milk",
                    id: "OlYq2m",
                  })
                : intl.formatMessage({
                    description: "ShoppingItemInput - placeholder showing quantity, link and price syntax",
                    defaultMessage: "Add item · 2x milk · paste a link · 199 kr",
                    id: "uINPMQ",
                  })
            }
          />
          {!isPhone && (
            <InputGroupSuffix>
              <Kbd className="text-muted bg-transparent text-xs font-normal shadow-none">
                <Kbd.Abbr keyValue="enter" />
              </Kbd>
            </InputGroupSuffix>
          )}
        </InputGroup>
      </TextField>
      {preview && (
        <div
          aria-live="polite"
          data-testid="shopping__item-preview"
          className="text-muted flex flex-wrap items-center gap-1.5 px-1.5 text-xs"
        >
          {intl.formatMessage({
            description: "ShoppingItemInput - label in front of the parsed item preview",
            defaultMessage: "Adds",
            id: "nxtZ4v",
          })}
          <span className="text-foreground font-medium">{preview.name}</span>
          {preview.qty !== null && (
            <Chip size="sm" variant="soft">
              {intl.formatMessage(
                {
                  description: "ShoppingItemInput - preview chip with the quantity",
                  defaultMessage: "× {qty}",
                  id: "g/qMtb",
                },
                { qty: preview.qty }
              )}
            </Chip>
          )}
          {preview.price !== null && (
            <Chip size="sm" variant="soft">
              {formatKronor(intl, preview.price)}
            </Chip>
          )}
          {preview.linkHost && (
            <Chip size="sm" variant="soft" color="accent">
              <LinkIcon className="size-3" aria-hidden />
              <Chip.Label>{preview.linkHost}</Chip.Label>
            </Chip>
          )}
          {preview.category && (
            <span>
              {intl.formatMessage(
                {
                  description: "ShoppingItemInput - the store section a grocery item will be listed under",
                  defaultMessage: "to {section}",
                  id: "LXAdWR",
                },
                { section: getShoppingCategoryLabel(intl, preview.category) }
              )}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
