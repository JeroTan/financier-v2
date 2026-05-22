import { UserRepository } from "@/server/repositories/userRepository";
import { AuthService } from "@/server/auth/service";
import "./routes";
import { getGoogleAuthUrl, handleGoogleCallback } from "@/server/auth/google";
import { authMiddleware } from "@/server/middleware/auth";
import { checkRateLimit, getRateLimitKey } from "@/server/middleware/rateLimiter";
import { getClearRefreshTokenCookie } from "@/server/auth/tokens";
import { getAppUrl, getRuntimeEnv } from "@/server/context/bindings";

type AstroApiContext = {
  request: Request;
};

function jsonResponse(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function errorResponse(code: string, message: string, status: number, headers: Record<string, string> = {}): Response {
  return jsonResponse({ error: { code, message } }, status, headers);
}

async function readCredentials(request: Request): Promise<{ email: string; password: string } | null> {
  const contentType = request.headers.get("Content-Type") ?? "";

  try {
    if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      return {
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
      };
    }

    return (await request.json()) as { email: string; password: string };
  } catch {
    return null;
  }
}

function isFormSubmit(request: Request): boolean {
  const contentType = request.headers.get("Content-Type") ?? "";
  return contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data");
}

function authSuccessResponse(
  request: Request,
  data: { setCookie?: string; data: unknown },
  status: number,
): Response {
  const headers: Record<string, string> = {};
  if (data.setCookie) headers["Set-Cookie"] = data.setCookie;

  if (isFormSubmit(request)) {
    return new Response(null, {
      status: 303,
      headers: {
        Location: "/dashboard",
        ...headers,
      },
    });
  }

  return jsonResponse(data.data, status, headers);
}

export const POST = async (context: any) => {
  const url = new URL(context.request.url);
  const path = url.pathname;

  if (path === "/api/auth/register") return handleRegister(context);
  if (path === "/api/auth/login") return handleLogin(context);
  if (path === "/api/auth/logout") return handleLogout(context);
  if (path === "/api/auth/refresh") return handleRefresh(context);

  return errorResponse("NOT_FOUND", "Route not found", 404);
};

export const GET = async (context: any) => {
  const url = new URL(context.request.url);
  const path = url.pathname;

  if (path === "/api/auth/google") return handleGoogleRedirect();
  if (path === "/api/auth/google/callback") return handleGoogleCallbackRoute(context);

  return errorResponse("NOT_FOUND", "Route not found", 404);
};

async function handleRegister(context: AstroApiContext): Promise<Response> {
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
  if (!body) {
    return errorResponse("INVALID_INPUT", "Invalid request body", 400);
  }

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
}

async function handleLogin(context: AstroApiContext): Promise<Response> {
  const request = context.request;
  const env = getRuntimeEnv();
  const rateLimiter = env.RATE_LIMITER;

  if (rateLimiter) {
    const key = getRateLimitKey(request, "login");
    const limit = await checkRateLimit(rateLimiter, key, { maxAttempts: 5, windowSeconds: 900 });
    if (!limit.allowed) {
      const retryAfter = limit.resetAt - Math.floor(Date.now() / 1000);
      return errorResponse("RATE_LIMITED", "Too many login attempts", 429, { "Retry-After": String(retryAfter) });
    }
  }

  const body = await readCredentials(request);
  if (!body) {
    return errorResponse("INVALID_INPUT", "Invalid request body", 400);
  }

  if (!body.email || !body.password) return errorResponse("INVALID_INPUT", "Email and password are required", 400);

  const db = env.DB;
  if (!db) return errorResponse("SERVER_ERROR", "Database not available", 500);

  const userRepo = new UserRepository(db);
  const authService = new AuthService(userRepo, env.PASSWORD_PEPPER as string, env);

  const result = await authService.login({ email: body.email, password: body.password });

  if (result.error) {
    if (result.error === "INVALID_CREDENTIALS") return errorResponse("INVALID_CREDENTIALS", "Invalid email or password", 401);
    return errorResponse("SERVER_ERROR", "Login failed", 500);
  }

  return authSuccessResponse(request, result.data!, 200);
}

async function handleLogout(context: AstroApiContext): Promise<Response> {
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
}

async function handleRefresh(context: AstroApiContext): Promise<Response> {
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
}

async function handleGoogleRedirect(): Promise<Response> {
  const env = getRuntimeEnv();
  const appUrl = getAppUrl(env);
  const authUrl = getGoogleAuthUrl({
    clientId: env.GOOGLE_CLIENT_ID as string,
    clientSecret: env.GOOGLE_CLIENT_SECRET as string,
    redirectUri: `${appUrl}/api/auth/google/callback`,
  });
  return Response.redirect(authUrl, 302);
}

async function handleGoogleCallbackRoute(context: AstroApiContext): Promise<Response> {
  const request = context.request;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) return Response.redirect(`${url.origin}/login?auth=error&message=${encodeURIComponent(error)}`, 302);
  if (!code) return Response.redirect(`${url.origin}/login?auth=error&message=missing_code`, 302);

  const env = getRuntimeEnv();
  const db = env.DB;
  if (!db) return Response.redirect(`${url.origin}/login?auth=error&message=server_error`, 302);

  const userRepo = new UserRepository(db);
  const result = await handleGoogleCallback(
    {
      clientId: env.GOOGLE_CLIENT_ID as string,
      clientSecret: env.GOOGLE_CLIENT_SECRET as string,
      redirectUri: `${getAppUrl(env)}/api/auth/google/callback`,
    },
    userRepo,
    env,
    code,
  );

  if (result.error) return Response.redirect(`${url.origin}/login?auth=error&message=${encodeURIComponent(result.error)}`, 302);

  const redirectUrl = new URL(result.data!.redirectUrl, url.origin);
  const response = Response.redirect(redirectUrl.toString(), 302);
  if (result.data!.setCookie) response.headers.set("Set-Cookie", result.data!.setCookie);
  return response;
}
