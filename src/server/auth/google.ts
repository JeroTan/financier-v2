import { createTokens, getRefreshTokenCookie } from "@/server/auth/tokens";
import type { UserRepository } from "@/server/repositories/userRepository";
import type { JwtResult } from "@/lib/crypto/jwt";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

export type GoogleOAuthConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

export type GoogleUserInfo = {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  picture?: string;
};

export function getGoogleAuthUrl(config: GoogleOAuthConfig, state?: string): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: "email profile",
    access_type: "offline",
    prompt: "consent",
  });

  if (state) params.set("state", state);

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForTokens(
  config: GoogleOAuthConfig,
  code: string,
): Promise<JwtResult<{ accessToken: string; idToken?: string }>> {
  try {
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!response.ok) {
      return { data: null, error: "GOOGLE_TOKEN_EXCHANGE_FAILED" };
    }

    const data = (await response.json()) as { access_token: string; id_token?: string };
    return {
      data: {
        accessToken: data.access_token,
        idToken: data.id_token,
      },
      error: null,
    };
  } catch {
    return { data: null, error: "GOOGLE_TOKEN_EXCHANGE_FAILED" };
  }
}

export async function getGoogleUserInfo(accessToken: string): Promise<JwtResult<GoogleUserInfo>> {
  try {
    const response = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      return { data: null, error: "GOOGLE_USERINFO_FAILED" };
    }

    const data = (await response.json()) as GoogleUserInfo;
    return { data, error: null };
  } catch {
    return { data: null, error: "GOOGLE_USERINFO_FAILED" };
  }
}

export async function handleGoogleCallback(
  config: GoogleOAuthConfig,
  userRepo: UserRepository,
  env: Record<string, unknown>,
  code: string,
): Promise<JwtResult<{ redirectUrl: string; setCookie?: string }>> {
  const tokensResult = await exchangeCodeForTokens(config, code);
  if (tokensResult.error) return tokensResult;

  const userInfoResult = await getGoogleUserInfo(tokensResult.data!.accessToken);
  if (userInfoResult.error) return userInfoResult;

  const userInfo = userInfoResult.data!;

  if (!userInfo.verified_email) {
    return { data: null, error: "EMAIL_NOT_VERIFIED" };
  }

  let user = await userRepo.findByGoogleId(userInfo.id);

  if (!user) {
    const existingByEmail = await userRepo.findByEmail(userInfo.email);

    if (existingByEmail) {
      user = await userRepo.linkGoogle(existingByEmail.id, userInfo.id);
      if (!user) return { data: null, error: "LINK_FAILED" };
    } else {
      const userId = crypto.randomUUID();
      user = await userRepo.create({
        id: userId,
        email: userInfo.email,
        googleId: userInfo.id,
      });
      if (!user) return { data: null, error: "CREATE_FAILED" };
    }
  }

  const authTokens = await createTokens(user.id, user.email, env);
  if (authTokens.error) return authTokens;

  await userRepo.updateRefreshToken(user.id, authTokens.data!.refreshToken);

  const redirectUrl = `/dashboard?auth=success`;

  return {
    data: {
      redirectUrl,
      setCookie: getRefreshTokenCookie(authTokens.data!.refreshToken, env),
    },
    error: null,
  };
}
