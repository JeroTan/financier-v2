import { describe, expect, it } from "vitest";

import { getClearRefreshTokenCookie, getRefreshTokenCookie } from "./tokens";

describe("auth refresh token cookies", () => {
  it("uses Lax same-site policy so Google OAuth can finish top-level redirects", () => {
    const cookie = getRefreshTokenCookie("refresh-token", { CLOUDFLARE_ENV: "development" });

    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).not.toContain("SameSite=Strict");
  });

  it("keeps Secure enabled for production cookies", () => {
    const cookie = getRefreshTokenCookie("refresh-token", { CLOUDFLARE_ENV: "production" });
    const clearCookie = getClearRefreshTokenCookie({ CLOUDFLARE_ENV: "production" });

    expect(cookie).toContain("; Secure");
    expect(clearCookie).toContain("; Secure");
  });
});
