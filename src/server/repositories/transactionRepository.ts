import { eq, and, gte, lte, desc, count, sum, like, sql } from "drizzle-orm";
import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";

import { transactions, categories } from "@/db/schema";
import type { Transaction, NewTransaction } from "@/db/schema";
import type { UpdateTransactionInput } from "@/server/dto/transaction";
import { normalizeRangeEnd, normalizeRangeStart, normalizeTransactionDate } from "@/server/utils/dateRange";
import { assertTableReady } from "./schemaReadiness";

const TRANSACTION_TABLE_REQUIREMENT = {
  tableName: "transactions",
  columns: [
    "id",
    "user_id",
    "type",
    "amount",
    "currency",
    "category_id",
    "description",
    "date",
    "receipt_url",
    "created_at",
    "updated_at",
  ],
  indexes: [
    "idx_transactions_user_date",
    "idx_transactions_user_type",
    "idx_transactions_user_category",
  ],
} as const;

export class TransactionRepository {
  private readonly d1: D1Database;
  private db;

  constructor(db: D1Database) {
    this.d1 = db;
    this.db = drizzle(db, { schema: { transactions, categories } });
  }

  private ensureTransactionSchema(): Promise<void> {
    return assertTableReady(this.d1, TRANSACTION_TABLE_REQUIREMENT);
  }

  async createTransaction(data: NewTransaction): Promise<Transaction> {
    await this.ensureTransactionSchema();

    const [result] = await this.db
      .insert(transactions)
      .values({
        ...data,
        date: normalizeTransactionDate(data.date),
      })
      .returning();
    if (!result) {
      throw new Error("Transaction insert did not return a row");
    }
    return result;
  }

  async getTransactionById(id: string, userId: string): Promise<Transaction | null> {
    await this.ensureTransactionSchema();

    const [result] = await this.db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
    return result ?? null;
  }

  async updateTransaction(
    id: string,
    userId: string,
    data: UpdateTransactionInput,
  ): Promise<Transaction | null> {
    await this.ensureTransactionSchema();

    const updates: Partial<NewTransaction> = {
      updatedAt: new Date().toISOString(),
    };

    if (data.type !== undefined) updates.type = data.type;
    if (data.amount !== undefined) updates.amount = data.amount;
    if (data.currency !== undefined) updates.currency = data.currency;
    if (data.categoryId !== undefined) updates.categoryId = data.categoryId;
    if (data.description !== undefined) updates.description = data.description;
    if (data.receiptUrl !== undefined) updates.receiptUrl = data.receiptUrl;
    if (data.date !== undefined) updates.date = normalizeTransactionDate(data.date);

    const [result] = await this.db
      .update(transactions)
      .set(updates)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .returning();

    return result ?? null;
  }

  async deleteTransaction(id: string, userId: string): Promise<boolean> {
    await this.ensureTransactionSchema();

    const result = await this.db
      .delete(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .returning();

    return result.length > 0;
  }

  async getTransactions(options: {
    userId: string;
    type?: "income" | "expense";
    categoryId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ transactions: Transaction[]; total: number }> {
    const { userId, type, categoryId, startDate, endDate, search, limit = 20, offset = 0 } = options;
    await this.ensureTransactionSchema();

    const baseWhere = [eq(transactions.userId, userId)];

    if (type) baseWhere.push(eq(transactions.type, type));
    if (categoryId) baseWhere.push(eq(transactions.categoryId, categoryId));
    if (startDate) baseWhere.push(gte(transactions.date, normalizeRangeStart(startDate)));
    if (endDate) baseWhere.push(lte(transactions.date, normalizeRangeEnd(endDate)));
    if (search) {
      baseWhere.push(like(transactions.description, `%${search}%`));
    }

    const [totalResult] = await this.db
      .select({ count: count() })
      .from(transactions)
      .where(and(...baseWhere));

    const results = await this.db
      .select()
      .from(transactions)
      .where(and(...baseWhere))
      .orderBy(desc(transactions.date))
      .limit(limit)
      .offset(offset);

    return {
      transactions: results,
      total: totalResult?.count ?? 0,
    };
  }

  async aggregateTransactions(options: {
    userId: string;
    startDate: string;
    endDate: string;
  }): Promise<{
    totalIncome: number;
    totalExpenses: number;
    net: number;
    topCategories: Array<{ categoryId: string | null; name: string; total: number; count: number; percentage: number }>;
  }> {
    const { userId, startDate, endDate } = options;
    await this.ensureTransactionSchema();

    const results = await this.db
      .select({
        type: transactions.type,
        total: sum(transactions.amount),
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.date, normalizeRangeStart(startDate)),
          lte(transactions.date, normalizeRangeEnd(endDate)),
        ),
      )
      .groupBy(transactions.type);

    let totalIncome = 0;
    let totalExpenses = 0;

    for (const row of results) {
      const amount = parseFloat(row.total ?? "0");
      if (row.type === "income") {
        totalIncome = amount;
      } else {
        totalExpenses = amount;
      }
    }

    const topCategories = await this.getExpenseCategoryTotals({
      userId,
      startDate,
      endDate,
      totalExpenses,
      limit: 5,
    });

    return {
      totalIncome,
      totalExpenses,
      net: totalIncome - totalExpenses,
      topCategories,
    };
  }

  private async getExpenseCategoryTotals(options: {
    userId: string;
    startDate: string;
    endDate: string;
    totalExpenses: number;
    limit: number;
  }): Promise<Array<{ categoryId: string | null; name: string; total: number; count: number; percentage: number }>> {
    const { userId, startDate, endDate, totalExpenses, limit } = options;
    if (totalExpenses <= 0) return [];

    const categoryTotal = sql<string>`sum(${transactions.amount})`;

    const rows = await this.db
      .select({
        categoryId: transactions.categoryId,
        name: categories.name,
        total: categoryTotal,
        count: count(),
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, "expense"),
          gte(transactions.date, normalizeRangeStart(startDate)),
          lte(transactions.date, normalizeRangeEnd(endDate)),
        ),
      )
      .groupBy(transactions.categoryId, categories.name)
      .orderBy(desc(categoryTotal))
      .limit(limit);

    const totalsByName = new Map<string, { categoryId: string | null; name: string; total: number; count: number }>();

    for (const row of rows) {
      const total = Number.parseFloat(row.total ?? "0");
      if (total <= 0) continue;
      const name = row.name ?? "Other";
      const existing = totalsByName.get(name);
      if (existing) {
        existing.total += total;
        existing.count += row.count;
      } else {
        totalsByName.set(name, {
          categoryId: row.categoryId,
          name,
          total,
          count: row.count,
        });
      }
    }

    return Array.from(totalsByName.values())
      .sort((a, b) => b.total - a.total)
      .map((row) => ({
        ...row,
        percentage: totalExpenses > 0 ? Math.round((row.total / totalExpenses) * 100) : 0,
      }));
  }
}
