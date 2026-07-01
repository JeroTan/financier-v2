import { TransactionRepository } from "@/server/repositories/transactionRepository";
import { CategoryRepository } from "@/server/repositories/categoryRepository";
import { authMiddleware } from "@/server/middleware/auth";
import { getRuntimeEnv } from "@/server/context/bindings";
import { databaseUnavailableError, withDatabaseErrorResponse } from "@/server/http/databaseErrorResponse";
import {
  createTransactionRequestSchema,
  transactionQuerySchema,
} from "@/server/dto/transaction";
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

const handlePOST = async (context: any) => {
  const request = context.request;
  const env = getRuntimeEnv();

  const auth = await authMiddleware(request, env);
  if (!auth.authenticated) {
    const code = auth.status === 503 ? "DATABASE_UNAVAILABLE" : "UNAUTHORIZED";
    return errorResponse(code, auth.error, auth.status);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("INVALID_INPUT", "Invalid request body", 400);
  }

  const parseResult = createTransactionRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return errorResponse("INVALID_INPUT", parseResult.error.message, 400);
  }

  const db = env.DB;
  if (!db) {
    throw databaseUnavailableError("D1_ERROR: DB binding not available");
  }

  const transactionRepo = new TransactionRepository(db);
  const categoryRepo = new CategoryRepository(db);
  const data = parseResult.data;

  const matchedCategory = await categoryRepo.findOrCreateCategory(auth.context.userId, data.category);

  const transaction = await transactionRepo.createTransaction({
    id: crypto.randomUUID(),
    userId: auth.context.userId,
    type: data.type,
    amount: data.amount,
    currency: data.currency,
    date: data.date,
    categoryId: matchedCategory.id,
    description: data.description,
    receiptUrl: data.receiptUrl ?? null,
  });

  return jsonResponse({ success: true, data: transaction });
};

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

  const parseResult = transactionQuerySchema.safeParse(params);
  if (!parseResult.success) {
    return errorResponse("INVALID_INPUT", parseResult.error.message, 400);
  }

  const db = env.DB;
  if (!db) {
    throw databaseUnavailableError("D1_ERROR: DB binding not available");
  }

  const repo = new TransactionRepository(db);
  const {
    type,
    categoryId,
    search,
    startDate,
    endDate,
    page,
    limit,
  } = parseResult.data;

  const result = await repo.getTransactions({
    userId: auth.context.userId,
    type,
    categoryId,
    search,
    startDate,
    endDate,
    limit,
    offset: (page - 1) * limit,
  });

  return jsonResponse({
    success: true,
    data: {
      transactions: result.transactions,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    },
  });
};

export const POST = (context: any) =>
  withDatabaseErrorResponse(context, () => handlePOST(context));

export const GET = (context: any) =>
  withDatabaseErrorResponse(context, () => handleGET(context));
