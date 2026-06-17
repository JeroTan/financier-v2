const baseUrl = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:4321";
const origin = new URL(baseUrl).origin;
const smokeIp = `127.0.1.${Math.floor(Math.random() * 200) + 2}`;

async function assertJsonError(
  path: string,
  init: RequestInit,
  expectedStatus: number,
  expectedCode: string,
): Promise<void> {
  const headers = new Headers(init.headers);
  headers.set("Origin", origin);
  headers.set("CF-Connecting-IP", smokeIp);

  const response = await fetch(new URL(path, baseUrl), { ...init, headers, redirect: "manual" });
  if (response.status !== expectedStatus) {
    throw new Error(`${path} expected ${expectedStatus}, got ${response.status}`);
  }

  const body = await response.json() as { error?: { code?: string } };
  if (body.error?.code !== expectedCode) {
    throw new Error(`${path} expected ${expectedCode}, got ${body.error?.code ?? "missing"}`);
  }
}

await assertJsonError(
  "/api/auth/register",
  {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ email: "", password: "" }),
  },
  400,
  "INVALID_INPUT",
);

await assertJsonError(
  "/api/auth/login",
  {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ email: "", password: "" }),
  },
  400,
  "INVALID_INPUT",
);

await assertJsonError(
  "/api/auth/refresh",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  },
  400,
  "INVALID_INPUT",
);

await assertJsonError(
  "/api/auth/logout",
  { method: "POST" },
  401,
  "UNAUTHORIZED",
);

console.log("auth smoke passed");

export {};
