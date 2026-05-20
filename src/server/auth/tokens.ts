import { jwtEncrypt, jwtDecrypt, generateRefreshToken, type JwtResult, type JwtConfig, getJwtConfig } from "@/lib/crypto/jwt";

const ACCESS_TOKEN_TTL = 900;
const REFRESH_TOKEN_TTL = 604800;

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type TokenPayload = {
  sub: string;
  email: string;
};

export async function createTokens(
  userId: string,
  email: string,
  env: Record<string, unknown>,
): Promise<JwtResult<AuthTokens>> {
  const config = getJwtConfig(env);

  const accessTokenResult = await jwtEncrypt<TokenPayload>({
    payload: { sub: userId, email },
    expiresInSeconds: ACCESS_TOKEN_TTL,
    config,
  });

  if (accessTokenResult.error) return accessTokenResult;

  const refreshToken = generateRefreshToken();

  return {
    data: {
      accessToken: accessTokenResult.data!,
      refreshToken,
    },
    error: null,
  };
}

export async function verifyAccessToken(
  token: string,
  env: Record<string, unknown>,
): Promise<JwtResult<TokenPayload>> {
  const config = getJwtConfig(env);
  return jwtDecrypt<TokenPayload>({ token, config });
}

export function getRefreshTokenExpiry(): number {
  return Math.floor(Date.now() / 1000) + REFRESH_TOKEN_TTL;
}

export function getRefreshTokenCookie(refreshToken: string): string {
  const maxAge = REFRESH_TOKEN_TTL;
  return `refreshToken=${refreshToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

export function getClearRefreshTokenCookie(): string {
  return `refreshToken=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}
