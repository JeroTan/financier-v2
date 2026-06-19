import type { APIContext } from "astro";
import { UserRepository } from "@/server/repositories/userRepository";
import { getRuntimeEnv } from "@/server/context/bindings";
import { authMiddleware } from "@/server/middleware/auth";
import { getClearRefreshTokenCookie } from "@/server/auth/tokens";
import { errorResponse, jsonResponse } from "@/server/auth/utils";
import { withDatabaseErrorResponse } from "@/server/http/databaseErrorResponse";
import "./routes";

const handlePOST = async (context: APIContext) => {
  const request = context.request;
  const env = getRuntimeEnv();
  const auth = await authMiddleware(request, env);
  if (!auth.authenticated) {
    const code = auth.status === 503 ? "DATABASE_UNAVAILABLE" : "UNAUTHORIZED";
    return errorResponse(code, auth.error, auth.status);
  }

  const refreshToken = request.headers.get("Cookie")?.match(/refreshToken=([^;]+)/)?.[1];
  const tokenRevocation = env.TOKEN_REVOCATION;
  if (refreshToken && tokenRevocation) {
    await tokenRevocation.put(refreshToken, "revoked", { expirationTtl: 604800 });
  }
  const db = env.DB;
  if (db) {
    const userRepo = new UserRepository(db);
    const user = await userRepo.updateRefreshToken(auth.context.userId, "");
    if (!user) return errorResponse("USER_NOT_FOUND", "User not found", 404);
  }

  return jsonResponse({ success: true }, 200, { "Set-Cookie": getClearRefreshTokenCookie(env) });
};

export const POST = (context: APIContext) =>
  withDatabaseErrorResponse(context, () => handlePOST(context));
