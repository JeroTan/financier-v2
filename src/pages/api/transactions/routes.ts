import { z } from "zod";
import { routeDetail } from "@/server/openapi/route-metadata";
import {
  createTransactionRequestSchema,
  paginatedTransactionsSchema,
  transactionQuerySchema,
  transactionResponseSchema,
  updateTransactionRequestSchema,
} from "@/server/dto/transaction";

export const createTransactionDetail = routeDetail("POST", "/api/transactions", {
  summary: "Create a transaction",
  description: "Creates a new income or expense transaction.",
  tags: ["Transactions"],
  auth: true,
  request: {
    body: createTransactionRequestSchema,
  },
  response: {
    schema: transactionResponseSchema,
    description: "Transaction created successfully",
  },
  errorCodes: [
    { code: "INVALID_INPUT", status: 400, description: "Invalid transaction data" },
    { code: "UNAUTHORIZED", status: 401, description: "Authentication required" },
    { code: "DATABASE_UNAVAILABLE", status: 503, description: "Database temporarily unavailable" },
  ],
});

export const listTransactionsDetail = routeDetail("GET", "/api/transactions", {
  summary: "List transactions",
  description: "Returns a paginated list of transactions with optional filtering.",
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

export const updateTransactionDetail = routeDetail("PUT", "/api/transactions/{id}", {
  summary: "Update a transaction",
  description: "Updates one authenticated user's transaction.",
  tags: ["Transactions"],
  auth: true,
  request: {
    body: updateTransactionRequestSchema,
  },
  response: {
    schema: transactionResponseSchema,
    description: "Transaction updated successfully",
  },
  errorCodes: [
    { code: "INVALID_INPUT", status: 400, description: "Invalid transaction data" },
    { code: "UNAUTHORIZED", status: 401, description: "Authentication required" },
    { code: "NOT_FOUND", status: 404, description: "Transaction not found" },
    { code: "DATABASE_UNAVAILABLE", status: 503, description: "Database temporarily unavailable" },
  ],
});

export const deleteTransactionDetail = routeDetail("DELETE", "/api/transactions/{id}", {
  summary: "Delete a transaction",
  description: "Deletes one authenticated user's transaction.",
  tags: ["Transactions"],
  auth: true,
  response: {
    schema: z.object({
      success: z.literal(true),
      data: z.object({
        id: z.string(),
      }),
    }),
    description: "Transaction deleted successfully",
  },
  errorCodes: [
    { code: "UNAUTHORIZED", status: 401, description: "Authentication required" },
    { code: "NOT_FOUND", status: 404, description: "Transaction not found" },
    { code: "DATABASE_UNAVAILABLE", status: 503, description: "Database temporarily unavailable" },
  ],
});
