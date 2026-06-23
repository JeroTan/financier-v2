import { eq, and } from "drizzle-orm";
import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";

import { categories } from "@/db/schema";
import type { Category, NewCategory } from "@/db/schema";
import { isUniqueConstraintError } from "@/server/db/errors";
import { assertTableReady } from "./schemaReadiness";

const DEFAULT_CATEGORIES = [
  { name: "Food", icon: "🍔" },
  { name: "Transport", icon: "🚗" },
  { name: "Shopping", icon: "🛍️" },
  { name: "Entertainment", icon: "🎬" },
  { name: "Bills", icon: "📄" },
  { name: "Salary", icon: "💰" },
  { name: "Freelance", icon: "💻" },
  { name: "Investment", icon: "📈" },
  { name: "Other", icon: "📦" },
];

const CATEGORY_TABLE_REQUIREMENT = {
  tableName: "categories",
  columns: ["id", "user_id", "name", "icon", "is_default", "created_at"],
  indexes: ["idx_categories_user"],
} as const;

export class CategoryRepository {
  private readonly d1: D1Database;
  private db;

  constructor(db: D1Database) {
    this.d1 = db;
    this.db = drizzle(db, { schema: { categories } });
  }

  private ensureCategorySchema(): Promise<void> {
    return assertTableReady(this.d1, CATEGORY_TABLE_REQUIREMENT);
  }

  async getCategoriesByUserId(userId: string): Promise<Category[]> {
    await this.ensureCategorySchema();

    return this.db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId));
  }

  async createCategory(data: NewCategory): Promise<Category> {
    await this.ensureCategorySchema();

    const result = await this.insertCategory(data);
    return result;
  }

  async findOrCreateCategory(userId: string, name?: string | null): Promise<Category> {
    const categoryName = normalizeCategoryName(name) || "Other";
    const existing = await this.seedDefaultCategories(userId);
    const matched = existing.find(
      (category) => category.name.toLowerCase() === categoryName.toLowerCase(),
    );
    if (matched) return matched;

    try {
      return await this.createCategory({
        id: crypto.randomUUID(),
        userId,
        name: categoryName,
        icon: "ðŸ“¦",
        isDefault: 0,
      });
    } catch (error) {
      if (!isUniqueConstraintError(error)) throw error;
      const categories = await this.getCategoriesByUserId(userId);
      const fallback = categories.find(
        (category) => category.name.toLowerCase() === categoryName.toLowerCase(),
      );
      if (fallback) return fallback;
      throw error;
    }
  }

  async seedDefaultCategories(userId: string): Promise<Category[]> {
    await this.ensureCategorySchema();

    const existing = await this.getCategoriesByUserId(userId);
    if (existing.length > 0) return existing;

    const newCategories: NewCategory[] = DEFAULT_CATEGORIES.map((cat) => ({
      id: crypto.randomUUID(),
      userId,
      name: cat.name,
      icon: cat.icon,
      isDefault: 1,
    }));

    const inserted: Category[] = [];
    for (const category of newCategories) {
      try {
        inserted.push(await this.insertCategory(category));
      } catch (error) {
        if (!isUniqueConstraintError(error)) throw error;
      }
    }
    if (inserted.length === newCategories.length) return inserted;
    return this.getCategoriesByUserId(userId);
  }

  async deleteCategory(id: string, userId: string): Promise<boolean> {
    await this.ensureCategorySchema();

    const [category] = await this.db
      .select()
      .from(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)));

    if (!category) return false;
    if (category.isDefault === 1) return false;

    const result = await this.db
      .delete(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning();

    return result.length > 0;
  }

  private async insertCategory(data: NewCategory): Promise<Category> {
    const columns = await this.getCategoryColumns();
    const now = new Date().toISOString();
    const names = ["id", "user_id", "name"];
    const values: unknown[] = [data.id, data.userId, data.name];

    if (columns.has("slug")) {
      names.push("slug");
      values.push(`${slugify(data.name)}-${data.userId}`);
    }
    if (columns.has("icon")) {
      names.push("icon");
      values.push(data.icon ?? null);
    }
    if (columns.has("is_default")) {
      names.push("is_default");
      values.push(data.isDefault ?? 0);
    }
    if (columns.has("created_at")) {
      names.push("created_at");
      values.push(now);
    }
    if (columns.has("updated_at")) {
      names.push("updated_at");
      values.push(now);
    }

    const placeholders = names.map(() => "?").join(", ");
    await this.d1
      .prepare(`INSERT INTO categories (${names.join(", ")}) VALUES (${placeholders})`)
      .bind(...values)
      .run();

    const [result] = await this.db
      .select()
      .from(categories)
      .where(eq(categories.id, data.id));
    if (!result) {
      throw new Error("Category insert did not return a row");
    }
    return result;
  }

  private async getCategoryColumns(): Promise<Set<string>> {
    const { results } = await this.d1.prepare("PRAGMA table_info(categories)").all<{ name: unknown }>();
    return new Set(
      (results ?? [])
        .map((row) => row.name)
        .filter((name): name is string => typeof name === "string"),
    );
  }
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || crypto.randomUUID();
}

function normalizeCategoryName(value?: string | null): string {
  return (value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}
