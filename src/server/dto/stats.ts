import { z } from "zod";

export const statsQuerySchema = z.object({
  period: z.enum(["daily", "monthly", "yearly"]).default("monthly"),
  date: z.string().date().optional(),
});

export const statsResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    totalIncome: z.number(),
    totalExpenses: z.number(),
    net: z.number(),
  }),
});

export type StatsQueryInput = z.infer<typeof statsQuerySchema>;
