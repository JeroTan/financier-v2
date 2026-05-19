import { eq, and } from "drizzle-orm";
import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";

import { categories } from "@/db/schema";
import type { Category, NewCategory } from "@/db/schema";

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

export class CategoryRepository {
  private db;

  constructor(db: D1Database) {
    this.db = drizzle(db, { schema: { categories } });
  }

  async getCategoriesByUserId(userId: string): Promise<Category[]> {
    return this.db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId));
  }

  async createCategory(data: NewCategory): Promise<Category> {
    const [result] = await this.db
      .insert(categories)
      .values(data)
      .returning();
    return result;
  }

  async seedDefaultCategories(userId: string): Promise<Category[]> {
    const existing = await this.getCategoriesByUserId(userId);
    if (existing.length > 0) return existing;

    const newCategories: NewCategory[] = DEFAULT_CATEGORIES.map((cat) => ({
      id: crypto.randomUUID(),
      userId,
      name: cat.name,
      icon: cat.icon,
      isDefault: 1,
    }));

    return this.db.insert(categories).values(newCategories).returning();
  }

  async deleteCategory(id: string, userId: string): Promise<boolean> {
    const [category] = await this.db
      .select()
      .from(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)));

    if (!category) return false;
    if (category.isDefault === 1) return false;

    const result = await this.db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();

    return result.length > 0;
  }
}
