import { describe, expect, it } from "vitest";
import type { Automation } from "./Automations";
import { buildRequest, parseHeaders, requestPath, runnableAutomations } from "./Automations";

const command: Automation = { id: "a", name: "Collect", enabled: true, kind: "command", command: "./collect.sh" };
const webhook: Automation = { id: "b", name: "Hook", enabled: true, kind: "webhook", url: "https://example.com" };
const request: Automation = { id: "c", name: "Collect work tasks!", enabled: true, kind: "request" };

describe("runnableAutomations", () => {
  it("skips disabled ones, empty ones and commands outside the desktop app", () => {
    const disabled = { ...webhook, id: "d", enabled: false };
    const empty = { ...webhook, id: "e", url: " " };
    const all = [command, webhook, request, disabled, empty];
    expect(runnableAutomations(all, true).map((a) => a.id)).toEqual(["a", "b", "c"]);
    expect(runnableAutomations(all, false).map((a) => a.id)).toEqual(["b", "c"]);
  });
});

describe("parseHeaders", () => {
  it("reads Key: value lines and keeps colons in values", () => {
    expect(parseHeaders("Authorization: Bearer x\n\nbad line\nX-Url: https://a")).toEqual({
      Authorization: "Bearer x",
      "X-Url": "https://a",
    });
  });
});

describe("request files", () => {
  it("names the file after the time and automation", () => {
    const file = buildRequest(request, "Mac", "2026-11-05T08:15:00Z");
    expect(file).toEqual({
      schema: "klart.request/v1",
      automation: "Collect work tasks!",
      requestedAt: "2026-11-05T08:15:00Z",
      device: "Mac",
    });
    expect(requestPath(file)).toBe("requests/2026-11-05T081500Z-collect-work-tasks.json");
  });
});
