import { getRuntimeEnv } from "@/server/context/bindings";
import type { RateLimitConfig } from "./rateLimiter";
import { checkRateLimit, getRateLimitKey } from "./rateLimiter";

type EndpointCategory = "chat" | "data-read" | "data-write" | "settings" | "auth" | "exempt";

type RateLimitTier = {
  chat: RateLimitConfig;
  "data-read": RateLimitConfig;
  "data-write": RateLimitConfig;
  settings: RateLimitConfig;
  auth: RateLimitConfig;
};

const DEV_LIMITS: RateLimitTier = {
  chat: { maxAttempts: 30, windowSeconds: 60 },
  "data-read": { maxAttempts: 120, windowSeconds: 60 },
  "data-write": { maxAttempts: 60, windowSeconds: 60 },
  settings: { maxAttempts: 30, windowSeconds: 60 },
  auth: { maxAttempts: 30, windowSeconds: 60 },
};

const PROD_LIMITS: RateLimitTier = {
  chat: { maxAttempts: 20, windowSeconds: 60 },
  "data-read": { maxAttempts: 60, windowSeconds: 60 },
  "data-write": { maxAttempts: 30, windowSeconds: 60 },
  settings: { maxAttempts: 15, windowSeconds: 60 },
  auth: { maxAttempts: 5, windowSeconds: 60 },
};

const EXEMPT_PATHS = [
  "/api/health",
  "/api/docs",
  "/api/openapi.json",
];

function classifyEndpoint(pathname: string, method: string): EndpointCategory {
  if (EXEMPT_PATHS.some((p) => pathname.startsWith(p))) return "exempt";
  if (pathname.startsWith("/api/auth")) return "auth";
  if (pathname.startsWith("/api/chat")) return "chat";
  if (pathname.startsWith("/api/settings")) return "settings";
  if (method === "GET" && pathname.startsWith("/api/")) return "data-read";
  if (["POST", "PUT", "DELETE", "PATCH"].includes(method) && pathname.startsWith("/api/")) return "data-write";
  return "exempt";
}

function getLimits(env: string): RateLimitTier {
  return env === "development" ? DEV_LIMITS : PROD_LIMITS;
}

function getClientIp(request: Request): string {
  return request.headers.get("CF-Connecting-IP") ??
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ??
    "unknown";
}

export async function rateLimiterMiddleware(
  request: Request,
  env: Record<string, unknown> = getRuntimeEnv(),
): Promise<Response | null> {
  const url = new URL(request.url);
  const category = classifyEndpoint(url.pathname, request.method);

  if (category === "exempt") return null;

  const rateLimiterKv = env.RATE_LIMITER as KVNamespace | undefined;
  if (!rateLimiterKv) return null;

  const limits = getLimits((env.CLOUDFLARE_ENV as string) ?? "production");
  const config = limits[category];
  const key = getRateLimitKey(request, category);

  const result = await checkRateLimit(rateLimiterKv, key, config);

  if (!result.allowed) {
    const retryAfter = result.resetAt - Math.floor(Date.now() / 1000);
    return new Response(
      JSON.stringify({
        error: {
          code: "RATE_LIMITED",
          message: "Too many requests. Please try again later.",
        },
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(config.maxAttempts),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(result.resetAt),
        },
      },
    );
  }

  return null;
}

export { classifyEndpoint, getLimits, getClientIp };
