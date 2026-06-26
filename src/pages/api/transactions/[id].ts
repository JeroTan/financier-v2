import { TransactionRepository } from "@/server/repositories/transactionRepository";
import { CategoryRepository } from "@/server/repositories/categoryRepository";
import { authMiddleware } from "@/server/middleware/auth";
import { getRuntimeEnv } from "@/server/context/bindings";
import { databaseUnavailableError, withDatabaseErrorResponse } from "@/server/http/databaseErrorResponse";
import { updateTransactionRequestSchema } from "@/server/dto/transaction";
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

function getTransactionId(context: any): string | null {
  const id = context.params?.id;
  return typeof id === "string" && id.trim() ? id.trim() : null;
}

const handlePUT = async (context: any) => {
  const request = context.request;
  const env = getRuntimeEnv();
  const id = getTransactionId(context);

  if (!id) return errorResponse("INVALID_INPUT", "Transaction id is required", 400);

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

  const parseResult = updateTransactionRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return errorResponse("INVALID_INPUT", parseResult.error.message, 400);
  }

  const db = env.DB;
  if (!db) throw databaseUnavailableError("D1_ERROR: DB binding not available");

  const transactionRepo = new TransactionRepository(db);
  const categoryRepo = new CategoryRepository(db);
  const data = parseResult.data;
  const updates = {
    type: data.type,
    amount: data.amount,
    currency: data.currency,
    date: data.date,
    description: data.description,
    receiptUrl: data.receiptUrl ?? undefined,
    categoryId: undefined as string | undefined,
  };

  if (data.category !== undefined) {
    const matchedCategory = await categoryRepo.findOrCreateCategory(auth.context.userId, data.category);
    updates.categoryId = matchedCategory.id;
  }

  const transaction = await transactionRepo.updateTransaction(id, auth.context.userId, updates);
  if (!transaction) {
    return errorResponse("NOT_FOUND", "Transaction not found", 404);
  }

  return jsonResponse({ success: true, data: transaction });
};

const handleDELETE = async (context: any) => {
  const request = context.request;
  const env = getRuntimeEnv();
  const id = getTransactionId(context);

  if (!id) return errorResponse("INVALID_INPUT", "Transaction id is required", 400);

  const auth = await authMiddleware(request, env);
  if (!auth.authenticated) {
    const code = auth.status === 503 ? "DATABASE_UNAVAILABLE" : "UNAUTHORIZED";
    return errorResponse(code, auth.error, auth.status);
  }

  const db = env.DB;
  if (!db) throw databaseUnavailableError("D1_ERROR: DB binding not available");

  const repo = new TransactionRepository(db);
  const deleted = await repo.deleteTransaction(id, auth.context.userId);
  if (!deleted) {
    return errorResponse("NOT_FOUND", "Transaction not found", 404);
  }

  return jsonResponse({ success: true, data: { id } });
};

export const PUT = (context: any) =>
  withDatabaseErrorResponse(context, () => handlePUT(context));

export const DELETE = (context: any) =>
  withDatabaseErrorResponse(context, () => handleDELETE(context));
