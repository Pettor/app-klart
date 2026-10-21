import type { ReactElement, ReactNode } from "react";
import { Button, Disclosure } from "@heroui/react";
import { useIntl } from "react-intl";
import { SettingsPanel, SettingsSectionShell } from "./SettingsSectionShell";
import { SettingsSwitchRow } from "./SettingsSwitchRow";
import type { AgentFileOptions } from "~/core/sync/FolderSync";

export interface SettingsAgentsSectionProps {
  options: AgentFileOptions;
  onChange: (key: keyof AgentFileOptions, value: boolean) => void;
  llmsTxt: string;
}

const SYNTAX: { token: string; id: string }[] = [
  { token: "#acme", id: "tag" },
  { token: "#work #brf", id: "context" },
  { token: "@2026-07-08", id: "due" },
  { token: "^09:00", id: "remind" },
  { token: "!", id: "important" },
];

const FOLDER_TREE = `Klart/
├── LLMS.txt              # rules for agents
├── klart.json            # contexts
├── tasks/<context>/<id>.json
├── days/YYYY-MM-DD.json  # what's in My Day
├── views/                # generated, read-only
│   ├── today.json
│   └── suggestions.json
├── inbox/                # drop files to add tasks
├── devices/<name>/
└── .conflicts/`;

function code(chunks: ReactNode[]): ReactElement {
  return <code className="font-mono">{chunks}</code>;
}

export function SettingsAgentsSection({ options, onChange, llmsTxt }: SettingsAgentsSectionProps): ReactElement {
  const intl = useIntl();

  const syntaxText: Record<string, string> = {
    tag: intl.formatMessage({
      description: "SettingsAgents - syntax table: what #tag does",
      defaultMessage: "Tag. Lowercased, used for grouping, search and suggestion ranking.",
      id: "OLHn46",
    }),
    context: intl.formatMessage({
      description: "SettingsAgents - syntax table: what a context tag does",
      defaultMessage:
        "A tag that names a context also routes the task there. Without one, the current context is used.",
      id: "bBh48K",
    }),
    due: intl.formatMessage({
      description: "SettingsAgents - syntax table: due date tokens",
      defaultMessage: "Due date. Also @today @tomorrow @fri @+3d.",
      id: "72rALV",
    }),
    remind: intl.formatMessage({
      description: "SettingsAgents - syntax table: reminder tokens",
      defaultMessage: "Reminder, on the due date (or today). Also ^fri-09:00 ^2026-11-02T09:00.",
      id: "RTw5Ic",
    }),
    important: intl.formatMessage({
      description: "SettingsAgents - syntax table: important marker",
      defaultMessage: "Important (star). Everything else is the title.",
      id: "r5pkGI",
    }),
  };

  return (
    <SettingsSectionShell
      id="agents"
      title={intl.formatMessage({
        description: "SettingsAgents - section heading",
        defaultMessage: "Agents & files",
        id: "vl1Ffz",
      })}
      description={intl.formatMessage({
        description: "SettingsAgents - section intro",
        defaultMessage:
          "Agents and scripts read and write the same JSON files. Klart reloads within seconds when a file changes.",
        id: "HtKmF4",
      })}
    >
      <SettingsPanel>
        <SettingsSwitchRow
          label={intl.formatMessage(
            {
              description: "SettingsAgents - toggle writing generated view files",
              defaultMessage:
                "Write <code>views/today.json</code> and <code>views/suggestions.json</code> on every change",
              id: "zmT9pN",
            },
            { code }
          )}
          isSelected={options.writeViews}
          onChange={(value) => onChange("writeViews", value)}
        />
        <SettingsSwitchRow
          label={intl.formatMessage(
            {
              description: "SettingsAgents - toggle accepting inbox files",
              defaultMessage:
                "Accept tasks dropped into <code>inbox/</code> (one JSON task or quick-add lines per file)",
              id: "CdRFH4",
            },
            { code }
          )}
          isSelected={options.acceptInbox}
          onChange={(value) => onChange("acceptInbox", value)}
        />
        <SettingsSwitchRow
          label={intl.formatMessage(
            {
              description: "SettingsAgents - toggle keeping LLMS.txt",
              defaultMessage: "Keep <code>LLMS.txt</code> up to date in the data folder",
              id: "9nB1zD",
            },
            { code }
          )}
          isSelected={options.keepLlmsTxt}
          onChange={(value) => onChange("keepLlmsTxt", value)}
        />
      </SettingsPanel>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] gap-4">
        <div className="border-border flex flex-col overflow-hidden rounded-xl border">
          <div className="bg-surface-secondary text-foreground/80 grid grid-cols-[120px_minmax(0,1fr)] gap-3 px-3.5 py-2.5 text-xs font-semibold">
            <span>
              {intl.formatMessage({
                description: "SettingsAgents - syntax table column",
                defaultMessage: "Token",
                id: "TLRpxX",
              })}
            </span>
            <span>
              {intl.formatMessage({
                description: "SettingsAgents - syntax table column",
                defaultMessage: "Becomes",
                id: "rtRvw9",
              })}
            </span>
          </div>
          {SYNTAX.map((row) => (
            <div
              key={row.id}
              className="border-border grid grid-cols-[120px_minmax(0,1fr)] gap-3 border-t px-3.5 py-3 text-[13px]"
            >
              <code className="font-mono text-(--tag)">{row.token}</code>
              <span>{syntaxText[row.id]}</span>
            </div>
          ))}
        </div>
        <pre
          tabIndex={0}
          className="overflow-x-auto rounded-xl border border-[#2f3035] bg-[#111214] p-4 font-mono text-xs leading-relaxed text-[#d6d8dc]"
        >
          {FOLDER_TREE}
        </pre>
      </div>

      <Disclosure>
        <Disclosure.Heading>
          <Button slot="trigger" variant="ghost" className="px-2 font-semibold">
            {intl.formatMessage({
              description: "SettingsAgents - expands the LLMS.txt preview",
              defaultMessage: "Show LLMS.txt",
              id: "VfsaDN",
            })}
            <Disclosure.Indicator />
          </Button>
        </Disclosure.Heading>
        <Disclosure.Content>
          <Disclosure.Body>
            <pre
              tabIndex={0}
              className="mt-2 overflow-x-auto rounded-xl border border-[#2f3035] bg-[#111214] p-5 font-mono text-xs leading-relaxed whitespace-pre-wrap text-[#e4e6ea]"
            >
              {llmsTxt}
            </pre>
          </Disclosure.Body>
        </Disclosure.Content>
      </Disclosure>
    </SettingsSectionShell>
  );
}
