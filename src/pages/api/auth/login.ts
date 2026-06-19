import type { APIContext } from "astro";
import { UserRepository } from "@/server/repositories/userRepository";
import { AuthService } from "@/server/auth/service";
import { getRuntimeEnv } from "@/server/context/bindings";
import { checkRateLimit, getRateLimitKey } from "@/server/middleware/rateLimiter";
import { authSuccessResponse, errorResponse, readCredentials } from "@/server/auth/utils";
import { databaseUnavailableError, withDatabaseErrorResponse } from "@/server/http/databaseErrorResponse";
import "./routes";

const handlePOST = async (context: APIContext) => {
  const request = context.request;
  const env = getRuntimeEnv();
  const rateLimiter = env.RATE_LIMITER;

  if (rateLimiter) {
    const key = getRateLimitKey(request, "login");
    const isDevelopment = env.CLOUDFLARE_ENV === "development";
    const limit = await checkRateLimit(rateLimiter, key, {
      maxAttempts: isDevelopment ? 30 : 5,
      windowSeconds: isDevelopment ? 60 : 900,
    });
    if (!limit.allowed) {
      const retryAfter = limit.resetAt - Math.floor(Date.now() / 1000);
      return errorResponse("RATE_LIMITED", "Too many login attempts", 429, { "Retry-After": String(retryAfter) });
    }
  }

  const body = await readCredentials(request);
  if (!body) return errorResponse("INVALID_INPUT", "Invalid request body", 400);
  if (!body.email || !body.password) return errorResponse("INVALID_INPUT", "Email and password are required", 400);

  const db = env.DB;
  if (!db) throw databaseUnavailableError("D1_ERROR: DB binding not available");

  const userRepo = new UserRepository(db);
  const authService = new AuthService(userRepo, env.PASSWORD_PEPPER as string, env);

  const result = await authService.login({ email: body.email, password: body.password });

  if (result.error) {
    if (result.error === "INVALID_CREDENTIALS") return errorResponse("INVALID_CREDENTIALS", "Invalid email or password", 401);
    return errorResponse("SERVER_ERROR", "Login failed", 500);
  }

  return authSuccessResponse(request, result.data!, 200);
};

export const POST = (context: APIContext) =>
  withDatabaseErrorResponse(context, () => handlePOST(context));
