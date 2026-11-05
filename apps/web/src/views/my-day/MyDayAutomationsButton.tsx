import type { ReactElement } from "react";
import { ChevronDownIcon, PlayIcon } from "@heroicons/react/24/outline";
import { Button, Dropdown, Label, Spinner } from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";

export interface MyDayAutomationsProps {
  items: { id: string; name: string }[];
  isRunning: boolean;
  onRunAll: () => void;
  onRun: (id: string) => void;
}

export interface MyDayAutomationsButtonProps {
  automations: MyDayAutomationsProps;
  /** The header's button style. */
  className: string;
}

/** Runs every automation; with several, a menu beside it runs one. */
export function MyDayAutomationsButton({ automations, className }: MyDayAutomationsButtonProps): ReactElement {
  const intl = useIntl();
  const { items, isRunning, onRunAll, onRun } = automations;
  const single = items.length === 1 ? items[0] : undefined;

  return (
    <div className="flex">
      <Button
        variant="ghost"
        onPress={onRunAll}
        isDisabled={isRunning}
        className={clsx(className, !single && "rounded-r-none")}
        data-testid="my-day__run-automations"
        aria-label={intl.formatMessage(
          {
            description: "MyDayAutomationsButton - aria-label of the button running the automations",
            defaultMessage: "{name, select, all {Run all automations} other {Run {name}}}",
            id: "zmUE6t",
          },
          { name: single?.name ?? "all" }
        )}
      >
        {isRunning ? <Spinner size="sm" /> : <PlayIcon className="size-4" aria-hidden />}
        <span className="max-sm:hidden">
          {intl.formatMessage({
            description: "MyDayAutomationsButton - label of the button running the automations",
            defaultMessage: "Run",
            id: "70CyM/",
          })}
        </span>
      </Button>
      {!single && (
        <Dropdown>
          <Button
            isIconOnly
            variant="ghost"
            isDisabled={isRunning}
            className={clsx(className, "w-7 rounded-l-none border-l border-black/10 px-0 dark:border-white/10")}
            data-testid="my-day__automations-menu"
            aria-label={intl.formatMessage({
              description: "MyDayAutomationsButton - aria-label of the menu running one automation",
              defaultMessage: "Run one automation",
              id: "O+SdXC",
            })}
          >
            <ChevronDownIcon className="size-3.5" />
          </Button>
          <Dropdown.Popover>
            <Dropdown.Menu onAction={(key) => onRun(String(key))}>
              {items.map((item) => (
                <Dropdown.Item key={item.id} id={item.id} textValue={item.name}>
                  <Label>{item.name}</Label>
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      )}
    </div>
  );
}
