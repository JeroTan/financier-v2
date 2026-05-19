import { z } from "zod";

export const createTransactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive("Amount must be greater than 0"),
  currency: z.string().default("PHP"),
  categoryId: z.string().optional(),
  description: z.string().optional(),
  date: z.string().datetime().or(z.string().date()),
  receiptUrl: z.string().optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const transactionQuerySchema = z.object({
  type: z.enum(["income", "expense"]).optional(),
  search: z.string().optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  categoryId: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionQueryInput = z.infer<typeof transactionQuerySchema>;
