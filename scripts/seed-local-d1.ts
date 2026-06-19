import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { webcrypto } from "node:crypto";
import { config } from "dotenv";

config();

const seedUserId = process.env.LOCAL_SEED_USER_ID ?? "local-dev-user";
const seedEmail = process.env.LOCAL_SEED_EMAIL ?? "dev@financier.local";
const seedPassword = process.env.LOCAL_SEED_PASSWORD ?? "Password123!";
const pepper = process.env.PASSWORD_PEPPER;

if (!pepper) {
  throw new Error("PASSWORD_PEPPER must be set before seeding local D1");
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

async function hashPassword(password: string, saltHex: string): Promise<string> {
  const material = await webcrypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(`${pepper}\u0000${password}`),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await webcrypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: toArrayBuffer(hexToBytes(saltHex)),
      iterations: 99_999,
    },
    material,
    256,
  );
  return `pbkdf2-sha256$99999$${bytesToHex(new Uint8Array(bits))}`;
}

function sqlString(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

const salt = "00112233445566778899aabbccddeeff";
const passwordHash = await hashPassword(seedPassword, salt);
const now = new Date().toISOString();

const categories = [
  ["local-cat-food", "Food", "\u{1F354}"],
  ["local-cat-transport", "Transport", "\u{1F697}"],
  ["local-cat-shopping", "Shopping", "\u{1F6CD}\u{FE0F}"],
  ["local-cat-entertainment", "Entertainment", "\u{1F3AC}"],
  ["local-cat-bills", "Bills", "\u{1F4C4}"],
  ["local-cat-salary", "Salary", "\u{1F4B0}"],
  ["local-cat-freelance", "Freelance", "\u{1F4BB}"],
  ["local-cat-investment", "Investment", "\u{1F4C8}"],
  ["local-cat-other", "Other", "\u{1F4E6}"],
] as const;

const statements = [
  `INSERT INTO users (id, email, password_hash, password_salt, google_id, refresh_token, personality, theme, created_at, updated_at)
VALUES (${sqlString(seedUserId)}, ${sqlString(seedEmail)}, ${sqlString(passwordHash)}, ${sqlString(salt)}, NULL, NULL, 'default', 'light', ${sqlString(now)}, ${sqlString(now)})
ON CONFLICT(id) DO UPDATE SET
  email = excluded.email,
  password_hash = excluded.password_hash,
  password_salt = excluded.password_salt,
  updated_at = excluded.updated_at;`,
  ...categories.map(([id, name, icon]) => `INSERT INTO categories (id, user_id, name, icon, is_default, created_at)
VALUES (${sqlString(id)}, ${sqlString(seedUserId)}, ${sqlString(name)}, ${sqlString(icon)}, 1, ${sqlString(now)})
ON CONFLICT(id) DO UPDATE SET
  name = excluded.name,
  icon = excluded.icon,
  is_default = excluded.is_default;`),
];

const tempDir = mkdtempSync(join(tmpdir(), "financier-d1-seed-"));
const seedFile = join(tempDir, "seed.sql");
const wranglerCli = join(process.cwd(), "node_modules", "wrangler", "bin", "wrangler.js");

try {
  writeFileSync(seedFile, statements.join("\n\n"), "utf8");
  execFileSync(
    process.execPath,
    [wranglerCli, "d1", "execute", "DB", "--local", "--env", "development", "--file", seedFile],
    { stdio: "inherit" },
  );
  console.log(`Local D1 seeded: ${seedEmail} / ${seedPassword}`);
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
