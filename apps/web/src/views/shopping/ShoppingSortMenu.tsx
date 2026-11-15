import type { ReactElement } from "react";
import { ArrowsUpDownIcon } from "@heroicons/react/24/outline";
import { Button, Dropdown, Label } from "@heroui/react";
import clsx from "clsx";
import type { ShoppingSortProps } from "./ShoppingTypes";

export interface ShoppingSortMenuProps<T extends string> {
  sort: ShoppingSortProps<T>;
  getLabel: (sort: T) => string;
  ariaLabel: string;
  testId: string;
  className?: string;
}

/** An icon button opening the sort choices, with the current one checked. */
export function ShoppingSortMenu<T extends string>({
  sort,
  getLabel,
  ariaLabel,
  testId,
  className,
}: ShoppingSortMenuProps<T>): ReactElement {
  return (
    <Dropdown>
      <Button
        isIconOnly
        variant="ghost"
        aria-label={ariaLabel}
        data-testid={testId}
        className={clsx("text-muted rounded-[10px]", className)}
      >
        <ArrowsUpDownIcon className="size-[18px]" />
      </Button>
      <Dropdown.Popover className="min-w-44">
        <Dropdown.Menu
          aria-label={ariaLabel}
          selectionMode="single"
          selectedKeys={new Set([sort.value])}
          onSelectionChange={(keys) => {
            const [key] = keys === "all" ? [] : [...keys];
            if (key !== undefined && key !== sort.value) {
              sort.onChange(String(key) as T);
            }
          }}
        >
          {sort.options.map((option) => (
            <Dropdown.Item key={option} id={option} textValue={getLabel(option)} data-testid={`${testId}-${option}`}>
              <Label>{getLabel(option)}</Label>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
