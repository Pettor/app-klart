import { describe, expect, it } from "vitest";
import { isNewerDataVersion, toDataVersion } from "./DataVersion";

describe("DataVersion", () => {
  it("keeps only major and minor", () => {
    expect(toDataVersion("0.7.3")).toBe("0.7");
    expect(toDataVersion("1.12.0-beta.1")).toBe("1.12");
  });

  it("compares numerically and ignores patch releases", () => {
    expect(isNewerDataVersion("0.10", "0.9")).toBe(true);
    expect(isNewerDataVersion("1.0", "0.99")).toBe(true);
    expect(isNewerDataVersion("0.7.5", "0.7.0")).toBe(false);
    expect(isNewerDataVersion("0.7", "0.8")).toBe(false);
  });
});
