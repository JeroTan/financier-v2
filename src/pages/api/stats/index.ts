import { z } from "zod";
import { routeDetail } from "@/server/openapi/route-metadata";
import { TransactionRepository } from "@/server/repositories/transactionRepository";
import { authMiddleware } from "@/server/middleware/auth";

const statsQuerySchema = z.object({
  period: z.enum(["daily", "monthly", "yearly"]).default("monthly"),
  date: z.string().date().optional(),
});

export const getStatsRouteDetail = routeDetail("GET", "/api/stats", {
  summary: "Get financial statistics",
  description: "Returns aggregated income, expenses, and net for the specified period.",
  tags: ["Stats"],
  auth: true,
  request: {
    query: statsQuerySchema,
  },
  response: {
    description: "Financial statistics",
    schema: z.object({
      success: z.literal(true),
      data: z.object({
        totalIncome: z.number(),
        totalExpenses: z.number(),
        net: z.number(),
      }),
    }),
  },
  errorCodes: [
    { code: "INVALID_INPUT", status: 400, description: "Invalid query parameters" },
    { code: "UNAUTHORIZED", status: 401, description: "Authentication required" },
    { code: "SERVER_ERROR", status: 500, description: "Database error" },
  ],
});

type AppLocals = {
  db?: D1Database;
};

function getLocals(request: Request): AppLocals {
  return ((request as any).locals ?? {}) as AppLocals;
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function errorResponse(code: string, message: string, status: number): Response {
  return jsonResponse({ error: { code, message } }, status);
}

function getDateRange(period: string, dateStr?: string): { startDate: string; endDate: string } {
  const refDate = dateStr ? new Date(dateStr) : new Date();

  if (period === "daily") {
    const start = new Date(refDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(refDate);
    end.setHours(23, 59, 59, 999);
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }

  if (period === "monthly") {
    const start = new Date(refDate.getFullYear(), refDate.getMonth(), 1);
    const end = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 0, 23, 59, 59, 999);
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }

  // yearly
  const start = new Date(refDate.getFullYear(), 0, 1);
  const end = new Date(refDate.getFullYear(), 11, 31, 23, 59, 59, 999);
  return { startDate: start.toISOString(), endDate: end.toISOString() };
}

export const GET = async (context: any) => {
  const request = context.request;
  const locals = getLocals(request);
  const env = (context as any).env as Record<string, unknown> | undefined;

  const auth = await authMiddleware(request, env ?? {});
  if (!auth.authenticated) return errorResponse("UNAUTHORIZED", auth.error, auth.status);

  const url = new URL(request.url);
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => { params[key] = value; });

  const parseResult = statsQuerySchema.safeParse(params);
  if (!parseResult.success) {
    return errorResponse("INVALID_INPUT", parseResult.error.message, 400);
  }

  const db = locals.db;
  if (!db) return errorResponse("SERVER_ERROR", "Database not available", 500);

  const { period, date } = parseResult.data;
  const { startDate, endDate } = getDateRange(period, date);

  const repo = new TransactionRepository(db);
  const result = await repo.aggregateTransactions({
    userId: auth.context.userId,
    startDate,
    endDate,
  });

  return jsonResponse({
    success: true,
    data: {
      totalIncome: result.totalIncome,
      totalExpenses: result.totalExpenses,
      net: result.net,
    },
  });
};
