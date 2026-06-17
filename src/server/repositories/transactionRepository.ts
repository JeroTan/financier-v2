import { eq, and, gte, lte, desc, count, sum, like } from "drizzle-orm";
import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";

import { transactions, categories } from "@/db/schema";
import type { Transaction, NewTransaction } from "@/db/schema";
import { normalizeRangeEnd, normalizeRangeStart, normalizeTransactionDate } from "@/server/utils/dateRange";
import { ensureTableSchema, type ColumnRepair } from "./tableRepair";

const CREATE_TRANSACTIONS_TABLE = `
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'PHP',
  category_id TEXT,
  description TEXT,
  date TEXT NOT NULL,
  receipt_url TEXT,
  created_at TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT ''
)`;

const TRANSACTION_COLUMN_REPAIRS: readonly ColumnRepair[] = [
  { name: "currency", sql: "ALTER TABLE transactions ADD COLUMN currency TEXT NOT NULL DEFAULT 'PHP'" },
  { name: "category_id", sql: "ALTER TABLE transactions ADD COLUMN category_id TEXT" },
  { name: "description", sql: "ALTER TABLE transactions ADD COLUMN description TEXT" },
  { name: "receipt_url", sql: "ALTER TABLE transactions ADD COLUMN receipt_url TEXT" },
  { name: "created_at", sql: "ALTER TABLE transactions ADD COLUMN created_at TEXT NOT NULL DEFAULT ''" },
  { name: "updated_at", sql: "ALTER TABLE transactions ADD COLUMN updated_at TEXT NOT NULL DEFAULT ''" },
];

export class TransactionRepository {
  private readonly d1: D1Database;
  private db;

  constructor(db: D1Database) {
    this.d1 = db;
    this.db = drizzle(db, { schema: { transactions, categories } });
  }

  private ensureTransactionSchema(): Promise<void> {
    return ensureTableSchema(this.d1, "transactions", CREATE_TRANSACTIONS_TABLE, TRANSACTION_COLUMN_REPAIRS);
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
    return result;
  }

  async getTransactionById(id: string): Promise<Transaction | null> {
    await this.ensureTransactionSchema();

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
  }): Promise<{ totalIncome: number; totalExpenses: number; net: number }> {
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

    return {
      totalIncome,
      totalExpenses,
      net: totalIncome - totalExpenses,
    };
  }
}
