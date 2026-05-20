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

  async create(data: NewUser): Promise<User | null> {
    const [result] = await this.db
      .insert(users)
      .values(data)
      .returning();
    return result ?? null;
  }

  async findById(id: string): Promise<User | null> {
    const [result] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id));
    return result ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [result] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return result ?? null;
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    const [result] = await this.db
      .select()
      .from(users)
      .where(eq(users.googleId, googleId));
    return result ?? null;
  }

  async findByRefreshToken(refreshToken: string): Promise<User | null> {
    const [result] = await this.db
      .select()
      .from(users)
      .where(eq(users.refreshToken, refreshToken));
    return result ?? null;
  }

  async updateRefreshToken(userId: string, refreshToken: string): Promise<User | null> {
    const [result] = await this.db
      .update(users)
      .set({
        refreshToken,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, userId))
      .returning();
    return result ?? null;
  }

  async updatePassword(userId: string, passwordHash: string, passwordSalt: string): Promise<User | null> {
    const [result] = await this.db
      .update(users)
      .set({
        passwordHash,
        passwordSalt,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, userId))
      .returning();
    return result ?? null;
  }

  async updatePreferences(
    userId: string,
    preferences: { personality?: string; theme?: string },
  ): Promise<User | null> {
    const [result] = await this.db
      .update(users)
      .set({
        ...preferences,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, userId))
      .returning();
    return result ?? null;
  }

  async unlinkGoogle(userId: string): Promise<User | null> {
    const [result] = await this.db
      .update(users)
      .set({
        googleId: null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, userId))
      .returning();
    return result ?? null;
  }

  async linkGoogle(userId: string, googleId: string): Promise<User | null> {
    const [result] = await this.db
      .update(users)
      .set({
        googleId,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, userId))
      .returning();
    return result ?? null;
  }
}
