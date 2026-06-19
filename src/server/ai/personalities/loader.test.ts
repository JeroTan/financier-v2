import { describe, expect, it } from "vitest";

import { loadPersonalityPrompt } from "@/server/ai/personalities/loader";

describe("loadPersonalityPrompt", () => {
  it("loads a bundled named personality", async () => {
    const prompt = await loadPersonalityPrompt("influencer");

    expect(prompt.length).toBeGreaterThan(20);
    expect(prompt).not.toContain("helpful AI assistant. Respond in a normal");
  });

  it("falls back to bundled default for unknown personalities", async () => {
    const prompt = await loadPersonalityPrompt("missing-personality");
    const defaultPrompt = await loadPersonalityPrompt("default");

    expect(prompt).toBe(defaultPrompt);
  });
});
