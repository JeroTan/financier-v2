import { verifyAccessToken } from "@/server/auth/tokens";
import type { TokenPayload } from "@/server/auth/tokens";
import { getRuntimeEnv } from "@/server/context/bindings";
import { UserRepository } from "@/server/repositories/userRepository";

export type AuthContext = {
  userId: string;
  email: string;
};

export type AuthMiddlewareResult =
  | { authenticated: true; context: AuthContext }
  | { authenticated: false; error: string; status: number };

export async function authMiddleware(
  request: Request,
  env: Record<string, unknown> = getRuntimeEnv(),
): Promise<AuthMiddlewareResult> {
  const authHeader = request.headers.get("Authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const result = await verifyAccessToken(token, env);

    if (!result.error) {
      const payload = result.data as unknown as TokenPayload;

      return {
        authenticated: true,
        context: {
          userId: payload.sub,
          email: payload.email,
        },
      };
    }
  }

  const refreshToken = getCookie(request, "refreshToken");
  if (!refreshToken) {
    return { authenticated: false, error: "Missing authorization header or session cookie", status: 401 };
  }

  const tokenRevocation = env.TOKEN_REVOCATION as KVNamespace | undefined;
  if (tokenRevocation && await tokenRevocation.get(refreshToken)) {
    return { authenticated: false, error: "Token revoked", status: 401 };
  }

  const db = env.DB as D1Database | undefined;
  if (!db) {
    return { authenticated: false, error: "Database not available", status: 500 };
  }

  const userRepo = new UserRepository(db);
  const user = await userRepo.findByRefreshToken(refreshToken);
  if (!user) {
    return { authenticated: false, error: "Invalid session", status: 401 };
  }

  return { authenticated: true, context: { userId: user.id, email: user.email } };
}

function getCookie(request: Request, name: string): string | null {
  const cookie = request.headers.get("Cookie") ?? "";
  const match = cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}
