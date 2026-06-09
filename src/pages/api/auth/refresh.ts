import type { APIContext } from "astro";
import { UserRepository } from "@/server/repositories/userRepository";
import { AuthService } from "@/server/auth/service";
import { getRuntimeEnv } from "@/server/context/bindings";
import { errorResponse, jsonResponse } from "@/server/auth/utils";
import "./routes";

export const POST = async (context: APIContext) => {
  const request = context.request;
  const env = getRuntimeEnv();

  let body: { refreshToken: string };
  try {
    body = await request.json();
  } catch {
    const cookie = request.headers.get("Cookie")?.match(/refreshToken=([^;]+)/)?.[1];
    if (!cookie) return errorResponse("INVALID_INPUT", "Refresh token required", 400);
    body = { refreshToken: cookie };
  }

  if (!body.refreshToken) return errorResponse("INVALID_INPUT", "Refresh token required", 400);

  const db = env.DB;
  const tokenRevocation = env.TOKEN_REVOCATION;
  if (!db) return errorResponse("SERVER_ERROR", "Database not available", 500);

  const userRepo = new UserRepository(db);
  const authService = new AuthService(userRepo, env.PASSWORD_PEPPER as string, env);

  const result = await authService.refresh(body.refreshToken, tokenRevocation);

  if (result.error) {
    if (result.error === "TOKEN_REVOKED") return errorResponse("TOKEN_REVOKED", "Token has been revoked", 401);
    if (result.error === "INVALID_REFRESH_TOKEN") return errorResponse("INVALID_REFRESH_TOKEN", "Invalid refresh token", 401);
    return errorResponse("SERVER_ERROR", "Refresh failed", 500);
  }

  const headers: Record<string, string> = {};
  if (result.data!.setCookie) headers["Set-Cookie"] = result.data!.setCookie;
  return jsonResponse(result.data!.data, 200, headers);
};
