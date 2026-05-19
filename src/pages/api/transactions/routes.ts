import { routeDetail } from "@/server/openapi/route-metadata";
import { createTransactionSchema, transactionQuerySchema } from "@/server/dto/transaction";
import { z } from "zod";

const transactionResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.string(),
    type: z.enum(["income", "expense"]),
    amount: z.number(),
    currency: z.string(),
    categoryId: z.string().nullable(),
    description: z.string().nullable(),
    date: z.string(),
    receiptUrl: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});

const paginatedTransactionsSchema = z.object({
  success: z.boolean(),
  data: z.object({
    items: z.array(transactionResponseSchema.shape.data),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

export const createTransactionDetail = routeDetail("POST", "/api/transactions", {
  summary: "Create a transaction",
  description: "Creates a new income or expense transaction.",
  tags: ["Transactions"],
  auth: true,
  request: {
    body: createTransactionSchema,
  },
  response: {
    schema: transactionResponseSchema,
    description: "Transaction created successfully",
  },
  errorCodes: [
    { code: "INVALID_INPUT", status: 400, description: "Invalid transaction data" },
    { code: "CATEGORY_NOT_FOUND", status: 404, description: "Specified category does not exist" },
  ],
});

export const listTransactionsDetail = routeDetail("GET", "/api/transactions", {
  summary: "List transactions",
  description: "Returns a paginated list of transactions with optional filtering by type, search, date range, and category.",
  tags: ["Transactions"],
  auth: true,
  request: {
    query: transactionQuerySchema,
  },
  response: {
    schema: paginatedTransactionsSchema,
    description: "Paginated list of transactions",
  },
});
