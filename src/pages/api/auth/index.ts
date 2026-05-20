import { UserRepository } from "@/server/repositories/userRepository";
import { AuthService } from "@/server/auth/service";
import { registerDetail, loginDetail, logoutDetail, refreshDetail, googleAuthDetail, googleCallbackDetail } from "./routes";
import { getGoogleAuthUrl, handleGoogleCallback } from "@/server/auth/google";
import { authMiddleware } from "@/server/middleware/auth";
import { checkRateLimit, getRateLimitKey } from "@/server/middleware/rateLimiter";

type AppLocals = {
  db?: D1Database;
  tokenRevocation?: KVNamespace;
  rateLimiter?: KVNamespace;
  pepper?: string;
  CLOUDFLARE_ENV?: string;
  JWT_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  APP_URL?: string;
};

function getLocals(request: Request): AppLocals {
  return ((request as any).locals ?? {}) as AppLocals;
}

function getEnv(request: Request): Record<string, unknown> {
  const locals = getLocals(request);
  return {
    CLOUDFLARE_ENV: locals.CLOUDFLARE_ENV ?? "development",
    PASSWORD_PEPPER: locals.pepper ?? "dev-pepper",
    JWT_SECRET: locals.JWT_SECRET ?? "dev-secret-do-not-use-in-production",
    GOOGLE_CLIENT_ID: locals.GOOGLE_CLIENT_ID ?? "",
    GOOGLE_CLIENT_SECRET: locals.GOOGLE_CLIENT_SECRET ?? "",
    APP_URL: locals.APP_URL ?? "http://localhost:4321",
    DB: locals.db,
    TOKEN_REVOCATION: locals.tokenRevocation,
    RATE_LIMITER: locals.rateLimiter,
  };
}

