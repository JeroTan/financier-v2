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

export const createTransactionRequestSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive().max(999999999),
  currency: z.string().default("PHP"),
  date: z.string().datetime().or(z.string().date()),
  category: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  receiptUrl: z.string().url().optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const updateTransactionRequestSchema = z.object({
  type: z.enum(["income", "expense"]).optional(),
  amount: z.number().positive().max(999999999).optional(),
  currency: z.string().optional(),
  date: z.string().datetime().or(z.string().date()).optional(),
  category: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(500).optional(),
  receiptUrl: z.string().url().nullable().optional(),
}).refine(
  (data) => Object.values(data).some((value) => value !== undefined),
  "At least one transaction field is required",
);

export const transactionQuerySchema = z.object({
  type: z.enum(["income", "expense"]).optional(),
  search: z.string().max(200).optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  categoryId: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const transactionRecordSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.string(),
  amount: z.number(),
  currency: z.string(),
  categoryId: z.string().nullable(),
  description: z.string().nullable(),
  date: z.string(),
  receiptUrl: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const transactionResponseSchema = z.object({
  success: z.literal(true),
  data: transactionRecordSchema,
});

export const paginatedTransactionsSchema = z.object({
  success: z.literal(true),
  data: z.object({
    transactions: z.array(transactionRecordSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type CreateTransactionRequest = z.infer<typeof createTransactionRequestSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type UpdateTransactionRequest = z.infer<typeof updateTransactionRequestSchema>;
export type TransactionQueryInput = z.infer<typeof transactionQuerySchema>;
