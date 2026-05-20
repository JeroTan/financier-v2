import { verifyAccessToken } from "@/server/auth/tokens";
import type { TokenPayload } from "@/server/auth/tokens";

export type AuthContext = {
  userId: string;
  email: string;
};

export type AuthMiddlewareResult =
  | { authenticated: true; context: AuthContext }
  | { authenticated: false; error: string; status: number };

export async function authMiddleware(
  request: Request,
  env: Record<string, unknown>,
): Promise<AuthMiddlewareResult> {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { authenticated: false, error: "Missing authorization header", status: 401 };
  }

  const token = authHeader.slice(7);
  const result = await verifyAccessToken(token, env);

  if (result.error) {
    return { authenticated: false, error: result.error, status: 401 };
  }

  const payload = result.data as unknown as TokenPayload;

  return {
    authenticated: true,
    context: {
      userId: payload.sub,
      email: payload.email,
    },
  };
}
