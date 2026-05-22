import { defineMiddleware } from "astro:middleware";
import { getRuntimeEnv } from "@/server/context/bindings";
import { rateLimiterMiddleware } from "@/server/middleware/apiRateLimiter";
import { UserRepository } from "@/server/repositories/userRepository";

const PUBLIC_ROUTES = ["/", "/login", "/register", "/signup", "/api/auth", "/api/openapi.json", "/api/docs"];
const PUBLIC_PREFIXES = ["/api/auth/"];

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/");
}

export const onRequest = defineMiddleware(async (context, next) => {
  const env = getRuntimeEnv();
  const request = context.request;
  const pathname = new URL(request.url).pathname;

  // Generate request ID
  const requestId = crypto.randomUUID();
  context.locals.requestId = requestId;

  // Apply rate limiting to API routes
  if (isApiRoute(pathname)) {
    const rateLimitResponse = await rateLimiterMiddleware(request, env);
    if (rateLimitResponse) {
      rateLimitResponse.headers.set("X-Request-ID", requestId);
      return rateLimitResponse;
    }
  }

  // Skip auth for public routes
  if (isPublicRoute(pathname)) {
    const response = await next();
    response.headers.set("X-Request-ID", requestId);
    return response;
  }

  // API routes validate auth inside each endpoint so Bearer tokens and cookie sessions both work.
  if (isApiRoute(pathname)) {
    const response = await next();
    response.headers.set("X-Request-ID", requestId);
    return response;
  }

  // Check for refresh token session cookie on protected pages.
  const cookie = request.headers.get("Cookie") ?? "";
  const refreshTokenMatch = cookie.match(/refreshToken=([^;]+)/);

  if (!refreshTokenMatch) {
    return Response.redirect(new URL("/login", request.url), 302);
  }

  const db = env.DB;
  if (!db) {
    return Response.redirect(new URL("/login", request.url), 302);
  }

  const tokenRevocation = env.TOKEN_REVOCATION;
  const refreshToken = decodeURIComponent(refreshTokenMatch[1]);
  if (tokenRevocation && await tokenRevocation.get(refreshToken)) {
    return Response.redirect(new URL("/login", request.url), 302);
  }

  const userRepo = new UserRepository(db);
  const user = await userRepo.findByRefreshToken(refreshToken);
  if (!user) {
    return Response.redirect(new URL("/login", request.url), 302);
  }

  context.locals.userId = user.id;
  context.locals.userEmail = user.email;

  const response = await next();
  response.headers.set("X-Request-ID", requestId);
  return response;
});
