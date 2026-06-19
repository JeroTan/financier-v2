import { eq, and, gte, lte, sum } from "drizzle-orm";
import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";

import { goals, transactions } from "@/db/schema";
import type { Goal, NewGoal } from "@/db/schema";
import { normalizeRangeEnd, normalizeRangeStart } from "@/server/utils/dateRange";
import { assertTableReady } from "./schemaReadiness";

const GOAL_TABLE_REQUIREMENT = {
  tableName: "goals",
  columns: [
    "id",
    "user_id",
    "type",
    "target_amount",
    "category_id",
    "start_date",
    "end_date",
    "created_at",
  ],
  indexes: ["idx_goals_user_type"],
} as const;

export class GoalRepository {
  private readonly d1: D1Database;
  private db;

  constructor(db: D1Database) {
    this.d1 = db;
    this.db = drizzle(db, { schema: { goals, transactions } });
  }

  private ensureGoalSchema(): Promise<void> {
    return assertTableReady(this.d1, GOAL_TABLE_REQUIREMENT);
  }

  async createGoal(data: NewGoal): Promise<Goal> {
    await this.ensureGoalSchema();

    const [result] = await this.db
      .insert(goals)
      .values(data)
      .returning();
    if (!result) {
      throw new Error("Goal insert did not return a row");
    }
    return result;
  }

  async getGoalsByUserIdAndType(userId: string, type: string): Promise<Goal[]> {
    await this.ensureGoalSchema();

    return this.db
      .select()
      .from(goals)
      .where(and(eq(goals.userId, userId), eq(goals.type, type)));
  }

  async getGoalProgress(goalId: string, userId: string): Promise<{ current: number; target: number; percentage: number } | null> {
    await this.ensureGoalSchema();

    const [goal] = await this.db
      .select()
      .from(goals)
      .where(and(eq(goals.id, goalId), eq(goals.userId, userId)));

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
