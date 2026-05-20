import { UserRepository } from "@/server/repositories/userRepository";
import { AuthService } from "@/server/auth/service";
import { authMiddleware } from "@/server/middleware/auth";
import { getSettingsDetail, updatePasswordDetail, updatePreferencesDetail, unlinkGoogleDetail } from "./routes";
import { isValidPersonality } from "@/server/ai/personalities/constants";

type AppLocals = {
  db?: D1Database;
  tokenRevocation?: KVNamespace;
  pepper?: string;
  CLOUDFLARE_ENV?: string;
  JWT_SECRET?: string;
};

function getLocals(request: Request): AppLocals {
  return ((request as any).locals ?? {}) as AppLocals;
}

function getEnv(request: Request): Record<string, unknown> {
  const locals = getLocals(request);
  return {
    CLOUDFLARE_ENV: locals.CLOUDFLARE_ENV ?? "development",
    PASSWORD_PEPPER: locals.pepper ?? "dev-pepper",
    JWT_SECRET: locals.JWT_SECRET ?? "dev-secret-do-not-use-in-production",
    DB: locals.db,
    TOKEN_REVOCATION: locals.tokenRevocation,
  };
}

function jsonResponse(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function errorResponse(code: string, message: string, status: number): Response {
  return jsonResponse({ error: { code, message } }, status);
}

export const GET = async (context: any) => {
  const url = new URL(context.request.url);
  if (url.pathname === "/api/settings") return handleGetSettings(context.request);
  return errorResponse("NOT_FOUND", "Route not found", 404);
};

export const PUT = async (context: any) => {
  const url = new URL(context.request.url);
  if (url.pathname === "/api/settings/password") return handleUpdatePassword(context.request);
  if (url.pathname === "/api/settings/preferences") return handleUpdatePreferences(context.request);
  return errorResponse("NOT_FOUND", "Route not found", 404);
};

export const POST = async (context: any) => {
  const url = new URL(context.request.url);
  if (url.pathname === "/api/settings/unlink-google") return handleUnlinkGoogle(context.request);
  return errorResponse("NOT_FOUND", "Route not found", 404);
};

async function handleGetSettings(request: Request): Promise<Response> {
  const env = getEnv(request);
  const auth = await authMiddleware(request, env);
  if (!auth.authenticated) return errorResponse("UNAUTHORIZED", auth.error, auth.status);

  const db = env.DB as D1Database | undefined;
  if (!db) return errorResponse("SERVER_ERROR", "Database not available", 500);

  const userRepo = new UserRepository(db);
  const user = await userRepo.findById(auth.context.userId);
  if (!user) return errorResponse("USER_NOT_FOUND", "User not found", 404);

  return jsonResponse({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      personality: user.personality,
      theme: user.theme,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
}

async function handleUpdatePassword(request: Request): Promise<Response> {
  const env = getEnv(request);
  const auth = await authMiddleware(request, env);
  if (!auth.authenticated) return errorResponse("UNAUTHORIZED", auth.error, auth.status);

  let body: { currentPassword: string; newPassword: string };
  try {
    body = await request.json();
  } catch {
    return errorResponse("INVALID_INPUT", "Invalid request body", 400);
  }

  if (!body.currentPassword || !body.newPassword) return errorResponse("INVALID_INPUT", "Current and new password are required", 400);
  if (body.newPassword.length < 8) return errorResponse("INVALID_INPUT", "New password must be at least 8 characters", 400);

  const db = env.DB as D1Database | undefined;
  if (!db) return errorResponse("SERVER_ERROR", "Database not available", 500);

  const userRepo = new UserRepository(db);
  const authService = new AuthService(userRepo, env.PASSWORD_PEPPER as string, env);

  const result = await authService.changePassword(auth.context.userId, body.currentPassword, body.newPassword);
  if (result.error) {
    if (result.error === "INVALID_CURRENT_PASSWORD") return errorResponse("INVALID_CURRENT_PASSWORD", "Current password is incorrect", 401);
    return errorResponse("SERVER_ERROR", "Password update failed", 500);
  }

  return jsonResponse({ success: true });
}

async function handleUpdatePreferences(request: Request): Promise<Response> {
  const env = getEnv(request);
  const auth = await authMiddleware(request, env);
  if (!auth.authenticated) return errorResponse("UNAUTHORIZED", auth.error, auth.status);

  let body: { personality?: string; theme?: "light" | "dark" };
  try {
    body = await request.json();
  } catch {
    return errorResponse("INVALID_INPUT", "Invalid request body", 400);
  }

  if (body.personality && !isValidPersonality(body.personality)) {
    body.personality = "default";
  }

  const db = env.DB as D1Database | undefined;
  if (!db) return errorResponse("SERVER_ERROR", "Database not available", 500);

  const userRepo = new UserRepository(db);
  const authService = new AuthService(userRepo, env.PASSWORD_PEPPER as string, env);

  const result = await authService.updatePreferences(auth.context.userId, body);
  if (result.error) return errorResponse("SERVER_ERROR", "Preferences update failed", 500);

  const user = await userRepo.findById(auth.context.userId);
  if (!user) return errorResponse("USER_NOT_FOUND", "User not found", 404);

  return jsonResponse({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      personality: user.personality,
      theme: user.theme,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
}

async function handleUnlinkGoogle(request: Request): Promise<Response> {
  const env = getEnv(request);
  const auth = await authMiddleware(request, env);
  if (!auth.authenticated) return errorResponse("UNAUTHORIZED", auth.error, auth.status);

  const db = env.DB as D1Database | undefined;
  if (!db) return errorResponse("SERVER_ERROR", "Database not available", 500);

  const userRepo = new UserRepository(db);
  const user = await userRepo.findById(auth.context.userId);
  if (!user) return errorResponse("USER_NOT_FOUND", "User not found", 404);
  if (!user.googleId) return errorResponse("NOT_LINKED", "Google account is not linked", 400);
  if (!user.passwordHash) return errorResponse("NO_PASSWORD_SET", "Must set a password before unlinking Google", 400);

  await userRepo.unlinkGoogle(auth.context.userId);
  return jsonResponse({ success: true });
}
