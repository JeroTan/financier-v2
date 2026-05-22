import { afterEach, describe, expect, it, vi } from "vitest";

import {
  AuthRequestError,
  getAuthErrorMessage,
  getOAuthErrorMessage,
  submitEmailAuth,
} from "./authClient";

describe("auth client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("submits login with JSON fetch so auth appears in browser network tools", async () => {
    const fetchMock = vi.fn(async (_input: string, _init?: RequestInit) => new Response(
      JSON.stringify({
        success: true,
        data: {
          userId: "user-1",
          email: "test@example.com",
          accessToken: "access-token",
          refreshToken: "refresh-token",
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    ));
    vi.stubGlobal("fetch", fetchMock);

    const result = await submitEmailAuth("/api/auth/login", {
      email: "test@example.com",
      password: "password123",
    });

    expect(result.accessToken).toBe("access-token");
    expect(fetchMock).toHaveBeenCalledOnce();

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/auth/login");
    expect(init?.method).toBe("POST");
    expect(init?.credentials).toBe("same-origin");
    expect(init?.headers).toEqual({
      Accept: "application/json",
      "Content-Type": "application/json",
    });
    expect(JSON.parse(String(init?.body))).toEqual({
      email: "test@example.com",
      password: "password123",
    });
  });

  it("throws API error codes for inline auth display", async () => {
    const fetchMock = vi.fn(async (_input: string, _init?: RequestInit) => new Response(
      JSON.stringify({
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
        },
      }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    ));
    vi.stubGlobal("fetch", fetchMock);

    await expect(submitEmailAuth("/api/auth/login", {
      email: "test@example.com",
      password: "wrong-password",
    })).rejects.toMatchObject({
      code: "INVALID_CREDENTIALS",
      status: 401,
    } satisfies Partial<AuthRequestError>);

    expect(getAuthErrorMessage("INVALID_CREDENTIALS")).toBe("Invalid email or password.");
  });

  it("maps Google callback errors to safe auth page copy", () => {
    expect(getOAuthErrorMessage("access_denied")).toBe("Google sign-in was cancelled.");
    expect(getOAuthErrorMessage("GOOGLE_TOKEN_EXCHANGE_FAILED")).toBe("Google sign-in failed. Please try again.");
  });
});
