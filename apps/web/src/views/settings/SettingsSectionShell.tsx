import type { ReactElement, ReactNode } from "react";

export interface SettingsSectionShellProps {
  id: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
}

/** Heading, intro and body shared by every settings section. */
export function SettingsSectionShell({ id, title, description, children }: SettingsSectionShellProps): ReactElement {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="flex scroll-mt-6 flex-col gap-3.5">
      <div className="flex flex-col gap-1">
        {/* Settings shows one section at a time, so its heading is the page's. */}
        <h1 id={`${id}-heading`} className="text-[26px] font-bold tracking-tight">
          {title}
        </h1>
        {description && <p className="text-muted leading-relaxed">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export interface SettingsPanelProps {
  children: ReactNode;
  className?: string;
}

/** A rounded group of rows inside a section. */
export function SettingsPanel({ children, className }: SettingsPanelProps): ReactElement {
  return (
    <div className={`bg-surface divide-separator flex flex-col divide-y overflow-hidden rounded-xl ${className ?? ""}`}>
      {children}
    </div>
  );
}
