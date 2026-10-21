import { describe, expect, it } from "vitest";
import { completeTag, getTagQuery, matchTags } from "./TagCompletion";

describe("getTagQuery", () => {
  it("returns the tag typed at the end", () => {
    expect(getTagQuery("#")).toBe("");
    expect(getTagQuery("#Ac")).toBe("ac");
    expect(getTagQuery("invoice #ac")).toBe("ac");
  });

  it("returns null when the last word isn't a tag", () => {
    expect(getTagQuery("")).toBeNull();
    expect(getTagQuery("invoice")).toBeNull();
    expect(getTagQuery("#acme ")).toBeNull();
    expect(getTagQuery("a#b")).toBeNull();
  });
});

describe("completeTag", () => {
  it("replaces the tag being typed", () => {
    expect(completeTag("#ac", "acme")).toBe("#acme ");
    expect(completeTag("invoice #", "ekonomi")).toBe("invoice #ekonomi ");
  });
});

describe("matchTags", () => {
  const tags = ["review", "acme", "hem", "team", "release"];

  it("lists prefix matches before other matches", () => {
    expect(matchTags(tags, "re", "#re")).toEqual(["review", "release"]);
    expect(matchTags(tags, "e", "#e")).toEqual(["review", "acme", "hem", "team", "release"]);
    expect(matchTags(tags, "m", "#m")).toEqual(["acme", "hem", "team"]);
  });

  it("leaves out tags already typed", () => {
    expect(matchTags(tags, "", "#acme #")).toEqual(["review", "hem", "team", "release"]);
  });
});
