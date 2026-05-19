import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core";
import { users } from "./users";
import { categories } from "./categories";

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // "income" | "expense"
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("PHP"),
  categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" }),
  description: text("description"),
  date: text("date").notNull(), // ISO 8601
  receiptUrl: text("receipt_url"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
