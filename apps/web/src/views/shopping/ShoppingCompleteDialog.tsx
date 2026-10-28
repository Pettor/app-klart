import type { ReactElement } from "react";
import { Button, ListBox, Select } from "@heroui/react";
import { useIntl } from "react-intl";
import type { ShoppingMoveTarget } from "./ShoppingTypes";

const MAX_NAMES = 4;

export interface ShoppingCompleteDialogProps {
  leftNames: string[];
  moveTargets: ShoppingMoveTarget[];
  moveTarget: string | null;
  onMoveTargetChange: (listId: string) => void;
  onMove: () => void;
  onCompleteAnyway: () => void;
  onCancel: () => void;
}

/** Asked when completing a list with items left: move them to another list, or complete anyway. */
export function ShoppingCompleteDialog({
  leftNames,
  moveTargets,
  moveTarget,
  onMoveTargetChange,
  onMove,
  onCompleteAnyway,
  onCancel,
}: ShoppingCompleteDialogProps): ReactElement {
  const intl = useIntl();
  const shown = leftNames.slice(0, MAX_NAMES).join(", ");
  const more = leftNames.length - MAX_NAMES;

  return (
    <section
      role="dialog"
      aria-labelledby="shopping-complete-heading"
      className="bg-surface border-separator settings-pane-in flex flex-col gap-3.5 rounded-2xl border p-[18px] shadow-xl"
      data-testid="shopping__complete-dialog"
    >
      <div className="flex flex-col gap-1">
        <span id="shopping-complete-heading" className="text-base font-semibold">
          {intl.formatMessage(
            {
              description: "ShoppingCompleteDialog - heading: how many items aren't bought",
              defaultMessage: "{count} not bought yet",
              id: "KYL7XL",
            },
            { count: leftNames.length }
          )}
        </span>
        <span className="text-muted text-[13px]">
          {more > 0
            ? intl.formatMessage(
                {
                  description: "ShoppingCompleteDialog - the first few items left, and how many more",
                  defaultMessage: "{names} and {more} more",
                  id: "kmUHEm",
                },
                { names: shown, more }
              )
            : shown}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {moveTargets.length > 0 && (
          <>
            <Button onPress={onMove} data-testid="shopping__complete-move">
              {intl.formatMessage({
                description: "ShoppingCompleteDialog - button moving the items left to the list picked next to it",
                defaultMessage: "Move them to",
                id: "Ni2G0N",
              })}
            </Button>
            <Select
              aria-label={intl.formatMessage({
                description: "ShoppingCompleteDialog - aria-label of the list to move the items left to",
                defaultMessage: "Move to list",
                id: "xHXOmg",
              })}
              value={moveTarget}
              onChange={(key) => key && onMoveTargetChange(String(key))}
              className="w-48"
            >
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {moveTargets.map((target) => (
                    <ListBox.Item key={target.id} id={target.id} textValue={target.name}>
                      {target.name}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </>
        )}
        <span className="flex-1" />
        <Button variant="secondary" onPress={onCompleteAnyway} data-testid="shopping__complete-anyway">
          {intl.formatMessage({
            description: "ShoppingCompleteDialog - button completing the list and leaving the items not bought on it",
            defaultMessage: "Complete anyway",
            id: "Z7UDvI",
          })}
        </Button>
        <Button variant="ghost" onPress={onCancel} className="text-muted">
          {intl.formatMessage({
            description: "ShoppingCompleteDialog - button closing the dialog without completing",
            defaultMessage: "Cancel",
            id: "Sqh0qD",
          })}
        </Button>
      </div>
    </section>
  );
}
