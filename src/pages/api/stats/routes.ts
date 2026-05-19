import { routeDetail } from "@/server/openapi/route-metadata";
import { statsQuerySchema } from "@/server/dto/stats";
import { z } from "zod";

const statsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    income: z.number(),
    expenses: z.number(),
    net: z.number(),
    period: z.enum(["daily", "monthly", "yearly"]),
    breakdown: z.array(z.object({
      date: z.string(),
      income: z.number(),
      expenses: z.number(),
    })).optional(),
  }),
});

export const getStatsDetail = routeDetail("GET", "/api/stats", {
  summary: "Get financial statistics",
  description: "Returns income, expenses, and net statistics for the specified period. Optionally includes a date-based breakdown.",
  tags: ["Stats"],
  auth: true,
  request: {
    query: statsQuerySchema,
  },
  response: {
    schema: statsResponseSchema,
    description: "Financial statistics for the requested period",
  },
});
