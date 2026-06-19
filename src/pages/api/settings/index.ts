import { UserRepository } from "@/server/repositories/userRepository";
import { AuthService } from "@/server/auth/service";
import { authMiddleware } from "@/server/middleware/auth";
import "./routes";
import { isValidPersonality } from "@/server/ai/personalities/constants";
import { getRuntimeEnv } from "@/server/context/bindings";
import { databaseUnavailableError, withDatabaseErrorResponse } from "@/server/http/databaseErrorResponse";

type AstroApiContext = {
  request: Request;
};

function jsonResponse(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function errorResponse(code: string, message: string, status: number): Response {
  return jsonResponse({ error: { code, message } }, status);
}

const handleGET = async (context: any) => {
  const url = new URL(context.request.url);
  if (url.pathname === "/api/settings") return handleGetSettings(context);
  return errorResponse("NOT_FOUND", "Route not found", 404);
};

const handlePUT = async (context: any) => {
  const url = new URL(context.request.url);
  if (url.pathname === "/api/settings/password") return handleUpdatePassword(context);
  if (url.pathname === "/api/settings/preferences") return handleUpdatePreferences(context);
  return errorResponse("NOT_FOUND", "Route not found", 404);
};

const handlePOST = async (context: any) => {
  const url = new URL(context.request.url);
  if (url.pathname === "/api/settings/unlink-google") return handleUnlinkGoogle(context);
  return errorResponse("NOT_FOUND", "Route not found", 404);
};

async function handleGetSettings(context: AstroApiContext): Promise<Response> {
  const request = context.request;
  const env = getRuntimeEnv();
  const auth = await authMiddleware(request, env);
  if (!auth.authenticated) {
    const code = auth.status === 503 ? "DATABASE_UNAVAILABLE" : "UNAUTHORIZED";
    return errorResponse(code, auth.error, auth.status);
  }

  const db = env.DB;
  if (!db) throw databaseUnavailableError("D1_ERROR: DB binding not available");

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

async function handleUpdatePassword(context: AstroApiContext): Promise<Response> {
  const request = context.request;
  const env = getRuntimeEnv();
  const auth = await authMiddleware(request, env);
  if (!auth.authenticated) {
    const code = auth.status === 503 ? "DATABASE_UNAVAILABLE" : "UNAUTHORIZED";
    return errorResponse(code, auth.error, auth.status);
  }

  let body: { currentPassword: string; newPassword: string };
  try {
    body = await request.json();
  } catch {
    return errorResponse("INVALID_INPUT", "Invalid request body", 400);
  }

  if (!body.currentPassword || !body.newPassword) return errorResponse("INVALID_INPUT", "Current and new password are required", 400);
  if (body.newPassword.length < 8) return errorResponse("INVALID_INPUT", "New password must be at least 8 characters", 400);

  const db = env.DB;
  if (!db) throw databaseUnavailableError("D1_ERROR: DB binding not available");

  const userRepo = new UserRepository(db);
  const authService = new AuthService(userRepo, env.PASSWORD_PEPPER as string, env);

  const result = await authService.changePassword(auth.context.userId, body.currentPassword, body.newPassword);
  if (result.error) {
    if (result.error === "INVALID_CURRENT_PASSWORD") return errorResponse("INVALID_CURRENT_PASSWORD", "Current password is incorrect", 401);
    if (result.error === "USER_NOT_FOUND") return errorResponse("USER_NOT_FOUND", "User not found", 404);
    return errorResponse("SERVER_ERROR", "Password update failed", 500);
  }

  return jsonResponse({ success: true });
}

async function handleUpdatePreferences(context: AstroApiContext): Promise<Response> {
  const request = context.request;
  const env = getRuntimeEnv();
  const auth = await authMiddleware(request, env);
  if (!auth.authenticated) {
    const code = auth.status === 503 ? "DATABASE_UNAVAILABLE" : "UNAUTHORIZED";
    return errorResponse(code, auth.error, auth.status);
  }

  let body: { personality?: string; theme?: "light" | "dark" };
  try {
    body = await request.json();
  } catch {
    return errorResponse("INVALID_INPUT", "Invalid request body", 400);
  }

  if (body.personality && !isValidPersonality(body.personality)) {
    body.personality = "default";
  }

  const db = env.DB;
  if (!db) throw databaseUnavailableError("D1_ERROR: DB binding not available");

  const userRepo = new UserRepository(db);
  const authService = new AuthService(userRepo, env.PASSWORD_PEPPER as string, env);

  const result = await authService.updatePreferences(auth.context.userId, body);
  if (result.error) {
    if (result.error === "USER_NOT_FOUND") return errorResponse("USER_NOT_FOUND", "User not found", 404);
    return errorResponse("SERVER_ERROR", "Preferences update failed", 500);
  }

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

async function handleUnlinkGoogle(context: AstroApiContext): Promise<Response> {
  const request = context.request;
  const env = getRuntimeEnv();
  const auth = await authMiddleware(request, env);
  if (!auth.authenticated) {
    const code = auth.status === 503 ? "DATABASE_UNAVAILABLE" : "UNAUTHORIZED";
    return errorResponse(code, auth.error, auth.status);
  }

  const db = env.DB;
  if (!db) throw databaseUnavailableError("D1_ERROR: DB binding not available");

  const userRepo = new UserRepository(db);
  const user = await userRepo.findById(auth.context.userId);
  if (!user) return errorResponse("USER_NOT_FOUND", "User not found", 404);
  if (!user.googleId) return errorResponse("NOT_LINKED", "Google account is not linked", 400);
  if (!user.passwordHash) return errorResponse("NO_PASSWORD_SET", "Must set a password before unlinking Google", 400);

  const updatedUser = await userRepo.unlinkGoogle(auth.context.userId);
  if (!updatedUser) return errorResponse("USER_NOT_FOUND", "User not found", 404);
  return jsonResponse({ success: true });
}

export const GET = (context: any) =>
  withDatabaseErrorResponse(context, () => handleGET(context));

export const PUT = (context: any) =>
  withDatabaseErrorResponse(context, () => handlePUT(context));

export const POST = (context: any) =>
  withDatabaseErrorResponse(context, () => handlePOST(context));
