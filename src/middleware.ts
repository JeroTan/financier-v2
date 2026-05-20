import { defineMiddleware } from "astro:middleware";
import { jwtDecrypt } from "@/lib/crypto/jwt";
import { getJwtConfig } from "@/lib/crypto/jwt";
import { rateLimiterMiddleware } from "@/server/middleware/apiRateLimiter";

const PUBLIC_ROUTES = ["/", "/login", "/register", "/api/auth", "/api/openapi.json", "/api/docs"];
const PUBLIC_PREFIXES = ["/api/auth/"];

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/");
}

export const onRequest = defineMiddleware(async (context, next) => {
  const env = (context as any).env as Record<string, unknown> | undefined;
  const request = context.request;
  const pathname = new URL(request.url).pathname;

  // Set locals from env
  if (env) {
    const locals = context.locals as unknown as Record<string, unknown>;
    locals.db = env.DB;
    locals.tokenRevocation = env.TOKEN_REVOCATION;
    locals.rateLimiter = env.RATE_LIMITER;
    locals.ai = env.AI;
    locals.storage = env.STORAGE;
    locals.session = env.SESSION;
    locals.pepper = env.PASSWORD_PEPPER;
    locals.CLOUDFLARE_ENV = env.CLOUDFLARE_ENV;
    locals.JWT_SECRET = env.JWT_SECRET;
    locals.GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID;
    locals.GOOGLE_CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET;
    locals.APP_URL = env.APP_URL;
  }

  // Generate request ID
  const requestId = crypto.randomUUID();
  (context.locals as unknown as Record<string, unknown>).requestId = requestId;

  // Apply rate limiting to API routes
  if (isApiRoute(pathname)) {
    const rateLimitResponse = await rateLimiterMiddleware(request, env ?? {});
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

  // Check for JWT in cookies
  const cookie = request.headers.get("Cookie") ?? "";
  const refreshTokenMatch = cookie.match(/refreshToken=([^;]+)/);

  if (!refreshTokenMatch) {
    // No auth token
    if (isApiRoute(pathname)) {
      return new Response(
        JSON.stringify({ error: { code: "UNAUTHORIZED", message: "Authentication required" } }),
        { status: 401, headers: { "Content-Type": "application/json", "X-Request-ID": requestId } }
      );
    }

    // Redirect to login for page requests
    return Response.redirect(new URL("/login", request.url), 302);
  }

  // Validate JWT
  const jwtConfig = getJwtConfig(env ?? {});
  const result = await jwtDecrypt({ token: refreshTokenMatch[1], config: jwtConfig });

  if (result.error) {
    if (isApiRoute(pathname)) {
      return new Response(
        JSON.stringify({ error: { code: "UNAUTHORIZED", message: "Invalid or expired token" } }),
        { status: 401, headers: { "Content-Type": "application/json", "X-Request-ID": requestId } }
      );
    }

    return Response.redirect(new URL("/login", request.url), 302);
  }

  // Attach user info to locals
  const payload = result.data as { sub?: string; email?: string };
  (context.locals as unknown as Record<string, unknown>).userId = payload.sub;
  (context.locals as unknown as Record<string, unknown>).userEmail = payload.email;

  const response = await next();
  response.headers.set("X-Request-ID", requestId);
  return response;
});
