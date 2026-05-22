import { z } from "zod";
import { routeDetail } from "@/server/openapi/route-metadata";
import { TransactionRepository } from "@/server/repositories/transactionRepository";
import { CategoryRepository } from "@/server/repositories/categoryRepository";
import { authMiddleware } from "@/server/middleware/auth";
import { getRuntimeEnv } from "@/server/context/bindings";

const createTransactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive().max(999999999),
  date: z.string().datetime().or(z.string().date()),
  category: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  receiptUrl: z.string().url().optional(),
});

const listTransactionsSchema = z.object({
  type: z.enum(["income", "expense"]).optional(),
  search: z.string().max(200).optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const createTransactionRouteDetail = routeDetail("POST", "/api/transactions", {
  summary: "Create a new transaction",
  description: "Creates a new income or expense transaction. Requires authentication. The transaction is saved to D1 and a success response is returned.",
  tags: ["Transactions"],
  auth: true,
  request: {
    body: createTransactionSchema,
  },
  response: {
    description: "Transaction created successfully",
    schema: z.object({
      success: z.literal(true),
      data: z.object({
        id: z.string(),
        type: z.string(),
        amount: z.number(),
        date: z.string(),
        category: z.string(),
        description: z.string(),
      }),
    }),
  },
  errorCodes: [
    { code: "INVALID_INPUT", status: 400, description: "Invalid request body" },
    { code: "UNAUTHORIZED", status: 401, description: "Authentication required" },
    { code: "SERVER_ERROR", status: 500, description: "Database error" },
  ],
});

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function errorResponse(code: string, message: string, status: number): Response {
  return jsonResponse({ error: { code, message } }, status);
}

export const listTransactionsRouteDetail = routeDetail("GET", "/api/transactions", {
  summary: "List transactions with filters",
  description: "Returns a paginated list of transactions for the authenticated user. Supports filtering by type, search, and date range.",
  tags: ["Transactions"],
  auth: true,
  request: {
    query: listTransactionsSchema,
  },
  response: {
    description: "Paginated list of transactions",
    schema: z.object({
      success: z.literal(true),
      data: z.object({
        transactions: z.array(z.object({
          id: z.string(),
          type: z.string(),
          amount: z.number(),
          date: z.string(),
          description: z.string().nullable(),
          categoryId: z.string().nullable(),
          receiptUrl: z.string().nullable(),
        })),
        total: z.number(),
        page: z.number(),
        limit: z.number(),
        totalPages: z.number(),
      }),
    }),
  },
  errorCodes: [
    { code: "INVALID_INPUT", status: 400, description: "Invalid query parameters" },
    { code: "UNAUTHORIZED", status: 401, description: "Authentication required" },
    { code: "SERVER_ERROR", status: 500, description: "Database error" },
  ],
});

export const POST = async (context: any) => {
  const request = context.request;
  const env = getRuntimeEnv();

  const auth = await authMiddleware(request, env);
  if (!auth.authenticated) return errorResponse("UNAUTHORIZED", auth.error, auth.status);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("INVALID_INPUT", "Invalid request body", 400);
  }

  const parseResult = createTransactionSchema.safeParse(body);
  if (!parseResult.success) {
    return errorResponse("INVALID_INPUT", parseResult.error.message, 400);
  }

  const db = env.DB;
  if (!db) return errorResponse("SERVER_ERROR", "Database not available", 500);

  const repo = new TransactionRepository(db);
  const categoryRepo = new CategoryRepository(db);
  const data = parseResult.data;

  const categories = await categoryRepo.getCategoriesByUserId(auth.context.userId);
  const matchedCategory = categories.find((c) => c.name.toLowerCase() === data.category.toLowerCase());

  const transaction = await repo.createTransaction({
    id: crypto.randomUUID(),
    userId: auth.context.userId,
    type: data.type,
    amount: data.amount,
    date: data.date,
    categoryId: matchedCategory?.id ?? null,
    description: data.description,
    receiptUrl: data.receiptUrl ?? null,
  });

  if (!transaction) return errorResponse("SERVER_ERROR", "Failed to create transaction", 500);

  return jsonResponse({
    success: true,
    data: {
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      date: transaction.date,
      categoryId: transaction.categoryId,
      description: transaction.description,
    },
  });
};

export const GET = async (context: any) => {
  const request = context.request;
  const env = getRuntimeEnv();

  const auth = await authMiddleware(request, env);
  if (!auth.authenticated) return errorResponse("UNAUTHORIZED", auth.error, auth.status);

  const url = new URL(request.url);
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => { params[key] = value; });

  const parseResult = listTransactionsSchema.safeParse(params);
  if (!parseResult.success) {
    return errorResponse("INVALID_INPUT", parseResult.error.message, 400);
  }

  const db = env.DB;
  if (!db) return errorResponse("SERVER_ERROR", "Database not available", 500);

  const repo = new TransactionRepository(db);
  const { type, search, startDate, endDate, page, limit } = parseResult.data;

  const result = await repo.getTransactions({
    userId: auth.context.userId,
    type,
    search,
    startDate,
    endDate,
    limit,
    offset: (page - 1) * limit,
  });

  const totalPages = Math.ceil(result.total / limit);

  return jsonResponse({
    success: true,
    data: {
      transactions: result.transactions,
      total: result.total,
      page,
      limit,
      totalPages,
    },
  });
};
