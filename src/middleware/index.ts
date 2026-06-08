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

function withRequestId(response: Response, requestId: string): Response {
  const headers = new Headers(response.headers);
  headers.set("X-Request-ID", requestId);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
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
      return withRequestId(rateLimitResponse, requestId);
    }
  }

  // Skip auth for public routes
  if (isPublicRoute(pathname)) {
    const response = await next();
    return withRequestId(response, requestId);
  }

  // API routes validate auth inside each endpoint so Bearer tokens and cookie sessions both work.
  if (isApiRoute(pathname)) {
    const response = await next();
    return withRequestId(response, requestId);
  }

  // Check for refresh token session cookie on protected pages.
  const cookie = request.headers.get("Cookie") ?? "";
  const refreshTokenMatch = cookie.match(/refreshToken=([^;]+)/);

  if (!refreshTokenMatch) {
    return withRequestId(Response.redirect(new URL("/login", request.url), 302), requestId);
  }

  const db = env.DB;
  if (!db) {
    return withRequestId(Response.redirect(new URL("/login", request.url), 302), requestId);
  }

  const tokenRevocation = env.TOKEN_REVOCATION;
  const refreshToken = decodeURIComponent(refreshTokenMatch[1]);
  if (tokenRevocation && await tokenRevocation.get(refreshToken)) {
    return withRequestId(Response.redirect(new URL("/login", request.url), 302), requestId);
  }

  const userRepo = new UserRepository(db);
  const user = await userRepo.findByRefreshToken(refreshToken);
  if (!user) {
    return withRequestId(Response.redirect(new URL("/login", request.url), 302), requestId);
  }

  context.locals.userId = user.id;
  context.locals.userEmail = user.email;

  const response = await next();
  return withRequestId(response, requestId);
});
