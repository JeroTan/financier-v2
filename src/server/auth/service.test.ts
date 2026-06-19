import { describe, expect, it } from "vitest";

import { hashPassword } from "@/lib/crypto/password";
import type { UserRepository } from "@/server/repositories/userRepository";
import { AuthService } from "./service";

const env = {
  CLOUDFLARE_ENV: "development",
  JWT_SECRET: "test-secret",
};
const pepper = "test-pepper";

function userRepoStub(overrides: Partial<UserRepository>): UserRepository {
  return overrides as UserRepository;
}

describe("AuthService mutation results", () => {
  it("does not report password update success when update matches no row", async () => {
    const credentials = await hashPassword("old-password", pepper, {
      iterations: 1,
      saltBytes: 4,
    });
    const service = new AuthService(userRepoStub({
      findById: async () => ({
        id: "user-1",
        email: "test@example.com",
        passwordHash: credentials.passwordHash,
        passwordSalt: credentials.passwordSalt,
        googleId: null,
        refreshToken: null,
        personality: "default",
        theme: "light",
        createdAt: "2026-06-19T00:00:00.000Z",
        updatedAt: "2026-06-19T00:00:00.000Z",
      }),
      updatePassword: async () => null,
    }), pepper, env);

    const result = await service.changePassword("user-1", "old-password", "new-password");

    expect(result).toEqual({ data: null, error: "USER_NOT_FOUND" });
  });

  it("does not report preference update success when update matches no row", async () => {
    const service = new AuthService(userRepoStub({
      updatePreferences: async () => null,
    }), pepper, env);

    const result = await service.updatePreferences("missing-user", { theme: "dark" });

    expect(result).toEqual({ data: null, error: "USER_NOT_FOUND" });
  });
});
