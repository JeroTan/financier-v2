import { TransactionRepository } from "@/server/repositories/transactionRepository";
import { authMiddleware } from "@/server/middleware/auth";
import { getRuntimeEnv } from "@/server/context/bindings";
import { getPeriodRange } from "@/server/utils/dateRange";
import { databaseUnavailableError, withDatabaseErrorResponse } from "@/server/http/databaseErrorResponse";
import { statsQuerySchema } from "@/server/dto/stats";
import "./routes";

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function errorResponse(code: string, message: string, status: number): Response {
  return jsonResponse({ error: { code, message } }, status);
}

const handleGET = async (context: any) => {
  const request = context.request;
  const env = getRuntimeEnv();

  const auth = await authMiddleware(request, env);
  if (!auth.authenticated) {
    const code = auth.status === 503 ? "DATABASE_UNAVAILABLE" : "UNAUTHORIZED";
    return errorResponse(code, auth.error, auth.status);
  }

  const url = new URL(request.url);
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const parseResult = statsQuerySchema.safeParse(params);
  if (!parseResult.success) {
    return errorResponse("INVALID_INPUT", parseResult.error.message, 400);
  }

  const db = env.DB;
  if (!db) {
    throw databaseUnavailableError("D1_ERROR: DB binding not available");
  }

  const { period, date } = parseResult.data;
  const { startDate, endDate } = getPeriodRange(period, date);
  const repo = new TransactionRepository(db);
  const result = await repo.aggregateTransactions({
    userId: auth.context.userId,
    startDate,
    endDate,
  });

  return jsonResponse({ success: true, data: result });
};

export const GET = (context: any) =>
  withDatabaseErrorResponse(context, () => handleGET(context));
