import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).optional(),
  googleId: z.string().optional(),
});

export const updateUserSettingsSchema = z.object({
  personality: z.string().optional(),
  theme: z.enum(["light", "dark"]).optional(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserSettingsInput = z.infer<typeof updateUserSettingsSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
