import type { APIContext } from "astro";
import { UserRepository } from "@/server/repositories/userRepository";
import { getRuntimeEnv } from "@/server/context/bindings";
import { authMiddleware } from "@/server/middleware/auth";
import { getClearRefreshTokenCookie } from "@/server/auth/tokens";
import { errorResponse, jsonResponse } from "@/server/auth/utils";
import "./routes";

export const POST = async (context: APIContext) => {
  const request = context.request;
  const env = getRuntimeEnv();
  const auth = await authMiddleware(request, env);
  if (!auth.authenticated) return errorResponse("UNAUTHORIZED", auth.error, auth.status);

  const refreshToken = request.headers.get("Cookie")?.match(/refreshToken=([^;]+)/)?.[1];
  const tokenRevocation = env.TOKEN_REVOCATION;
  if (refreshToken && tokenRevocation) {
    await tokenRevocation.put(refreshToken, "revoked", { expirationTtl: 604800 });
  }
  const db = env.DB;
  if (db) {
    const userRepo = new UserRepository(db);
    await userRepo.updateRefreshToken(auth.context.userId, "");
  }

  return jsonResponse({ success: true }, 200, { "Set-Cookie": getClearRefreshTokenCookie(env) });
};
