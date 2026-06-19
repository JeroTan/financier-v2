import { routeDetail } from "@/server/openapi/route-metadata";
import { statsQuerySchema, statsResponseSchema } from "@/server/dto/stats";

export const getStatsDetail = routeDetail("GET", "/api/stats", {
  summary: "Get financial statistics",
  description: "Returns total income, expenses, and net for the specified period.",
  tags: ["Stats"],
  auth: true,
  request: {
    query: statsQuerySchema,
  },
  response: {
    schema: statsResponseSchema,
    description: "Financial statistics for the requested period",
  },
  errorCodes: [
    { code: "INVALID_INPUT", status: 400, description: "Invalid query parameters" },
    { code: "UNAUTHORIZED", status: 401, description: "Authentication required" },
    { code: "DATABASE_UNAVAILABLE", status: 503, description: "Database temporarily unavailable" },
  ],
});
