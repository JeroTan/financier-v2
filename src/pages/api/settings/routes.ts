import { routeDetail } from "@/server/openapi/route-metadata";
import { updateUserSettingsSchema, updatePasswordSchema } from "@/server/dto/user";
import { z } from "zod";

const profileResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.string(),
    email: z.string(),
    personality: z.string().nullable(),
    theme: z.enum(["light", "dark"]).nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});

export const getSettingsDetail = routeDetail("GET", "/api/settings", {
  summary: "Get user profile",
  description: "Returns the authenticated user's profile settings including personality and theme preferences.",
  tags: ["Settings"],
  auth: true,
  response: {
    schema: profileResponseSchema,
    description: "User profile retrieved successfully",
  },
});

export const updatePasswordDetail = routeDetail("PUT", "/api/settings/password", {
  summary: "Update password",
  description: "Changes the user's password. Requires the current password for verification.",
  tags: ["Settings"],
  auth: true,
  request: {
    body: updatePasswordSchema,
  },
  response: {
    schema: z.object({ success: z.boolean() }),
    description: "Password updated successfully",
  },
  errorCodes: [
    { code: "INVALID_CURRENT_PASSWORD", status: 401, description: "Current password is incorrect" },
    { code: "INVALID_INPUT", status: 400, description: "New password must be at least 8 characters" },
  ],
});

export const updatePreferencesDetail = routeDetail("PUT", "/api/settings/preferences", {
  summary: "Update user preferences",
  description: "Updates the user's personality and theme preferences.",
  tags: ["Settings"],
  auth: true,
  request: {
    body: updateUserSettingsSchema,
  },
  response: {
    schema: profileResponseSchema,
    description: "Preferences updated successfully",
  },
});

export const unlinkGoogleDetail = routeDetail("POST", "/api/settings/unlink-google", {
  summary: "Unlink Google account",
  description: "Removes the Google OAuth link from the user's account. Requires a password to be set first.",
  tags: ["Settings"],
  auth: true,
  response: {
    schema: z.object({ success: z.boolean() }),
    description: "Google account unlinked successfully",
  },
  errorCodes: [
    { code: "NO_PASSWORD_SET", status: 400, description: "Must set a password before unlinking Google" },
    { code: "NOT_LINKED", status: 400, description: "Google account is not linked" },
  ],
});
