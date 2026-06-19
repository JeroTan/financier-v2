import type { APIContext } from "astro";
import { UserRepository } from "@/server/repositories/userRepository";
import { AuthService } from "@/server/auth/service";
import { getRuntimeEnv } from "@/server/context/bindings";
import { errorResponse, jsonResponse } from "@/server/auth/utils";
import { databaseUnavailableError, withDatabaseErrorResponse } from "@/server/http/databaseErrorResponse";
import "./routes";

const handlePOST = async (context: APIContext) => {
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
  if (!db) throw databaseUnavailableError("D1_ERROR: DB binding not available");

  const userRepo = new UserRepository(db);
  const authService = new AuthService(userRepo, env.PASSWORD_PEPPER as string, env);

  const result = await authService.refresh(body.refreshToken, tokenRevocation);

  if (result.error) {
    if (result.error === "TOKEN_REVOKED") return errorResponse("TOKEN_REVOKED", "Token has been revoked", 401);
    if (result.error === "INVALID_REFRESH_TOKEN") return errorResponse("INVALID_REFRESH_TOKEN", "Invalid refresh token", 401);
    if (result.error === "USER_NOT_FOUND") return errorResponse("USER_NOT_FOUND", "User not found", 404);
    return errorResponse("SERVER_ERROR", "Refresh failed", 500);
  }

  const headers: Record<string, string> = {};
  if (result.data!.setCookie) headers["Set-Cookie"] = result.data!.setCookie;
  return jsonResponse(result.data!.data, 200, headers);
};

export const POST = (context: APIContext) =>
  withDatabaseErrorResponse(context, () => handlePOST(context));
