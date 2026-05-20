import type { TransactionRepository } from "@/server/repositories/transactionRepository";
import type { CategoryRepository } from "@/server/repositories/categoryRepository";
import type { CreateTransactionInput } from "@/server/dto/transaction";

export type ToolCall = {
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
          categoryId: { type: "string", description: "Category ID" },
          description: { type: "string", description: "Transaction description" },
          date: { type: "string", format: "date", description: "Transaction date (ISO format)" },
        },
        required: ["type", "amount", "date"],
      },
      execute: async (args) => {
        try {
          const input: CreateTransactionInput = {
            type: args.type as "income" | "expense",
            amount: Number(args.amount),
            currency: (args.currency as string) ?? "PHP",
            categoryId: args.categoryId as string | undefined,
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
      description: "Get a list of transactions with optional filters.",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["income", "expense"], description: "Filter by type" },
          limit: { type: "number", default: 10, description: "Number of results" },
          offset: { type: "number", default: 0, description: "Offset for pagination" },
        },
      },
      execute: async (args) => {
        try {
          const result = await transactionRepo.getTransactions({
            userId,
            type: args.type as "income" | "expense" | undefined,
            limit: Number(args.limit) ?? 10,
            offset: Number(args.offset) ?? 0,
          });
          return { success: true, data: result };
        } catch (err) {
          return { success: false, error: err instanceof Error ? err.message : "Failed to get transactions" };
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
