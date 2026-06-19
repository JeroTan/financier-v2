import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

type TableRequirement = {
  columns: string[];
  indexes?: string[];
  foreignKeys?: string[];
};

const migrationsDir = join(process.cwd(), "drizzle", "migrations");

const requirements: Record<string, TableRequirement> = {
  users: {
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
  },
  transactions: {
    columns: [
      "id",
      "user_id",
      "type",
      "amount",
      "currency",
      "category_id",
      "description",
      "date",
      "receipt_url",
      "created_at",
      "updated_at",
    ],
    indexes: [
      "idx_transactions_user_date",
      "idx_transactions_user_type",
      "idx_transactions_user_category",
    ],
    foreignKeys: ["user_id", "category_id"],
  },
  categories: {
    columns: ["id", "user_id", "name", "icon", "is_default", "created_at"],
    indexes: ["idx_categories_user"],
    foreignKeys: ["user_id"],
  },
  goals: {
    columns: [
      "id",
      "user_id",
      "type",
      "target_amount",
      "category_id",
      "start_date",
      "end_date",
      "created_at",
    ],
    indexes: ["idx_goals_user_type"],
    foreignKeys: ["user_id", "category_id"],
  },
};

const sqlFiles = readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .sort();

const tables = new Map<string, Set<string>>();
const createBodies = new Map<string, string>();
const indexes = new Set<string>();
const duplicateAdds: string[] = [];

for (const file of sqlFiles) {
  const sql = readFileSync(join(migrationsDir, file), "utf8");

  for (const match of sql.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?`?(\w+)`?\s*\(([\s\S]*?)\)\s*;/gi)) {
    const [, tableName, body] = match;
    const columns = tables.get(tableName) ?? new Set<string>();
    for (const columnMatch of body.matchAll(/^\s*`?(\w+)`?\s+(?:text|integer|real|blob|numeric)\b/gim)) {
      columns.add(columnMatch[1]);
    }
    tables.set(tableName, columns);
    createBodies.set(tableName, body);
  }

  for (const match of sql.matchAll(/ALTER\s+TABLE\s+`?(\w+)`?\s+ADD\s+COLUMN\s+`?(\w+)`?/gi)) {
    const [, tableName, columnName] = match;
    const columns = tables.get(tableName) ?? new Set<string>();
    if (columns.has(columnName)) {
      duplicateAdds.push(`${file}: ${tableName}.${columnName}`);
    }
    columns.add(columnName);
    tables.set(tableName, columns);
  }

  for (const match of sql.matchAll(/CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?`?(\w+)`?/gi)) {
    indexes.add(match[1]);
  }
}

const failures: string[] = [];

if (duplicateAdds.length > 0) {
  failures.push(`duplicate migration column adds: ${duplicateAdds.join(", ")}`);
}

for (const [tableName, requirement] of Object.entries(requirements)) {
  const columns = tables.get(tableName);
  if (!columns) {
    failures.push(`missing table: ${tableName}`);
    continue;
  }

  const missingColumns = requirement.columns.filter((column) => !columns.has(column));
  if (missingColumns.length > 0) {
    failures.push(`${tableName} missing columns: ${missingColumns.join(", ")}`);
  }

  const missingIndexes = requirement.indexes?.filter((index) => !indexes.has(index)) ?? [];
  if (missingIndexes.length > 0) {
    failures.push(`${tableName} missing indexes: ${missingIndexes.join(", ")}`);
  }

  const body = createBodies.get(tableName) ?? "";
  const missingForeignKeys = requirement.foreignKeys?.filter(
    (column) => !new RegExp(`FOREIGN\\s+KEY\\s*\\(\\s*\`?${column}\`?\\s*\\)`, "i").test(body),
  ) ?? [];
  if (missingForeignKeys.length > 0) {
    failures.push(`${tableName} missing foreign keys: ${missingForeignKeys.join(", ")}`);
  }
}

if (failures.length > 0) {
  console.error("D1 schema drift check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("D1 schema drift check passed");
