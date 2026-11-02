import type { KeyboardEvent, ReactElement } from "react";
import { StarIcon, SunIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import { Button, FieldError, Input, Label, ListBox, Select, TextArea, TextField, ToggleButton } from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import { getShoppingCategoryLabel } from "./ShoppingLabels";
import type { ShoppingEditorItem } from "./ShoppingTypes";
import { useShoppingItemEditor } from "./UseShoppingItemEditor";
import { TaskCheck } from "~/components/display/task-row/TaskRowParts";
import type { ContextColor } from "~/core/contexts/KlartContext";
import type { ShoppingCategory } from "~/core/shopping/ShoppingCategory";
import { SHOPPING_CATEGORIES } from "~/core/shopping/ShoppingCategory";
import type { ShoppingItemPatch } from "~/core/shopping/ShoppingData";

export interface ShoppingItemEditorProps {
  item: ShoppingEditorItem;
  /** The list's accent. */
  color: ContextColor;
  /** Grocery lists group by store section, so only they offer it. */
  showCategory: boolean;
  onChange: (patch: ShoppingItemPatch) => void;
  onToggleBought: () => void;
  onToggleImportant: () => void;
  onToggleMyDay: () => void;
  onRemove: () => void;
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

/** Edits one shopping item in place. Toggles and pickers save at once; text fields save on blur or Enter. */
export function ShoppingItemEditor({
  item,
  color,
  showCategory,
  onChange,
  onToggleBought,
  onToggleImportant,
  onToggleMyDay,
  onRemove,
  onClose,
  hideHeading = false,
}: ShoppingItemEditorProps): ReactElement {
  const intl = useIntl();
  const drafts = useShoppingItemEditor(item, onChange);

  return (
    <div className={clsx(`ctx-${color}`, "flex flex-1 flex-col gap-3.5")} data-testid="shopping-item-editor">
      {!hideHeading && (
        <div className="flex items-center gap-2">
          <h2 className="text-muted flex-1 text-xs font-semibold tracking-wider uppercase">
            {intl.formatMessage({
              description: "ShoppingItemEditor - panel heading",
              defaultMessage: "Edit item",
              id: "vEZ1+7",
            })}
          </h2>
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            aria-label={intl.formatMessage({
              description: "ShoppingItemEditor - aria-label of the button closing the editor",
              defaultMessage: "Close editor",
              id: "DoqYwP",
            })}
            onPress={onClose}
            data-testid="shopping-item-editor__close"
          >
            <XMarkIcon className="size-4" />
          </Button>
        </div>
      )}

      <div className="bg-surface-secondary flex items-start gap-1.5 rounded-xl p-2">
        <TaskCheck
          done={item.bought}
          isChecking={false}
          onPress={onToggleBought}
          testId="shopping-item-editor__toggle"
        />
        <TextField
          aria-label={intl.formatMessage({
            description: "ShoppingItemEditor - aria-label of the name field",
            defaultMessage: "Name",
            id: "aHQgQY",
          })}
          value={drafts.name}
          onChange={drafts.setName}
          className="min-w-0 flex-1"
        >
          <TextArea
            rows={1}
            onBlur={drafts.commitName}
            onKeyDown={blurOnEnter}
            className={clsx(
              "field-sizing-content min-h-10 resize-none border-0 bg-transparent px-2 py-2 text-[17px] leading-snug font-semibold shadow-none",
              item.bought && "text-muted line-through"
            )}
            data-testid="shopping-item-editor__name"
          />
        </TextField>
        <ToggleButton
          isIconOnly
          variant="ghost"
          size="sm"
          isSelected={item.important}
          onChange={onToggleImportant}
          aria-label={intl.formatMessage({
            description: "ShoppingItemEditor - aria-label for the important toggle",
            defaultMessage: "Important",
            id: "odWXCZ",
          })}
          className={clsx(
            "mt-0.5 shrink-0 data-[selected=true]:bg-transparent",
            item.important ? "text-(--star)" : "text-muted"
          )}
          data-testid="shopping-item-editor__important"
        >
          {item.important ? <StarIcon className="size-[18px]" /> : <StarOutlineIcon className="size-[18px]" />}
        </ToggleButton>
      </div>

      {!item.bought && (
        <Button
          variant="secondary"
          onPress={onToggleMyDay}
          className={clsx("h-11 justify-start rounded-xl px-3", item.isInMyDay && "text-(--ctx)")}
          data-testid="shopping-item-editor__my-day"
        >
          <SunIcon className="size-[18px]" />
          {item.isInMyDay
            ? intl.formatMessage({
                description: "ShoppingItemEditor - button taking the item's task out of My Day",
                defaultMessage: "In My Day · remove",
                id: "G1sxyQ",
              })
            : intl.formatMessage({
                description: "ShoppingItemEditor - button making the item a task in My Day",
                defaultMessage: "Add to My Day",
                id: "4Jmgfa",
              })}
        </Button>
      )}

      <div className="grid grid-cols-2 items-start gap-2.5">
        <TextField
          value={drafts.qty}
          onChange={drafts.setQty}
          isInvalid={drafts.isQtyInvalid}
          className="flex min-w-0 flex-col gap-1"
        >
          <Label className={FIELD_LABEL_CLASS}>
            {intl.formatMessage({
              description: "ShoppingItemEditor - label of the quantity field",
              defaultMessage: "Quantity",
              id: "AUmb6k",
            })}
          </Label>
          <Input
            inputMode="numeric"
            placeholder="1"
            onBlur={drafts.commitQty}
            onKeyDown={blurOnEnter}
            data-testid="shopping-item-editor__qty"
          />
          <FieldError>
            {intl.formatMessage({
              description: "ShoppingItemEditor - error shown when the quantity isn't a whole number of at least one",
              defaultMessage: "Enter a whole number, 1 or more.",
              id: "bwdlm7",
            })}
          </FieldError>
        </TextField>

        <TextField
          value={drafts.price}
          onChange={drafts.setPrice}
          isInvalid={drafts.isPriceInvalid}
          className="flex min-w-0 flex-col gap-1"
        >
          <Label className={FIELD_LABEL_CLASS}>
            {intl.formatMessage({
              description: "ShoppingItemEditor - label of the field with the price of one piece, in Swedish kronor",
              defaultMessage: "Price per piece (kr)",
              id: "Ql3QOb",
            })}
          </Label>
          <Input
            inputMode="decimal"
            onBlur={drafts.commitPrice}
            onKeyDown={blurOnEnter}
            data-testid="shopping-item-editor__price"
          />
          <FieldError>
            {intl.formatMessage({
              description: "ShoppingItemEditor - error shown when the price isn't a number",
              defaultMessage: "Enter a price, like 25 or 25,50.",
              id: "HZYlTU",
            })}
          </FieldError>
        </TextField>
      </div>

      {showCategory && (
        <Select
          value={item.category}
          onChange={(key) => key && onChange({ category: key as ShoppingCategory })}
          className="flex min-w-0 flex-col gap-1"
          data-testid="shopping-item-editor__category"
        >
          <Label className={FIELD_LABEL_CLASS}>
            {intl.formatMessage({
              description: "ShoppingItemEditor - label of the store section picker",
              defaultMessage: "Store section",
              id: "GkWYTr",
            })}
          </Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {SHOPPING_CATEGORIES.map((category) => {
                const label = getShoppingCategoryLabel(intl, category);
                return (
                  <ListBox.Item key={category} id={category} textValue={label}>
                    {label}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                );
              })}
            </ListBox>
          </Select.Popover>
        </Select>
      )}

      <TextField
        value={drafts.link}
        onChange={drafts.setLink}
        isInvalid={drafts.isLinkInvalid}
        className="flex flex-col gap-1"
      >
        <Label className={FIELD_LABEL_CLASS}>
          {intl.formatMessage({
            description: "ShoppingItemEditor - label of the field with a link to the product",
            defaultMessage: "Link",
            id: "ZzdKBq",
          })}
        </Label>
        <Input
          type="url"
          placeholder="https://"
          onBlur={drafts.commitLink}
          onKeyDown={blurOnEnter}
          data-testid="shopping-item-editor__link"
        />
        <FieldError>
          {intl.formatMessage({
            description: "ShoppingItemEditor - error shown when the link isn't an http(s) URL or www. address",
            defaultMessage: "Links must start with http://, https:// or www.",
            id: "HObkou",
          })}
        </FieldError>
      </TextField>

      <TextField value={drafts.note} onChange={drafts.setNote} className="flex flex-col gap-1">
        <Label className={FIELD_LABEL_CLASS}>
          {intl.formatMessage({
            description: "ShoppingItemEditor - label of the note field",
            defaultMessage: "Note",
            id: "9NMowQ",
          })}
        </Label>
        <TextArea
          rows={4}
          placeholder={intl.formatMessage({
            description: "ShoppingItemEditor - placeholder of the note field",
            defaultMessage: "Add a note",
            id: "n4wuc5",
          })}
          onBlur={drafts.commitNote}
          className="resize-y leading-relaxed"
          data-testid="shopping-item-editor__note"
        />
      </TextField>

      <div className="border-separator text-muted mt-auto flex items-center gap-2 border-t pt-2.5 text-xs">
        <span className="min-w-0 flex-1 truncate">
          {intl.formatMessage({
            description: "ShoppingItemEditor - footer saying changes save on their own",
            defaultMessage: "Saved automatically",
            id: "2K0dw9",
          })}
        </span>
        <Button variant="danger-soft" size="sm" onPress={onRemove} data-testid="shopping-item-editor__remove">
          {intl.formatMessage({
            description: "ShoppingItemEditor - button removing the item from the list",
            defaultMessage: "Remove item",
            id: "dEbSTX",
          })}
        </Button>
      </div>
    </div>
  );
}
