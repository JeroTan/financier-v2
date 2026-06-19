import { eq } from "drizzle-orm";
import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";

import { users } from "@/db/schema";
import type { User, NewUser } from "@/db/schema";
import { assertTableReady } from "./schemaReadiness";

const USER_TABLE_REQUIREMENT = {
  tableName: "users",
  columns: [
    "id",
    "email",
    "password_hash",
    "password_salt",
    "google_id",
    "refresh_token",
    "personality",
    "theme",
    "created_at",
    "updated_at",
  ],
  indexes: ["users_email_unique", "users_google_id_unique"],
} as const;

export class UserRepository {
  private static schemaReady = new WeakMap<D1Database, Promise<void>>();

  private readonly d1: D1Database;
  private db;

  constructor(db: D1Database) {
    this.d1 = db;
    this.db = drizzle(db, { schema: { users } });
  }

  private assertUserSchema(): Promise<void> {
    const existing = UserRepository.schemaReady.get(this.d1);
    if (existing) return existing;

    const ready = assertTableReady(this.d1, USER_TABLE_REQUIREMENT).catch((error: unknown) => {
      UserRepository.schemaReady.delete(this.d1);
      throw error;
    });
    UserRepository.schemaReady.set(this.d1, ready);
    return ready;
  }

  async create(data: NewUser): Promise<User | null> {
    await this.assertUserSchema();

    const [result] = await this.db
      .insert(users)
      .values(data)
      .returning();
    return result ?? null;
  }

  async findById(id: string): Promise<User | null> {
    await this.assertUserSchema();

    const [result] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id));
    return result ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    await this.assertUserSchema();

    const [result] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return result ?? null;
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    await this.assertUserSchema();

    const [result] = await this.db
      .select()
      .from(users)
      .where(eq(users.googleId, googleId));
    return result ?? null;
  }

  async findByRefreshToken(refreshToken: string): Promise<User | null> {
    await this.assertUserSchema();

    const [result] = await this.db
      .select()
      .from(users)
      .where(eq(users.refreshToken, refreshToken));
    return result ?? null;
  }

  async updateRefreshToken(userId: string, refreshToken: string): Promise<User | null> {
    await this.assertUserSchema();

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
    await this.assertUserSchema();

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
    await this.assertUserSchema();

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
    await this.assertUserSchema();

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
    await this.assertUserSchema();

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
