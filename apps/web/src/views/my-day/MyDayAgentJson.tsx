import type { ReactElement } from "react";
import clsx from "clsx";
import { useIntl } from "react-intl";

export interface MyDayAgentJsonProps {
  json: string;
  className?: string;
}

/** The read-only `views/today.json` agents see, for the visible tasks. */
export function MyDayAgentJson({ json, className }: MyDayAgentJsonProps): ReactElement {
  const intl = useIntl();

  return (
    <section
      aria-label={intl.formatMessage({
        description: "MyDayAgentJson - aria-label of the JSON panel",
        defaultMessage: "Agent JSON for today",
        id: "ZzHbCH",
      })}
      data-testid="my-day__json"
      className={clsx("border-border rounded-xl border bg-[#141518] text-[#cfe2ff]", className)}
    >
      <div className="flex items-center gap-2 border-b border-[#2f3035] px-3.5 py-2.5 text-xs text-[#a7abb3]">
        <code className="font-mono text-[#d6d8dc]">views/today.json</code>
        <span className="ml-auto">
          {intl.formatMessage({
            description: "MyDayAgentJson - note that the file is read-only and documented in LLMS.txt",
            defaultMessage: "read-only view · see LLMS.txt",
            id: "Nw4qIZ",
          })}
        </span>
      </div>
      <pre tabIndex={0} className="max-h-64 overflow-auto p-3.5 font-mono text-xs leading-relaxed">
        {json}
      </pre>
    </section>
  );
}
