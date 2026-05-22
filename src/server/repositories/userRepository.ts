import { eq } from "drizzle-orm";
import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";

import { users } from "@/db/schema";
import type { User, NewUser } from "@/db/schema";

type UserTableInfoRow = {
  name: unknown;
};

const USER_COLUMN_REPAIRS = [
  {
    name: "password_salt",
    sql: "ALTER TABLE users ADD COLUMN password_salt TEXT",
  },
  {
    name: "refresh_token",
    sql: "ALTER TABLE users ADD COLUMN refresh_token TEXT",
  },
  {
    name: "personality",
    sql: "ALTER TABLE users ADD COLUMN personality TEXT NOT NULL DEFAULT 'default'",
  },
  {
    name: "theme",
    sql: "ALTER TABLE users ADD COLUMN theme TEXT NOT NULL DEFAULT 'light'",
  },
] as const;

export class UserRepository {
  private static schemaReady = new WeakMap<D1Database, Promise<void>>();

  private readonly d1: D1Database;
  private db;

  constructor(db: D1Database) {
    this.d1 = db;
    this.db = drizzle(db, { schema: { users } });
  }

  private ensureUserSchema(): Promise<void> {
    const existing = UserRepository.schemaReady.get(this.d1);
    if (existing) return existing;

    const ready = this.repairUserColumns().catch((error: unknown) => {
      UserRepository.schemaReady.delete(this.d1);
      throw error;
    });
    UserRepository.schemaReady.set(this.d1, ready);
    return ready;
  }

  private async repairUserColumns(): Promise<void> {
    const { results } = await this.d1.prepare("PRAGMA table_info(users)").all<UserTableInfoRow>();
    const columns = new Set(
      (results ?? [])
        .map((row) => row.name)
        .filter((name): name is string => typeof name === "string"),
    );

    for (const repair of USER_COLUMN_REPAIRS) {
      if (!columns.has(repair.name)) {
        try {
          await this.d1.prepare(repair.sql).run();
        } catch (error) {
          if (!isDuplicateColumnError(error)) throw error;
        }
      }
    }
  }

  async create(data: NewUser): Promise<User | null> {
    await this.ensureUserSchema();

    const [result] = await this.db
      .insert(users)
      .values(data)
      .returning();
    return result ?? null;
  }

  async findById(id: string): Promise<User | null> {
    await this.ensureUserSchema();

    const [result] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id));
    return result ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    await this.ensureUserSchema();

    const [result] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return result ?? null;
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    await this.ensureUserSchema();

    const [result] = await this.db
      .select()
      .from(users)
      .where(eq(users.googleId, googleId));
    return result ?? null;
  }

  async findByRefreshToken(refreshToken: string): Promise<User | null> {
    await this.ensureUserSchema();

    const [result] = await this.db
      .select()
      .from(users)
      .where(eq(users.refreshToken, refreshToken));
    return result ?? null;
  }

  async updateRefreshToken(userId: string, refreshToken: string): Promise<User | null> {
    await this.ensureUserSchema();

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
    await this.ensureUserSchema();

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
    await this.ensureUserSchema();

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
    await this.ensureUserSchema();

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
    await this.ensureUserSchema();

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

function isDuplicateColumnError(error: unknown): boolean {
  return error instanceof Error && error.message.toLowerCase().includes("duplicate column");
}