function jsonResponse(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function errorResponse(code: string, message: string, status: number, headers: Record<string, string> = {}): Response {
  return jsonResponse({ error: { code, message } }, status, headers);
}

export const POST = async (context: any) => {
  const url = new URL(context.request.url);
  const path = url.pathname;

  if (path === "/api/auth/register") return handleRegister(context.request);
  if (path === "/api/auth/login") return handleLogin(context.request);
  if (path === "/api/auth/logout") return handleLogout(context.request);
  if (path === "/api/auth/refresh") return handleRefresh(context.request);

  return errorResponse("NOT_FOUND", "Route not found", 404);
};

export const GET = async (context: any) => {
  const url = new URL(context.request.url);
  const path = url.pathname;

  if (path === "/api/auth/google") return handleGoogleRedirect(context.request);
  if (path === "/api/auth/google/callback") return handleGoogleCallbackRoute(context.request);

  return errorResponse("NOT_FOUND", "Route not found", 404);
};

async function handleRegister(request: Request): Promise<Response> {
  const env = getEnv(request);
  const rateLimiter = env.RATE_LIMITER as KVNamespace | undefined;

  if (rateLimiter) {
    const key = getRateLimitKey(request, "register");
    const limit = await checkRateLimit(rateLimiter, key, { maxAttempts: 3, windowSeconds: 900 });
    if (!limit.allowed) {
      const retryAfter = limit.resetAt - Math.floor(Date.now() / 1000);
      return errorResponse("RATE_LIMITED", "Too many registration attempts", 429, { "Retry-After": String(retryAfter) });
    }
  }

  let body: { email: string; password: string };
  try {
    body = await request.json();
  } catch {
    return errorResponse("INVALID_INPUT", "Invalid request body", 400);
  }

  if (!body.email || !body.password) return errorResponse("INVALID_INPUT", "Email and password are required", 400);
  if (body.password.length < 8) return errorResponse("INVALID_INPUT", "Password must be at least 8 characters", 400);

  const db = env.DB as D1Database | undefined;
  if (!db) return errorResponse("SERVER_ERROR", "Database not available", 500);

  const userRepo = new UserRepository(db);
  const authService = new AuthService(userRepo, env.PASSWORD_PEPPER as string, env);

  const result = await authService.register({ email: body.email, password: body.password });

  if (result.error) {
    if (result.error === "EMAIL_EXISTS") return errorResponse("EMAIL_EXISTS", "Email already registered", 409);
    return errorResponse("SERVER_ERROR", "Registration failed", 500);
  }

  const headers: Record<string, string> = {};
  if (result.data!.setCookie) headers["Set-Cookie"] = result.data!.setCookie;
  return jsonResponse(result.data!.data, 201, headers);
}

async function handleLogin(request: Request): Promise<Response> {
  const env = getEnv(request);
  const rateLimiter = env.RATE_LIMITER as KVNamespace | undefined;

  if (rateLimiter) {
    const key = getRateLimitKey(request, "login");
    const limit = await checkRateLimit(rateLimiter, key, { maxAttempts: 5, windowSeconds: 900 });
    if (!limit.allowed) {
      const retryAfter = limit.resetAt - Math.floor(Date.now() / 1000);
      return errorResponse("RATE_LIMITED", "Too many login attempts", 429, { "Retry-After": String(retryAfter) });
    }
  }

  let body: { email: string; password: string };
  try {
    body = await request.json();
  } catch {
    return errorResponse("INVALID_INPUT", "Invalid request body", 400);
  }

  if (!body.email || !body.password) return errorResponse("INVALID_INPUT", "Email and password are required", 400);

  const db = env.DB as D1Database | undefined;
  if (!db) return errorResponse("SERVER_ERROR", "Database not available", 500);

  const userRepo = new UserRepository(db);
  const authService = new AuthService(userRepo, env.PASSWORD_PEPPER as string, env);

  const result = await authService.login({ email: body.email, password: body.password });

  if (result.error) {
    if (result.error === "INVALID_CREDENTIALS") return errorResponse("INVALID_CREDENTIALS", "Invalid email or password", 401);
    return errorResponse("SERVER_ERROR", "Login failed", 500);
  }

  const headers: Record<string, string> = {};
  if (result.data!.setCookie) headers["Set-Cookie"] = result.data!.setCookie;
  return jsonResponse(result.data!.data, 200, headers);
}

async function handleLogout(request: Request): Promise<Response> {
  const env = getEnv(request);
  const auth = await authMiddleware(request, env);
  if (!auth.authenticated) return errorResponse("UNAUTHORIZED", auth.error, auth.status);

  const refreshToken = request.headers.get("Cookie")?.match(/refreshToken=([^;]+)/)?.[1];
  const tokenRevocation = env.TOKEN_REVOCATION as KVNamespace | undefined;
  if (refreshToken && tokenRevocation) {
    await tokenRevocation.put(refreshToken, "revoked", { expirationTtl: 604800 });
  }

  return jsonResponse({ success: true }, 200, { "Set-Cookie": "refreshToken=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0" });
}

async function handleRefresh(request: Request): Promise<Response> {
  const env = getEnv(request);

  let body: { refreshToken: string };
  try {
    body = await request.json();
  } catch {
    const cookie = request.headers.get("Cookie")?.match(/refreshToken=([^;]+)/)?.[1];
    if (!cookie) return errorResponse("INVALID_INPUT", "Refresh token required", 400);
    body = { refreshToken: cookie };
  }

  if (!body.refreshToken) return errorResponse("INVALID_INPUT", "Refresh token required", 400);

  const db = env.DB as D1Database | undefined;
  const tokenRevocation = env.TOKEN_REVOCATION as KVNamespace | undefined;
  if (!db || !tokenRevocation) return errorResponse("SERVER_ERROR", "Server not configured", 500);

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
}

async function handleGoogleRedirect(request: Request): Promise<Response> {
  const env = getEnv(request);
  const appUrl = env.APP_URL as string;
  const authUrl = getGoogleAuthUrl({
    clientId: env.GOOGLE_CLIENT_ID as string,
    clientSecret: env.GOOGLE_CLIENT_SECRET as string,
    redirectUri: `${appUrl}/api/auth/google/callback`,
  });
  return Response.redirect(authUrl, 302);
}

async function handleGoogleCallbackRoute(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) return Response.redirect(`${url.origin}/?auth=error&message=${encodeURIComponent(error)}`, 302);
  if (!code) return Response.redirect(`${url.origin}/?auth=error&message=missing_code`, 302);

  const env = getEnv(request);
  const db = env.DB as D1Database | undefined;
  if (!db) return Response.redirect(`${url.origin}/?auth=error&message=server_error`, 302);

  const userRepo = new UserRepository(db);
  const result = await handleGoogleCallback(
    {
      clientId: env.GOOGLE_CLIENT_ID as string,
      clientSecret: env.GOOGLE_CLIENT_SECRET as string,
      redirectUri: `${env.APP_URL as string}/api/auth/google/callback`,
    },
    userRepo,
    env,
    code,
  );

  if (result.error) return Response.redirect(`${url.origin}/?auth=error&message=${encodeURIComponent(result.error)}`, 302);

  const redirectUrl = new URL(result.data!.redirectUrl, url.origin);
  const response = Response.redirect(redirectUrl.toString(), 302);
  if (result.data!.setCookie) response.headers.set("Set-Cookie", result.data!.setCookie);
  return response;
}
