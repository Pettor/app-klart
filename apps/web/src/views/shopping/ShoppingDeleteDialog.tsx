import type { ReactElement } from "react";
import { Button } from "@heroui/react";
import { useIntl } from "react-intl";

export interface ShoppingDeleteDialogProps {
  name: string;
  /** How many items go with the list. */
  itemCount: number;
  onDelete: () => void;
  onCancel: () => void;
}

/** Asked before deleting a list, since its items go with it. */
export function ShoppingDeleteDialog({ name, itemCount, onDelete, onCancel }: ShoppingDeleteDialogProps): ReactElement {
  const intl = useIntl();

  return (
    <section
      role="alertdialog"
      aria-labelledby="shopping-delete-heading"
      className="bg-surface border-separator settings-pane-in flex flex-col gap-3.5 rounded-2xl border p-[18px] shadow-xl"
      data-testid="shopping__delete-dialog"
    >
      <div className="flex flex-col gap-1">
        <span id="shopping-delete-heading" className="text-base font-semibold">
          {intl.formatMessage(
            {
              description: "ShoppingDeleteDialog - heading asking whether to delete the list",
              defaultMessage: "Delete “{name}”?",
              id: "dokOih",
            },
            { name }
          )}
        </span>
        <span className="text-muted text-[13px]">
          {intl.formatMessage(
            {
              description: "ShoppingDeleteDialog - what deleting the list also removes",
              defaultMessage:
                "{count, plural, =0 {This can't be undone.} one {Its item goes with it. This can't be undone.} other {Its # items go with it. This can't be undone.}}",
              id: "dIV2SG",
            },
            { count: itemCount }
          )}
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="ghost" onPress={onCancel} className="text-muted">
          {intl.formatMessage({
            description: "ShoppingDeleteDialog - button closing the dialog without deleting",
            defaultMessage: "Cancel",
            id: "YbzCAQ",
          })}
        </Button>
        <Button variant="danger" onPress={onDelete} data-testid="shopping__delete-confirm">
          {intl.formatMessage({
            description: "ShoppingDeleteDialog - button deleting the list",
            defaultMessage: "Delete list",
            id: "1CN5qg",
          })}
        </Button>
      </div>
    </section>
  );
}
