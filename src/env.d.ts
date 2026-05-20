/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

declare module "astro" {
  interface Locals {
    db?: D1Database;
    tokenRevocation?: KVNamespace;
    rateLimiter?: KVNamespace;
    ai?: unknown;
    storage?: R2Bucket;
    session?: KVNamespace;
    pepper?: string;
    CLOUDFLARE_ENV?: string;
    JWT_SECRET?: string;
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    APP_URL?: string;
  }
}
