import { describe, expect, it } from "vitest";

import {
  createTransactionRequestSchema,
  paginatedTransactionsSchema,
  transactionResponseSchema,
  updateTransactionRequestSchema,
} from "./transaction";
import { statsResponseSchema } from "./stats";

const transaction = {
  id: "transaction-1",
  userId: "user-1",
  type: "expense",
  amount: 50,
  currency: "PHP",
  categoryId: null,
  description: "Lunch",
  date: "2026-06-19T00:00:00.000Z",
  receiptUrl: null,
  createdAt: "2026-06-19T00:00:00.000Z",
  updatedAt: "2026-06-19T00:00:00.000Z",
};

describe("API contracts", () => {
  it("accepts the manual transaction entry payload", () => {
    expect(createTransactionRequestSchema.safeParse({
      type: "expense",
      amount: 50,
      category: "Food",
      description: "Lunch",
      date: "2026-06-19",
    }).success).toBe(true);
  });

  it("accepts transaction update payloads", () => {
    expect(updateTransactionRequestSchema.safeParse({
      amount: 75,
      category: "Food",
      description: "Dinner",
    }).success).toBe(true);

    expect(updateTransactionRequestSchema.safeParse({}).success).toBe(false);
  });

  it("uses the persisted transaction shape for create and list responses", () => {
    expect(transactionResponseSchema.safeParse({
      success: true,
      data: transaction,
    }).success).toBe(true);

    expect(paginatedTransactionsSchema.safeParse({
      success: true,
      data: {
        transactions: [transaction],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
    }).success).toBe(true);
  });

  it("uses the stats fields consumed by the frontend", () => {
    expect(statsResponseSchema.safeParse({
      success: true,
      data: {
        totalIncome: 100,
        totalExpenses: 50,
        net: 50,
        topCategories: [],
      },
    }).success).toBe(true);
  });
});
