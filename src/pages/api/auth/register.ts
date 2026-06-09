import type { APIContext } from "astro";
import { UserRepository } from "@/server/repositories/userRepository";
import { AuthService } from "@/server/auth/service";
import { getRuntimeEnv } from "@/server/context/bindings";
import { checkRateLimit, getRateLimitKey } from "@/server/middleware/rateLimiter";
import { authSuccessResponse, errorResponse, readCredentials } from "@/server/auth/utils";
import "./routes";

export const POST = async (context: APIContext) => {
  const request = context.request;
  const env = getRuntimeEnv();
  const rateLimiter = env.RATE_LIMITER;

  if (rateLimiter) {
    const key = getRateLimitKey(request, "register");
    const limit = await checkRateLimit(rateLimiter, key, { maxAttempts: 3, windowSeconds: 900 });
    if (!limit.allowed) {
      const retryAfter = limit.resetAt - Math.floor(Date.now() / 1000);
      return errorResponse("RATE_LIMITED", "Too many registration attempts", 429, { "Retry-After": String(retryAfter) });
    }
  }

  const body = await readCredentials(request);
  if (!body) return errorResponse("INVALID_INPUT", "Invalid request body", 400);
  if (!body.email || !body.password) return errorResponse("INVALID_INPUT", "Email and password are required", 400);
  if (body.password.length < 8) return errorResponse("INVALID_INPUT", "Password must be at least 8 characters", 400);

  const db = env.DB;
  if (!db) return errorResponse("SERVER_ERROR", "Database not available", 500);

  const userRepo = new UserRepository(db);
  const authService = new AuthService(userRepo, env.PASSWORD_PEPPER as string, env);

  const result = await authService.register({ email: body.email, password: body.password });

  if (result.error) {
    if (result.error === "EMAIL_EXISTS") return errorResponse("EMAIL_EXISTS", "Email already registered", 409);
    return errorResponse("SERVER_ERROR", "Registration failed", 500);
  }

  return authSuccessResponse(request, result.data!, 201);
};
