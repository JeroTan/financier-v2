import { routeDetail } from "@/server/openapi/route-metadata";
import {
  createTransactionRequestSchema,
  paginatedTransactionsSchema,
  transactionQuerySchema,
  transactionResponseSchema,
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
