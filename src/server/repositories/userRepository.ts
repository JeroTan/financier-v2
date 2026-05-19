import { eq } from "drizzle-orm";
import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";

import { users } from "@/db/schema";
import type { User, NewUser } from "@/db/schema";

export class UserRepository {
  private db;

  constructor(db: D1Database) {
    this.db = drizzle(db, { schema: { users } });
  }

  async createUser(data: NewUser): Promise<User> {
    const [result] = await this.db
      .insert(users)
      .values(data)
      .returning();
    return result;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const [result] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return result ?? null;
  }

  async getUserByGoogleId(googleId: string): Promise<User | null> {
    const [result] = await this.db
      .select()
      .from(users)
      .where(eq(users.googleId, googleId));
    return result ?? null;
  }

  async updateUserSettings(userId: string, settings: { personality?: string; theme?: string }): Promise<User | null> {
    const [result] = await this.db
      .update(users)
      .set({
        ...settings,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, userId))
      .returning();
    return result ?? null;
  }

  async updatePassword(userId: string, passwordHash: string): Promise<User | null> {
    const [result] = await this.db
      .update(users)
      .set({
        passwordHash,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, userId))
      .returning();
    return result ?? null;
  }
}
