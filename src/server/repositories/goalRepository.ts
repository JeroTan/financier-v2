import { eq, and, gte, lte, sum } from "drizzle-orm";
import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";

import { goals, transactions } from "@/db/schema";
import type { Goal, NewGoal } from "@/db/schema";
import { normalizeRangeEnd, normalizeRangeStart } from "@/server/utils/dateRange";
import { ensureTableSchema, type ColumnRepair } from "./tableRepair";

const CREATE_GOALS_TABLE = `
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  target_amount REAL NOT NULL,
  category_id TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT ''
)`;

const GOAL_COLUMN_REPAIRS: readonly ColumnRepair[] = [
  { name: "category_id", sql: "ALTER TABLE goals ADD COLUMN category_id TEXT" },
  { name: "created_at", sql: "ALTER TABLE goals ADD COLUMN created_at TEXT NOT NULL DEFAULT ''" },
];

export class GoalRepository {
  private readonly d1: D1Database;
  private db;

  constructor(db: D1Database) {
    this.d1 = db;
    this.db = drizzle(db, { schema: { goals, transactions } });
  }

  private ensureGoalSchema(): Promise<void> {
    return ensureTableSchema(this.d1, "goals", CREATE_GOALS_TABLE, GOAL_COLUMN_REPAIRS);
  }

  async createGoal(data: NewGoal): Promise<Goal> {
    await this.ensureGoalSchema();

    const [result] = await this.db
      .insert(goals)
      .values(data)
      .returning();
    return result;
  }

  async getGoalsByUserIdAndType(userId: string, type: string): Promise<Goal[]> {
    await this.ensureGoalSchema();

    return this.db
      .select()
      .from(goals)
      .where(and(eq(goals.userId, userId), eq(goals.type, type)));
  }

  async getGoalProgress(goalId: string): Promise<{ current: number; target: number; percentage: number } | null> {
    await this.ensureGoalSchema();

    const [goal] = await this.db
      .select()
      .from(goals)
      .where(eq(goals.id, goalId));

    if (!goal) return null;

    const [result] = await this.db
      .select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, goal.userId),
          gte(transactions.date, normalizeRangeStart(goal.startDate)),
          lte(transactions.date, normalizeRangeEnd(goal.endDate)),
          goal.categoryId ? eq(transactions.categoryId, goal.categoryId) : undefined,
        ),
      );

    const current = parseFloat(result?.total ?? "0");
    const target = goal.targetAmount;
    const percentage = target > 0 ? (current / target) * 100 : 0;

    return { current, target, percentage };
  }

  async deleteGoal(id: string, userId: string): Promise<boolean> {
    await this.ensureGoalSchema();

    const result = await this.db
      .delete(goals)
      .where(and(eq(goals.id, id), eq(goals.userId, userId)))
      .returning();

    return result.length > 0;
  }
}
