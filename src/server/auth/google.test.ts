import { afterEach, describe, expect, it, vi } from "vitest";

import type { User } from "@/db/schema";
import { handleGoogleCallback } from "@/server/auth/google";
import type { UserRepository } from "@/server/repositories/userRepository";

const googleUser: User = {
  id: "user-google",
  email: "linked@example.test",
  passwordHash: null,
  passwordSalt: null,
  googleId: "google-linked",
  refreshToken: null,
  personality: "default",
  theme: "light",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("handleGoogleCallback", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("reuses a user found by Google ID", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "google-access" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        id: googleUser.googleId,
        email: googleUser.email,
        verified_email: true,
        name: "Linked User",
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }));
    vi.stubGlobal("fetch", fetchMock);

    const userRepo = {
      findByGoogleId: vi.fn().mockResolvedValue(googleUser),
      findByEmail: vi.fn(),
      linkGoogle: vi.fn(),
      create: vi.fn(),
      updateRefreshToken: vi.fn().mockImplementation(async (_id: string, refreshToken: string) => ({
        ...googleUser,
        refreshToken,
      })),
    };

    const result = await handleGoogleCallback(
      {
        clientId: "client-id",
        clientSecret: "client-secret",
        redirectUri: "http://localhost:4333/api/auth/google/callback",
      },
      userRepo as unknown as UserRepository,
      { CLOUDFLARE_ENV: "development", JWT_SECRET: "test-secret" },
      "authorization-code",
    );

    expect(result.error).toBeNull();
    expect(result.data?.redirectUrl).toBe("/dashboard?auth=success");
    expect(result.data?.setCookie).toContain("refreshToken=");
    expect(userRepo.findByGoogleId).toHaveBeenCalledWith("google-linked");
    expect(userRepo.findByEmail).not.toHaveBeenCalled();
    expect(userRepo.linkGoogle).not.toHaveBeenCalled();
    expect(userRepo.create).not.toHaveBeenCalled();
    expect(userRepo.updateRefreshToken).toHaveBeenCalledWith("user-google", expect.any(String));
  });
});
