import type { ReactElement, ReactNode } from "react";
import { ToggleButton, ToggleButtonGroup } from "@heroui/react";

export interface SettingsRowProps {
  label: ReactNode;
  description?: ReactNode;
  /** The control on the right: a select, a segmented choice, a button. */
  children: ReactNode;
}

/** A labelled row inside a `SettingsPanel`, with its control on the right. */
export function SettingsRow({ label, description, children }: SettingsRowProps): ReactElement {
  return (
    <div className="flex min-h-[60px] flex-wrap items-center gap-x-4 gap-y-2 px-[18px] py-3">
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-medium">{label}</span>
        {description && <span className="text-muted text-xs leading-relaxed">{description}</span>}
      </span>
      {children}
    </div>
  );
}

export interface SettingsSegmentedOption<T extends string> {
  value: T;
  label: string;
}

export interface SettingsSegmentedProps<T extends string> {
  ariaLabel: string;
  value: T;
  options: SettingsSegmentedOption<T>[];
  onChange: (value: T) => void;
  testId?: string;
}

/** A segmented single choice, like Comfortable | Compact. */
export function SettingsSegmented<T extends string>({
  ariaLabel,
  value,
  options,
  onChange,
  testId,
}: SettingsSegmentedProps<T>): ReactElement {
  return (
    <ToggleButtonGroup
      aria-label={ariaLabel}
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={[value]}
      onSelectionChange={(keys) => {
        const [key] = [...keys];
        if (key !== undefined) {
          onChange(String(key) as T);
        }
      }}
      size="sm"
      data-testid={testId}
    >
      {options.map((option) => (
        <ToggleButton key={option.value} id={option.value} className="px-3 text-[13px]">
          {option.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
