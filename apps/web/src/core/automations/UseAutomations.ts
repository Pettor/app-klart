import { toast } from "@heroui/react";
import { useAtom, useAtomValue, useSetAtom, useStore } from "jotai";
import { useIntl } from "react-intl";
import { automationSettingsAtom, automationsRunningAtom, pendingRequestsAtom } from "./AutomationAtoms";
import type { Automation, AutomationSettings } from "./Automations";
import { buildRequest, parseHeaders, runnableAutomations } from "./Automations";
import { desktop, isDesktop } from "~/core/platform/Desktop";
import { syncRequestAtom, syncSettingsAtom, syncSetupAtom, syncStatusesAtom } from "~/core/sync/SyncAtoms";
import { todayAtom } from "~/core/tasks/KlartAtoms";
import { toUtcTimestamp } from "~/core/tasks/LocalDate";

export interface UseAutomationsResult {
  settings: AutomationSettings;
  setSettings: (change: (current: AutomationSettings) => AutomationSettings) => void;
  /** What the Run button runs: enabled automations that work on this platform. */
  runnable: Automation[];
  isRunning: boolean;
  runAll: () => void;
  run: (id: string) => void;
}

export function useAutomations(): UseAutomationsResult {
  const intl = useIntl();
  const store = useStore();
  const [settings, setSettings] = useAtom(automationSettingsAtom);
  const [isRunning, setRunning] = useAtom(automationsRunningAtom);
  const setPendingRequests = useSetAtom(pendingRequestsAtom);
  const setSyncRequest = useSetAtom(syncRequestAtom);
  const setup = useAtomValue(syncSetupAtom);
  const runnable = runnableAutomations(settings.automations, isDesktop());

  async function runOne(automation: Automation): Promise<void> {
    const device = store.get(syncSettingsAtom).deviceName;
    switch (automation.kind) {
      case "command": {
        const primary = setup.targets[0];
        const cwd = primary ? (store.get(syncStatusesAtom)[primary.id]?.location ?? null) : null;
        const output = await desktop.runCommand(automation.command ?? "", cwd);
        if (output.code !== 0) {
          throw new Error(output.stderr || output.stdout || `exit code ${output.code ?? "?"}`);
        }
        return;
      }
      case "webhook": {
        const response = await fetch(automation.url ?? "", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...parseHeaders(automation.headers) },
          body: JSON.stringify({
            source: "klart",
            automation: automation.name,
            date: store.get(todayAtom),
            device,
          }),
        });
        if (!response.ok) {
          throw new Error(`${response.status} ${response.statusText}`);
        }
        return;
      }
      case "request": {
        if (setup.targets.length === 0) {
          throw new Error(
            intl.formatMessage({
              description: "Automations - error: a request file needs a sync to be written to",
              defaultMessage: "Set up a sync first; the request file is written to its folder.",
              id: "iSgtvY",
            })
          );
        }
        setPendingRequests((pending) => [...pending, buildRequest(automation, device, toUtcTimestamp(new Date()))]);
        return;
      }
    }
  }

  async function runMany(automations: Automation[]): Promise<void> {
    if (isRunning || automations.length === 0) {
      return;
    }
    setRunning(true);
    try {
      const results = await Promise.allSettled(automations.map(runOne));
      // Scripts usually write tasks into the folder, and request files need a push: sync now either way.
      setSyncRequest((count) => count + 1);
      const failures = results.flatMap((result, index) =>
        result.status === "rejected" ? [{ name: automations[index]!.name, error: describeError(result.reason) }] : []
      );
      if (failures.length === 0) {
        toast(
          intl.formatMessage(
            {
              description: "Automations - toast after every automation ran",
              defaultMessage: "{count, plural, one {Automation ran} other {# automations ran}}",
              id: "oL2/Rn",
            },
            { count: automations.length }
          ),
          { variant: "success" }
        );
      } else {
        toast(
          intl.formatMessage(
            {
              description: "Automations - toast when some automations failed",
              defaultMessage: "{count, plural, one {An automation failed} other {# automations failed}}",
              id: "vYXMsn",
            },
            { count: failures.length }
          ),
          {
            variant: "danger",
            timeout: 0,
            description: failures.map((failure) => `${failure.name}: ${failure.error}`).join("\n"),
          }
        );
      }
    } finally {
      setRunning(false);
    }
  }

  return {
    settings,
    setSettings,
    runnable,
    isRunning,
    runAll: () => void runMany(runnable),
    run: (id) => void runMany(runnable.filter((automation) => automation.id === id)),
  };
}

/** The last line of the error, which is usually the useful one for a script. */
function describeError(error: unknown): string {
  const text = error instanceof Error ? error.message : String(error);
  return text.trim().split("\n").at(-1)?.slice(0, 200) ?? text;
}
