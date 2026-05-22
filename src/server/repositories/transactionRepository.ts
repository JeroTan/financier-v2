import { eq, and, gte, lte, desc, count, sum, like } from "drizzle-orm";
import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";

import { transactions, categories } from "@/db/schema";
import type { Transaction, NewTransaction } from "@/db/schema";

export class TransactionRepository {
  private db;

  constructor(db: D1Database) {
    this.db = drizzle(db, { schema: { transactions, categories } });
  }

  async createTransaction(data: NewTransaction): Promise<Transaction> {
    const [result] = await this.db
      .insert(transactions)
      .values(data)
      .returning();
    return result;
  }

  async getTransactionById(id: string): Promise<Transaction | null> {
    const [result] = await this.db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));
    return result ?? null;
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

    const baseWhere = [eq(transactions.userId, userId)];

    if (type) baseWhere.push(eq(transactions.type, type));
    if (categoryId) baseWhere.push(eq(transactions.categoryId, categoryId));
    if (startDate) baseWhere.push(gte(transactions.date, startDate));
    if (endDate) baseWhere.push(lte(transactions.date, endDate));
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
  }): Promise<{ totalIncome: number; totalExpenses: number; net: number }> {
    const { userId, startDate, endDate } = options;

    const results = await this.db
      .select({
        type: transactions.type,
        total: sum(transactions.amount),
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate),
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

    return {
      totalIncome,
      totalExpenses,
      net: totalIncome - totalExpenses,
    };
  }
}
