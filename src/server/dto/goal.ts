import { z } from "zod";

export const createGoalSchema = z.object({
  type: z.enum(["daily", "monthly", "yearly"]),
  targetAmount: z.number().positive("Target amount must be greater than 0"),
  categoryId: z.string().optional(),
  startDate: z.string().date(),
  endDate: z.string().date(),
});

export const updateGoalSchema = createGoalSchema.partial();

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
