import { z } from "zod";

export const statsQuerySchema = z.object({
  period: z.enum(["daily", "monthly", "yearly"]).default("monthly"),
  date: z.string().date().optional(),
});

export type StatsQueryInput = z.infer<typeof statsQuerySchema>;
