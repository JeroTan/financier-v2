import { defineMiddleware } from "astro:middleware";

const ALLOWED_ORIGINS = ["http://localhost:4321", "https://financier.example.com"];

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin);
}

export const onRequest = defineMiddleware(async (context, next) => {
  const env = (context as any).env as Record<string, unknown> | undefined;
  const request = context.request;
  const origin = request.headers.get("Origin");

  // CORS preflight
  if (request.method === "OPTIONS") {
    if (origin && isAllowedOrigin(origin)) {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Max-Age": "86400",
        },
      });
    }
    return new Response(null, { status: 204 });
  }

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

  const response = await next();

  // Add CORS headers to response
  if (origin && isAllowedOrigin(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  // Add request ID to response
  response.headers.set("X-Request-ID", requestId);

  return response;
});
