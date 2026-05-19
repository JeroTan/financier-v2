import { sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import { users } from "./users";
import { categories } from "./categories";

export const goals = sqliteTable("goals", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // "daily" | "monthly" | "yearly"
  targetAmount: real("target_amount").notNull(),
  categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" }),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;
