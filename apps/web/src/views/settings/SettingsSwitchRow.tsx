import type { ReactElement, ReactNode } from "react";
import { Description, Label, Switch } from "@heroui/react";

export interface SettingsSwitchRowProps {
  label: ReactNode;
  description?: ReactNode;
  isSelected: boolean;
  onChange: (isSelected: boolean) => void;
  /** Extra controls (e.g. a time field) shown before the switch. */
  children?: ReactNode;
  testId?: string;
}

export function SettingsSwitchRow({
  label,
  description,
  isSelected,
  onChange,
  children,
  testId,
}: SettingsSwitchRowProps): ReactElement {
  return (
    <div className="flex flex-wrap items-center gap-3 px-[18px] py-3.5">
      <Switch isSelected={isSelected} onChange={onChange} className="min-w-0 flex-1" data-testid={testId}>
        <Switch.Content className="flex w-full flex-row-reverse items-center justify-between gap-3">
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          <span className="flex min-w-0 flex-col gap-0.5">
            <Label className="font-normal">{label}</Label>
            {description && <Description className="text-xs">{description}</Description>}
          </span>
        </Switch.Content>
      </Switch>
      {children}
    </div>
  );
}
