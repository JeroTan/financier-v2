import { describe, expect, it } from "vitest";
import { buildRuntimeContext } from "./chatService";

describe("buildRuntimeContext", () => {
  it("uses browser timezone for relative date context", () => {
    const context = buildRuntimeContext(
      new Date("2026-06-22T16:30:00.000Z"),
      "Asia/Manila",
    );

    expect(context).toContain("User timezone: Asia/Manila");
    expect(context).toContain("User local date: 2026-06-23");
  });

  it("falls back to UTC for invalid timezones", () => {
    expect(buildRuntimeContext(new Date("2026-06-23T00:00:00.000Z"), "Nope/Nowhere"))
      .toContain("User timezone: UTC");
  });
});
