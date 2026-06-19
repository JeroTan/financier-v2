import { beforeEach, describe, expect, it, vi } from "vitest";

import { getRuntimeEnv } from "@/server/context/bindings";
import { onRequest } from "@/middleware/index";

vi.mock("astro:middleware", () => ({
  defineMiddleware: (handler: unknown) => handler,
}));

vi.mock("@/server/context/bindings", () => ({
  getRuntimeEnv: vi.fn(),
}));

describe("protected page middleware", () => {
  beforeEach(() => {
    vi.mocked(getRuntimeEnv).mockReturnValue({} as ReturnType<typeof getRuntimeEnv>);
  });

  it("returns retryable JSON when D1 binding is unavailable", async () => {
    const context = {
      request: new Request("http://localhost:4333/dashboard", {
        headers: { Cookie: "refreshToken=valid-session" },
      }),
      locals: {},
    };
    const next = vi.fn();

    const response = await onRequest(context as never, next);
    if (!(response instanceof Response)) {
      throw new Error("Expected middleware to return a response");
    }
    const body = await response.json() as { error?: { code?: string; requestId?: string } };

    expect(response.status).toBe(503);
    expect(response.headers.get("Content-Type")).toContain("application/json");
    expect(response.headers.get("X-Request-ID")).toBeTruthy();
    expect(response.headers.get("Location")).toBeNull();
    expect(body.error?.code).toBe("DATABASE_UNAVAILABLE");
    expect(body.error?.requestId).toBe(response.headers.get("X-Request-ID"));
    expect(next).not.toHaveBeenCalled();
  });
});
