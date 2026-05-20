export type RateLimitConfig = {
  maxAttempts: number;
  windowSeconds: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

export async function checkRateLimit(
  kv: KVNamespace,
  key: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - config.windowSeconds;

  const current = await kv.get(key);
  const attempts = current ? JSON.parse(current) as { count: number; windowStart: number } : { count: 0, windowStart: now };

  if (attempts.windowStart < windowStart) {
    attempts.count = 0;
    attempts.windowStart = now;
  }

  if (attempts.count >= config.maxAttempts) {
    const resetAt = attempts.windowStart + config.windowSeconds;
    return { allowed: false, remaining: 0, resetAt };
  }

  attempts.count += 1;
  await kv.put(key, JSON.stringify(attempts), { expirationTtl: config.windowSeconds + 60 });

  return {
    allowed: true,
    remaining: config.maxAttempts - attempts.count,
    resetAt: attempts.windowStart + config.windowSeconds,
  };
}

export function getRateLimitKey(request: Request, suffix: string): string {
  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  return `rate_limit:${suffix}:${ip}`;
}
