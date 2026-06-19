import { describe, expect, it } from "vitest";
import type { D1Database } from "@cloudflare/workers-types";

import { assertTableReady, SchemaReadinessError } from "./schemaReadiness";

function createD1Harness(options: {
  tableColumns: string[];
  indexes?: string[];
}) {
  const statements: string[] = [];
  const runs: string[] = [];

  const db = {
    prepare(sql: string) {
      statements.push(sql);
      return {
        all: async () => {
          if (/pragma\s+table_info/i.test(sql)) {
            return { results: options.tableColumns.map((name) => ({ name })) };
          }
          if (/pragma\s+index_list/i.test(sql)) {
            return { results: (options.indexes ?? []).map((name) => ({ name })) };
          }
          return { results: [] };
        },
        run: async () => {
          runs.push(sql);
          return { success: true };
        },
      };
    },
  } as unknown as D1Database;

  return { db, statements, runs };
}

describe("schema readiness", () => {
  it("validates required columns and indexes without mutating schema", async () => {
    const harness = createD1Harness({
      tableColumns: ["id", "email", "password_salt", "refresh_token"],
      indexes: ["users_email_unique"],
    });

    await expect(assertTableReady(harness.db, {
      tableName: "users",
      columns: ["id", "email", "password_salt", "refresh_token"],
      indexes: ["users_email_unique"],
    })).resolves.toBeUndefined();

    expect(harness.statements).toEqual([
      "PRAGMA table_info(users)",
      "PRAGMA index_list(users)",
    ]);
    expect(harness.runs).toEqual([]);
  });

  it("reports actionable drift when columns are missing", async () => {
    const harness = createD1Harness({
      tableColumns: ["id", "email"],
    });

    await expect(assertTableReady(harness.db, {
      tableName: "users",
      columns: ["id", "email", "password_salt"],
    })).rejects.toBeInstanceOf(SchemaReadinessError);
    await expect(assertTableReady(harness.db, {
      tableName: "users",
      columns: ["id", "email", "password_salt"],
    })).rejects.toThrow("missing columns: password_salt");
  });
});
