import { afterEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "./client";

describe("apiClient database errors", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("preserves status, code, and request ID", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            code: "DATABASE_UNAVAILABLE",
            message: "Database temporarily unavailable. Please retry.",
          },
        }),
        {
          status: 503,
          headers: {
            "Content-Type": "application/json",
            "X-Request-ID": "request-123",
          },
        },
      ),
    ));

    await expect(apiClient.get("/stats")).rejects.toMatchObject({
      code: "DATABASE_UNAVAILABLE",
      status: 503,
      requestId: "request-123",
    });
  });

  it("retains status and request ID for non-JSON failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response("Service unavailable", {
        status: 503,
        statusText: "Service Unavailable",
        headers: { "X-Request-ID": "request-456" },
      }),
    ));

    await expect(apiClient.get("/stats")).rejects.toMatchObject({
      code: "HTTP_ERROR",
      status: 503,
      requestId: "request-456",
    });
  });
});
