import { env } from "cloudflare:workers";

export type RuntimeBindings = Cloudflare.Env & Record<string, unknown> & {
  APP_URL?: string;
  CLOUDFLARE_ENV?: string;
  JWT_PRIVATE_KEY?: string;
  JWT_PUBLIC_KEY?: string;
};

export function getRuntimeEnv(): RuntimeBindings {
  return env as RuntimeBindings;
}

export function getAppUrl(runtimeEnv: RuntimeBindings = getRuntimeEnv()): string {
  if (runtimeEnv.APP_URL) return runtimeEnv.APP_URL;
  const cloudflareEnv = runtimeEnv.CLOUDFLARE_ENV as string | undefined;
  return cloudflareEnv === "production" ? "https://financier.app" : "http://localhost:4321";
}
