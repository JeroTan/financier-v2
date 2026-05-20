import { SignJWT, jwtVerify, importPKCS8, importSPKI, type JWSHeaderParameters } from "jose";

export type JwtResult<T> = { data: T; error: null } | { data: null; error: string };

export type JwtConfig = {
  mode: "hs256" | "rs256";
  secret?: string;
  privateKey?: string;
  publicKey?: string;
};

export function getJwtConfig(env: Record<string, unknown>): JwtConfig {
  const cloudflareEnv = (env.CLOUDFLARE_ENV as string) ?? "development";
  const isDev = cloudflareEnv !== "production";

  if (isDev) {
    return {
      mode: "hs256",
      secret: (env.JWT_SECRET as string) ?? "dev-secret-do-not-use-in-production",
    };
  }

  return {
    mode: "rs256",
    privateKey: env.JWT_PRIVATE_KEY as string,
    publicKey: env.JWT_PUBLIC_KEY as string,
  };
}

export async function jwtEncrypt<Payload extends object>({
  payload,
  expiresInSeconds = 900,
  config,
}: {
  payload: Payload;
  expiresInSeconds?: number;
  config: JwtConfig;
}): Promise<JwtResult<string>> {
  try {
    if (config.mode === "hs256") {
      if (!config.secret) return { data: null, error: "JWT_SECRET not configured" };

      const secret = new TextEncoder().encode(config.secret);
      const jwt = await new SignJWT(payload as Record<string, unknown>)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(`${expiresInSeconds}s`)
        .sign(secret);

      return { data: jwt, error: null };
    }

    if (config.mode === "rs256") {
      if (!config.privateKey) return { data: null, error: "JWT_PRIVATE_KEY not configured" };

      const privateKey = await importPKCS8(config.privateKey, "RS256");
      const jwt = await new SignJWT(payload as Record<string, unknown>)
        .setProtectedHeader({ alg: "RS256" })
        .setIssuedAt()
        .setExpirationTime(`${expiresInSeconds}s`)
        .sign(privateKey);

      return { data: jwt, error: null };
    }

    return { data: null, error: "Invalid JWT config mode" };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Failed to create JWT" };
  }
}

export async function jwtDecrypt<Payload extends object>({
  token,
  config,
}: {
  token: string;
  config: JwtConfig;
}): Promise<JwtResult<Payload>> {
  try {
    if (config.mode === "hs256") {
      if (!config.secret) return { data: null, error: "JWT_SECRET not configured" };

      const secret = new TextEncoder().encode(config.secret);
      const { payload } = await jwtVerify(token, secret);

      return { data: payload as Payload, error: null };
    }

    if (config.mode === "rs256") {
      if (!config.publicKey) return { data: null, error: "JWT_PUBLIC_KEY not configured" };

      const publicKey = await importSPKI(config.publicKey, "RS256");
      const { payload } = await jwtVerify(token, publicKey);

      return { data: payload as Payload, error: null };
    }

    return { data: null, error: "Invalid JWT config mode" };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Failed to verify JWT" };
  }
}

export function generateRefreshToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
