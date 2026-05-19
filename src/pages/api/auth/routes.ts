import { routeDetail } from "@/server/openapi/route-metadata";
import { createUserSchema } from "@/server/dto/user";
import { z } from "zod";

const authResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    userId: z.string(),
    email: z.string(),
    accessToken: z.string(),
    refreshToken: z.string(),
  }),
});

export const registerDetail = routeDetail("POST", "/api/auth/register", {
  summary: "Register a new user",
  description: "Creates a new user account with email and password. Returns access and refresh tokens.",
  tags: ["Auth"],
  auth: false,
  rateLimitClass: "auth",
  request: {
    body: z.object({
      email: z.string().email(),
      password: z.string().min(8),
    }),
  },
  response: {
    schema: authResponseSchema,
    description: "User registered successfully with tokens",
  },
  errorCodes: [
    { code: "EMAIL_EXISTS", status: 409, description: "Email already registered" },
    { code: "INVALID_INPUT", status: 400, description: "Invalid email or password format" },
  ],
});

export const loginDetail = routeDetail("POST", "/api/auth/login", {
  summary: "Login with email and password",
  description: "Authenticates user with email and password. Returns access and refresh tokens.",
  tags: ["Auth"],
  auth: false,
  rateLimitClass: "auth",
  request: {
    body: z.object({
      email: z.string().email(),
      password: z.string(),
    }),
  },
  response: {
    schema: authResponseSchema,
    description: "Login successful with tokens",
  },
  errorCodes: [
    { code: "INVALID_CREDENTIALS", status: 401, description: "Invalid email or password" },
    { code: "ACCOUNT_LOCKED", status: 423, description: "Account temporarily locked due to too many failed attempts" },
  ],
});

export const logoutDetail = routeDetail("POST", "/api/auth/logout", {
  summary: "Logout user",
  description: "Invalidates the current refresh token and logs out the user.",
  tags: ["Auth"],
  auth: true,
  response: {
    schema: z.object({ success: z.boolean() }),
    description: "Logout successful",
  },
});

export const refreshDetail = routeDetail("POST", "/api/auth/refresh", {
  summary: "Refresh access token",
  description: "Uses a valid refresh token to obtain a new access token pair.",
  tags: ["Auth"],
  auth: false,
  rateLimitClass: "auth",
  request: {
    body: z.object({
      refreshToken: z.string(),
    }),
  },
  response: {
    schema: z.object({
      success: z.boolean(),
      data: z.object({
        accessToken: z.string(),
        refreshToken: z.string(),
      }),
    }),
    description: "Tokens refreshed successfully",
  },
  errorCodes: [
    { code: "INVALID_REFRESH_TOKEN", status: 401, description: "Refresh token is invalid or expired" },
    { code: "TOKEN_REVOKED", status: 401, description: "Refresh token has been revoked" },
  ],
});

export const googleAuthDetail = routeDetail("GET", "/api/auth/google", {
  summary: "Initiate Google OAuth login",
  description: "Redirects the user to Google's OAuth consent screen.",
  tags: ["Auth"],
  auth: false,
  response: {
    description: "Redirect to Google OAuth",
  },
});

export const googleCallbackDetail = routeDetail("GET", "/api/auth/google/callback", {
  summary: "Google OAuth callback",
  description: "Handles the callback from Google OAuth. Creates or logs in the user and redirects with tokens.",
  tags: ["Auth"],
  auth: false,
  request: {
    query: z.object({
      code: z.string().optional(),
      state: z.string().optional(),
      error: z.string().optional(),
    }),
  },
  response: {
    description: "Redirect to app with auth tokens or error",
  },
  errorCodes: [
    { code: "OAUTH_DENIED", status: 400, description: "User denied Google OAuth consent" },
    { code: "OAUTH_FAILED", status: 400, description: "Google OAuth failed" },
  ],
});
