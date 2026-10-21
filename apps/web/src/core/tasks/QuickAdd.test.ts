import { describe, expect, it } from "vitest";
import { parseDateToken, parseQuickAdd, parseRemindToken } from "./QuickAdd";
import type { KlartContext } from "~/core/contexts/KlartContext";

// Wednesday
const TODAY = "2026-10-21";

const CONTEXTS: KlartContext[] = [
  { id: "personal", name: "Personal", color: "blue", tag: "personal" },
  { id: "work", name: "Work", color: "orange", tag: "work" },
  { id: "brf", name: "BRF board", color: "green", tag: "brf" },
];

function parse(text: string, currentContext = "personal"): ReturnType<typeof parseQuickAdd> {
  return parseQuickAdd(text, { today: TODAY, contexts: CONTEXTS, currentContext });
}

describe("parseDateToken", () => {
  it.each([
    ["2026-07-08", "2026-07-08"],
    ["today", TODAY],
    ["tomorrow", "2026-10-22"],
    ["tmr", "2026-10-22"],
    ["+3d", "2026-10-24"],
    ["fri", "2026-10-23"],
    ["friday", "2026-10-23"],
    ["mon", "2026-10-26"],
    // Same weekday as today means next week
    ["wed", "2026-10-28"],
  ])("resolves @%s to %s", (token, expected) => {
    expect(parseDateToken(token, TODAY)).toBe(expected);
  });

  it.each(["someday", "fr", "2026-13-40", "month"])("rejects @%s", (token) => {
    expect(parseDateToken(token, TODAY)).toBeNull();
  });
});

describe("parseRemindToken", () => {
  it("uses the due date for a bare time", () => {
    expect(parseRemindToken("09:00", "2026-10-23", TODAY)).toBe("2026-10-23T09:00");
  });

  it("uses today when there's no due date", () => {
    expect(parseRemindToken("9:30", null, TODAY)).toBe("2026-10-21T09:30");
  });

  it("accepts a weekday or full date prefix", () => {
    expect(parseRemindToken("fri-09:00", null, TODAY)).toBe("2026-10-23T09:00");
    expect(parseRemindToken("2026-11-02T09:00", null, TODAY)).toBe("2026-11-02T09:00");
    expect(parseRemindToken("2026-11-02-09:00", null, TODAY)).toBe("2026-11-02T09:00");
  });

  it("rejects invalid times", () => {
    expect(parseRemindToken("25:00", null, TODAY)).toBeNull();
    expect(parseRemindToken("soon", null, TODAY)).toBeNull();
  });
});

describe("parseQuickAdd", () => {
  it("parses the example from LLMS.txt", () => {
    expect(parse("#work #acme @2026-07-08 #team find more tasks to create")).toEqual({
      title: "Find more tasks to create",
      context: "work",
      tags: ["work", "acme", "team"],
      due: "2026-07-08",
      remindAt: null,
      important: false,
      links: [],
      raw: "#work #acme @2026-07-08 #team find more tasks to create",
    });
  });

  it("takes http(s) URLs as links, not title words", () => {
    const parsed = parse("Review https://github.com/acme/pr/1 PR http://example.com https://github.com/acme/pr/1");
    expect(parsed.title).toBe("Review PR");
    expect(parsed.links).toEqual(["https://github.com/acme/pr/1", "http://example.com"]);
  });

  it("takes www. addresses as https links", () => {
    const parsed = parse("Läs www.fz.se nyheter https://www.fz.se www.example.com/a?b=1");
    expect(parsed.title).toBe("Läs nyheter");
    expect(parsed.links).toEqual(["https://www.fz.se", "https://www.example.com/a?b=1"]);
  });

  it("keeps words that only look like www. in the title", () => {
    expect(parse("Fix www. and www.local").links).toEqual([]);
  });

  it("keeps non-web URLs in the title", () => {
    expect(parse("Run javascript:alert(1) ftp://host").links).toEqual([]);
  });

  it("reads tokens anywhere in the line", () => {
    const parsed = parse("Review sync PR ^14:00 #work @today !");
    expect(parsed.title).toBe("Review sync PR");
    expect(parsed.due).toBe(TODAY);
    expect(parsed.remindAt).toBe("2026-10-21T14:00");
    expect(parsed.important).toBe(true);
  });

  it("resolves a bare reminder against a due date typed after it", () => {
    expect(parse("^09:00 call the plumber @fri").remindAt).toBe("2026-10-23T09:00");
  });

  it("uses the current context when no context tag is typed", () => {
    expect(parse("buy milk #köp", "work").context).toBe("work");
  });

  it("falls back to the first context when All contexts is selected", () => {
    expect(parse("buy milk", "all").context).toBe("personal");
  });

  it("routes to the first context tag", () => {
    expect(parse("protokoll #brf #work").context).toBe("brf");
  });

  it("lowercases and de-duplicates tags", () => {
    expect(parse("x #Hem #hem #HEM").tags).toEqual(["hem"]);
  });

  it("keeps unparseable tokens in the title", () => {
    const parsed = parse("meet @someday ^later");
    expect(parsed.title).toBe("Meet @someday ^later");
    expect(parsed.due).toBeNull();
    expect(parsed.remindAt).toBeNull();
  });

  it("returns an empty title for tokens only", () => {
    expect(parse("#work @today").title).toBe("");
  });
});
