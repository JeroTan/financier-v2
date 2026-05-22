import { setApiAccessToken } from "@/lib/api/client";

export type AuthEndpoint = "/api/auth/login" | "/api/auth/register";

export type AuthCredentials = {
  email: string;
  password: string;
};

export type AuthPayload = {
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
};

type AuthSuccessResponse = {
  success?: boolean;
  data?: AuthPayload;
};

type AuthErrorResponse = {
  error?: {
    code?: string;
    message?: string;
  };
};

export class AuthRequestError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "AuthRequestError";
  }
}

export async function submitEmailAuth(
  endpoint: AuthEndpoint,
  credentials: AuthCredentials,
): Promise<AuthPayload> {
  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
  } catch (error) {
    throw new AuthRequestError(
      "NETWORK_ERROR",
      error instanceof Error ? error.message : "Network request failed",
      0,
    );
  }

  const json = await readAuthJson(response);

  if (!response.ok) {
    const errorBody = json as AuthErrorResponse;
    throw new AuthRequestError(
      errorBody.error?.code ?? "HTTP_ERROR",
      errorBody.error?.message ?? response.statusText,
      response.status,
    );
  }

  const successBody = json as AuthSuccessResponse;
  if (!successBody.data?.accessToken) {
    throw new AuthRequestError("INVALID_RESPONSE", "Authentication response was incomplete", response.status);
  }

  setApiAccessToken(successBody.data.accessToken);
  return successBody.data;
}

export function getAuthErrorMessage(code: string, fallback?: string): string {
  switch (code) {
    case "EMAIL_EXISTS":
      return "Email already registered. Sign in instead or use another email.";
    case "INVALID_CREDENTIALS":
      return "Invalid email or password.";
    case "INVALID_INPUT":
      return fallback || "Check your email and password, then try again.";
    case "RATE_LIMITED":
      return "Too many attempts. Wait a bit, then try again.";
    case "NETWORK_ERROR":
      return "Network failed. Check your connection, then try again.";
    default:
      return "Authentication failed. Please try again.";
  }
}

export function getOAuthErrorMessage(message: string | null): string {
  if (!message) return "Google sign-in failed. Please try again.";

  switch (message) {
    case "access_denied":
    case "OAUTH_DENIED":
      return "Google sign-in was cancelled.";
    case "missing_code":
      return "Google did not return an authorization code. Please try again.";
    case "EMAIL_NOT_VERIFIED":
      return "Google email is not verified. Use another account.";
    default:
      return "Google sign-in failed. Please try again.";
  }
}

async function readAuthJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return {};
  }
}
