/** What an automation does when run: a shell command (desktop app only), a webhook, or a request file in the sync. */
export type AutomationKind = "command" | "webhook" | "request";

export interface Automation {
  id: string;
  name: string;
  enabled: boolean;
  kind: AutomationKind;
  /** `command`: run in the user's login shell, in the primary sync's folder when it has one. */
  command?: string;
  /** `webhook`: receives a POST with a small JSON body. */
  url?: string;
  /** `webhook`: extra headers, one `Key: value` per line (e.g. an `Authorization` token). */
  headers?: string;
}

export interface AutomationSettings {
  /** Shows the Run button in My Day. */
  showButton: boolean;
  automations: Automation[];
}

export const DEFAULT_AUTOMATION_SETTINGS: AutomationSettings = { showButton: false, automations: [] };

export interface AutomationRequest {
  schema: "klart.request/v1";
  automation: string;
  requestedAt: string;
  device: string;
}

/** The enabled automations that can run here: shell commands need the desktop app. */
export function runnableAutomations(automations: Automation[], isDesktop: boolean): Automation[] {
  return automations.filter(
    (automation) => automation.enabled && (automation.kind !== "command" || isDesktop) && hasTarget(automation)
  );
}

function hasTarget(automation: Automation): boolean {
  switch (automation.kind) {
    case "command":
      return Boolean(automation.command?.trim());
    case "webhook":
      return Boolean(automation.url?.trim());
    case "request":
      return true;
  }
}

/** `Key: value` lines to headers; lines without a colon are skipped. */
export function parseHeaders(text: string | undefined): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const line of (text ?? "").split("\n")) {
    const colon = line.indexOf(":");
    const key = line.slice(0, colon).trim();
    if (colon > 0 && key) {
      headers[key] = line.slice(colon + 1).trim();
    }
  }
  return headers;
}

export function buildRequest(automation: Automation, device: string, requestedAt: string): AutomationRequest {
  return { schema: "klart.request/v1", automation: automation.name, requestedAt, device };
}

/** `requests/2026-11-05T081500Z-collect-work-tasks.json`; unique per run, sorts by time. */
export function requestPath(request: AutomationRequest): string {
  const slug = request.automation
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `requests/${request.requestedAt.replace(/[:.]/g, "")}-${slug || "request"}.json`;
}
