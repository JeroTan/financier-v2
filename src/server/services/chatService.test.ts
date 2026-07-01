import { describe, expect, it, vi } from "vitest";
import { buildRuntimeContext, chatService } from "./chatService";

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

  it("sends image attachments as vision message content", async () => {
    const run = vi.fn().mockResolvedValue({
      response: "I can see the attached image.",
    });

    const result = await chatService(
      {
        ai: { run } as unknown as Ai,
        userId: "user-1",
        now: new Date("2026-06-23T00:00:00.000Z"),
        timeZone: "Asia/Manila",
      },
      [],
      "Do you know this picture?",
      {
        dataUrl: "data:image/png;base64,aGVsbG8=",
        mediaType: "image/png",
      },
    );

    expect(result.success).toBe(true);
    expect(run).toHaveBeenCalledWith(
      "@cf/moonshotai/kimi-k2.6",
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: "user",
            content: [
              { type: "text", text: "Do you know this picture?" },
              {
                type: "image_url",
                image_url: {
                  url: "data:image/png;base64,aGVsbG8=",
                  detail: "auto",
                },
              },
            ],
          }),
        ]),
      }),
    );
  });
});
