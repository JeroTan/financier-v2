const baseUrl = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:4321";

async function assertStatus(path: string, expected: number): Promise<void> {
  const response = await fetch(new URL(path, baseUrl), { redirect: "manual" });
  if (response.status !== expected) {
    throw new Error(`${path} expected ${expected}, got ${response.status}`);
  }
}

async function assertJsonStatus(path: string, expected: number, code?: string): Promise<void> {
  const response = await fetch(new URL(path, baseUrl), { redirect: "manual" });
  if (response.status !== expected) {
    throw new Error(`${path} expected ${expected}, got ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(`${path} expected JSON response, got ${contentType || "no content-type"}`);
  }

  if (code) {
    const body = await response.json() as { error?: { code?: string } };
    if (body.error?.code !== code) {
      throw new Error(`${path} expected error code ${code}, got ${body.error?.code ?? "missing"}`);
    }
  }
}

await assertStatus("/", 200);
await assertStatus("/login", 200);
await assertStatus("/register", 200);
await assertStatus("/api/docs", 200);
await assertStatus("/api/openapi.json", 200);
await assertStatus("/dashboard", 302);
await assertJsonStatus("/api/stats", 401, "UNAUTHORIZED");

console.log("route smoke passed");

export {};
