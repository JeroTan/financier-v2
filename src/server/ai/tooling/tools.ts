import type { TransactionRepository } from "@/server/repositories/transactionRepository";
import type { CategoryRepository } from "@/server/repositories/categoryRepository";
import type { CreateTransactionInput, UpdateTransactionInput } from "@/server/dto/transaction";

export type ToolCall = {
  id?: string;
  name: string;
  arguments: Record<string, unknown>;
};

export type ToolResult = {
  success: boolean;
  data?: unknown;
  error?: string;
};

export type ToolDefinition = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<ToolResult>;
};

export function createToolDefinitions(
  transactionRepo: TransactionRepository,
  categoryRepo: CategoryRepository,
  userId: string,
): ToolDefinition[] {
  return [
    {
      name: "createTransaction",
      description: "Create a new income or expense transaction. Requires explicit user confirmation before calling.",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["income", "expense"], description: "Transaction type" },
          amount: { type: "number", description: "Transaction amount" },
          currency: { type: "string", default: "PHP", description: "Currency code" },
          category: { type: "string", description: "Human-readable category name" },
          description: { type: "string", description: "Transaction description" },
          date: { type: "string", format: "date", description: "Transaction date (ISO format)" },
        },
        required: ["type", "amount", "date"],
      },
      execute: async (args) => {
        try {
          const categoryId = await resolveCategoryId(categoryRepo, userId, stringArg(args.category));
          const input: CreateTransactionInput = {
            type: args.type as "income" | "expense",
            amount: Number(args.amount),
            currency: (args.currency as string) ?? "PHP",
            categoryId,
            description: args.description as string | undefined,
            date: args.date as string,
          };

          const transaction = await transactionRepo.createTransaction({
            id: crypto.randomUUID(),
            userId,
            ...input,
          });
          return { success: true, data: { id: transaction.id } };
        } catch (err) {
          return { success: false, error: err instanceof Error ? err.message : "Failed to create transaction" };
        }
      },
    },
    {
      name: "getTransactions",
      description: "Read transactions for the signed-in user. Use for lists, details, category questions, and finding past entries.",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["income", "expense"], description: "Filter by type" },
          startDate: { type: "string", format: "date", description: "Inclusive start date in YYYY-MM-DD format" },
          endDate: { type: "string", format: "date", description: "Inclusive end date in YYYY-MM-DD format" },
          category: { type: "string", description: "Filter by human-readable category name" },
          search: { type: "string", description: "Search transaction descriptions" },
          limit: { type: "number", default: 20, description: "Number of results, from 1 to 100" },
          offset: { type: "number", default: 0, description: "Offset for pagination" },
        },
      },
      execute: async (args) => {
        try {
          const categories = await categoryRepo.getCategoriesByUserId(userId);
          const categoryName = stringArg(args.category);
          const category = categoryName
            ? categories.find((item) => item.name.toLowerCase() === categoryName.toLowerCase())
            : undefined;

          if (categoryName && !category) {
            return {
              success: true,
              data: {
                transactions: [],
                total: 0,
                note: `No category named ${categoryName} exists.`,
              },
            };
          }

          const result = await transactionRepo.getTransactions({
            userId,
            type: transactionTypeArg(args.type),
            startDate: stringArg(args.startDate),
            endDate: stringArg(args.endDate),
            categoryId: category?.id,
            search: stringArg(args.search),
            limit: boundedInteger(args.limit, 20, 1, 100),
            offset: boundedInteger(args.offset, 0, 0, 100_000),
          });
          const categoryNames = new Map(categories.map((item) => [item.id, item.name]));
          return {
            success: true,
            data: {
              ...result,
              transactions: result.transactions.map((transaction) => ({
                ...transaction,
                category: transaction.categoryId
                  ? categoryNames.get(transaction.categoryId) ?? "Other"
                  : "Other",
              })),
            },
          };
        } catch (err) {
          return { success: false, error: err instanceof Error ? err.message : "Failed to get transactions" };
        }
      },
    },
    {
      name: "updateTransaction",
      description: "Update one existing transaction after the user explicitly confirms the exact change. Use getTransactions first to find the transaction id.",
      parameters: {
        type: "object",
        properties: {
          transactionId: { type: "string", description: "Existing transaction id from getTransactions" },
          type: { type: "string", enum: ["income", "expense"], description: "New transaction type" },
          amount: { type: "number", description: "New amount" },
          currency: { type: "string", description: "Currency code" },
          category: { type: "string", description: "New human-readable category name" },
          description: { type: "string", description: "New transaction description" },
          date: { type: "string", format: "date", description: "New transaction date in YYYY-MM-DD format" },
        },
        required: ["transactionId"],
      },
      execute: async (args) => {
        try {
          const transactionId = stringArg(args.transactionId);
          if (!transactionId) return { success: false, error: "transactionId is required" };

          const updates: UpdateTransactionInput = {};
          if (args.type === "income" || args.type === "expense") updates.type = args.type;
          if (args.amount !== undefined) {
            const amount = Number(args.amount);
            if (!Number.isFinite(amount) || amount <= 0) return { success: false, error: "amount must be positive" };
            updates.amount = amount;
          }
          const currency = stringArg(args.currency);
          if (currency !== undefined) updates.currency = currency;
          const description = stringArg(args.description);
          if (description !== undefined) updates.description = description;
          const date = stringArg(args.date);
          if (date !== undefined) updates.date = date;

          const categoryName = stringArg(args.category);
          if (categoryName !== undefined) {
            const categoryId = await resolveCategoryId(categoryRepo, userId, categoryName);
            updates.categoryId = categoryId;
          }

          if (Object.keys(updates).length === 0) {
            return { success: false, error: "No transaction changes provided" };
          }

          const transaction = await transactionRepo.updateTransaction(transactionId, userId, updates);
          if (!transaction) return { success: false, error: "Transaction not found" };

          return { success: true, data: { id: transaction.id } };
        } catch (err) {
          return { success: false, error: err instanceof Error ? err.message : "Failed to update transaction" };
        }
      },
    },
    {
      name: "deleteTransaction",
      description: "Delete one existing transaction after the user explicitly confirms deletion. Use getTransactions first to find the transaction id.",
      parameters: {
        type: "object",
        properties: {
          transactionId: { type: "string", description: "Existing transaction id from getTransactions" },
        },
        required: ["transactionId"],
      },
      execute: async (args) => {
        try {
          const transactionId = stringArg(args.transactionId);
          if (!transactionId) return { success: false, error: "transactionId is required" };

          const deleted = await transactionRepo.deleteTransaction(transactionId, userId);
          if (!deleted) return { success: false, error: "Transaction not found" };

          return { success: true, data: { id: transactionId } };
        } catch (err) {
          return { success: false, error: err instanceof Error ? err.message : "Failed to delete transaction" };
        }
      },
    },
    {
      name: "getFinancialSummary",
      description: "Read total income, expenses, net, and transaction count for an inclusive date range. Use before answering totals, comparisons, balances, or hypothetical break-even questions.",
      parameters: {
        type: "object",
        properties: {
          startDate: { type: "string", format: "date", description: "Inclusive start date in YYYY-MM-DD format" },
          endDate: { type: "string", format: "date", description: "Inclusive end date in YYYY-MM-DD format" },
        },
        required: ["startDate", "endDate"],
      },
      execute: async (args) => {
        try {
          const startDate = stringArg(args.startDate);
          const endDate = stringArg(args.endDate);
          if (!startDate || !endDate) {
            return { success: false, error: "startDate and endDate are required" };
          }

          const [summary, page] = await Promise.all([
            transactionRepo.aggregateTransactions({ userId, startDate, endDate }),
            transactionRepo.getTransactions({ userId, startDate, endDate, limit: 1 }),
          ]);

          return {
            success: true,
            data: {
              startDate,
              endDate,
              currency: "PHP",
              ...summary,
              transactionCount: page.total,
            },
          };
        } catch (err) {
          return { success: false, error: err instanceof Error ? err.message : "Failed to summarize transactions" };
        }
      },
    },
    {
      name: "getCategories",
      description: "Get all available categories.",
      parameters: {
        type: "object",
        properties: {},
      },
      execute: async () => {
        try {
          const categories = await categoryRepo.getCategoriesByUserId(userId);
          return { success: true, data: categories };
        } catch (err) {
          return { success: false, error: err instanceof Error ? err.message : "Failed to get categories" };
        }
      },
    },
  ];
}

async function resolveCategoryId(
  categoryRepo: CategoryRepository,
  userId: string,
  categoryName?: string,
): Promise<string | undefined> {
  const category = await categoryRepo.findOrCreateCategory(userId, categoryName);
  return category.id;
}

function stringArg(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function transactionTypeArg(value: unknown): "income" | "expense" | undefined {
  return value === "income" || value === "expense" ? value : undefined;
}

function boundedInteger(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(parsed)));
}
