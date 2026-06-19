import type { D1Database } from "@cloudflare/workers-types";

type TableInfoRow = {
  name: unknown;
};

type IndexInfoRow = {
  name: unknown;
};

export type TableReadinessRequirement = {
  tableName: string;
  columns: readonly string[];
  indexes?: readonly string[];
};

export class SchemaReadinessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SchemaReadinessError";
  }
}

const readyByDb = new WeakMap<D1Database, Map<string, Promise<void>>>();

export function assertTableReady(
  db: D1Database,
  requirement: TableReadinessRequirement,
): Promise<void> {
  const readinessKey = [
    requirement.tableName,
    requirement.columns.join(","),
    requirement.indexes?.join(",") ?? "",
  ].join(":");

  let readyByTable = readyByDb.get(db);
  if (!readyByTable) {
    readyByTable = new Map();
    readyByDb.set(db, readyByTable);
  }

  const existing = readyByTable.get(readinessKey);
  if (existing) return existing;

  const ready = validateTable(db, requirement).catch((error: unknown) => {
    readyByTable.delete(readinessKey);
    throw error;
  });
  readyByTable.set(readinessKey, ready);
  return ready;
}

async function validateTable(
  db: D1Database,
  requirement: TableReadinessRequirement,
): Promise<void> {
  const tableName = validateIdentifier(requirement.tableName);
  const { results } = await db.prepare(`PRAGMA table_info(${tableName})`).all<TableInfoRow>();
  const columns = new Set(
    (results ?? [])
      .map((row) => row.name)
      .filter((name): name is string => typeof name === "string"),
  );

  if (columns.size === 0) {
    throw new SchemaReadinessError(
      `D1 schema drift: table "${requirement.tableName}" is missing. Run the D1 migration command before serving requests.`,
    );
  }

  const missingColumns = requirement.columns.filter((column) => !columns.has(column));
  if (missingColumns.length > 0) {
    throw new SchemaReadinessError(
      `D1 schema drift: table "${requirement.tableName}" missing columns: ${missingColumns.join(", ")}. Run the D1 migration command before serving requests.`,
    );
  }

  if (!requirement.indexes?.length) return;

  const indexResults = await db.prepare(`PRAGMA index_list(${tableName})`).all<IndexInfoRow>();
  const indexes = new Set(
    (indexResults.results ?? [])
      .map((row) => row.name)
      .filter((name): name is string => typeof name === "string"),
  );
  const missingIndexes = requirement.indexes.filter((index) => !indexes.has(index));
  if (missingIndexes.length > 0) {
    throw new SchemaReadinessError(
      `D1 schema drift: table "${requirement.tableName}" missing indexes: ${missingIndexes.join(", ")}. Run the D1 migration command before serving requests.`,
    );
  }
}

function validateIdentifier(identifier: string): string {
  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(identifier)) return identifier;
  throw new SchemaReadinessError(`Invalid schema identifier: ${identifier}`);
}
