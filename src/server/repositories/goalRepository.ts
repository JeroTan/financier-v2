import { eq, and, gte, lte, sum } from "drizzle-orm";
import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";

import { goals, transactions } from "@/db/schema";
import type { Goal, NewGoal } from "@/db/schema";

export class GoalRepository {
  private db;

  constructor(db: D1Database) {
    this.db = drizzle(db, { schema: { goals, transactions } });
  }

  async createGoal(data: NewGoal): Promise<Goal> {
    const [result] = await this.db
      .insert(goals)
      .values(data)
      .returning();
    return result;
  }

  async getGoalsByUserIdAndType(userId: string, type: string): Promise<Goal[]> {
    return this.db
      .select()
      .from(goals)
      .where(and(eq(goals.userId, userId), eq(goals.type, type)));
  }

  async getGoalProgress(goalId: string): Promise<{ current: number; target: number; percentage: number } | null> {
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
          gte(transactions.date, goal.startDate),
          lte(transactions.date, goal.endDate),
          goal.categoryId ? eq(transactions.categoryId, goal.categoryId) : undefined,
        ),
      );

    const current = parseFloat(result?.total ?? "0");
    const target = goal.targetAmount;
    const percentage = target > 0 ? (current / target) * 100 : 0;

    return { current, target, percentage };
  }

  async deleteGoal(id: string, userId: string): Promise<boolean> {
    const result = await this.db
      .delete(goals)
      .where(and(eq(goals.id, id), eq(goals.userId, userId)))
      .returning();

    return result.length > 0;
  }
}
