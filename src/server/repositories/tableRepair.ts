import type { D1Database } from "@cloudflare/workers-types";

type TableInfoRow = {
  name: unknown;
};

export type ColumnRepair = {
  name: string;
  sql: string;
};

const readyByDb = new WeakMap<D1Database, Map<string, Promise<void>>>();

export function ensureTableSchema(
  db: D1Database,
  tableName: string,
  createTableSql: string,
  repairs: readonly ColumnRepair[],
): Promise<void> {
  const repairKey = `${tableName}:${repairs.map((repair) => repair.name).join(",")}`;
  let readyByTable = readyByDb.get(db);
  if (!readyByTable) {
    readyByTable = new Map();
    readyByDb.set(db, readyByTable);
  }

  const existing = readyByTable.get(repairKey);
  if (existing) return existing;

  const ready = repairTable(db, tableName, createTableSql, repairs).catch((error: unknown) => {
    readyByTable.delete(repairKey);
    throw error;
  });
  readyByTable.set(repairKey, ready);
  return ready;
}

async function repairTable(
  db: D1Database,
  tableName: string,
  createTableSql: string,
  repairs: readonly ColumnRepair[],
): Promise<void> {
  await db.prepare(createTableSql).run();

  const { results } = await db.prepare(`PRAGMA table_info(${tableName})`).all<TableInfoRow>();
  const columns = new Set(
    (results ?? [])
      .map((row) => row.name)
      .filter((name): name is string => typeof name === "string"),
  );

  for (const repair of repairs) {
    if (!columns.has(repair.name)) {
      try {
        await db.prepare(repair.sql).run();
      } catch (error) {
        if (!isDuplicateColumnError(error)) throw error;
      }
    }
  }
}

function isDuplicateColumnError(error: unknown): boolean {
  return error instanceof Error && error.message.toLowerCase().includes("duplicate column");
}
