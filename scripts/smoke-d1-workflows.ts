const baseUrl = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:4321";
const origin = new URL(baseUrl).origin;
const smokeIp = `127.0.2.${Math.floor(Math.random() * 200) + 2}`;
const email = `smoke-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.test`;
const password = "Password123!";
const newPassword = "Password456!";

type AuthBody = {
  success: true;
  data: {
    accessToken: string;
    refreshToken: string;
  };
};

type ErrorBody = {
  error?: {
    code?: string;
    message?: string;
  };
};

function url(path: string): URL {
  return new URL(path, baseUrl);
}

function jsonHeaders(token?: string): Headers {
  const headers = new Headers({
    "Content-Type": "application/json",
    Origin: origin,
    "CF-Connecting-IP": smokeIp,
  });
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

async function readJson<T>(response: Response): Promise<T> {
  return await response.json() as T;
}

async function requestJson<T>(
  path: string,
  init: RequestInit,
  expectedStatus: number,
): Promise<{ response: Response; body: T }> {
  const headers = new Headers(init.headers);
  if (!headers.has("Origin")) headers.set("Origin", origin);
  if (!headers.has("CF-Connecting-IP")) headers.set("CF-Connecting-IP", smokeIp);
  const response = await fetch(url(path), { ...init, headers, redirect: "manual" });
  if (response.status !== expectedStatus) {
    const text = await response.text();
    throw new Error(`${path} expected ${expectedStatus}, got ${response.status}: ${text}`);
  }
  return { response, body: await readJson<T>(response) };
}

function assertErrorCode(path: string, body: ErrorBody, expectedCode: string): void {
  if (body.error?.code !== expectedCode) {
    throw new Error(`${path} expected error ${expectedCode}, got ${body.error?.code ?? "missing"}`);
  }
}

async function authRequest(path: string, body: unknown, expectedStatus: number): Promise<AuthBody> {
  const result = await requestJson<AuthBody>(path, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(body),
  }, expectedStatus);
  if (!result.body.success || !result.body.data.accessToken || !result.body.data.refreshToken) {
    throw new Error(`${path} did not return auth tokens`);
  }
  return result.body;
}

async function assertSse(path: string, body: unknown, token: string, expectedDoneType: string): Promise<string> {
  const response = await fetch(url(path), {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(body),
  });
  if (response.status !== 200) {
    throw new Error(`${path} expected 200, got ${response.status}: ${await response.text()}`);
  }
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/event-stream")) {
    throw new Error(`${path} expected text/event-stream, got ${contentType}`);
  }
  const text = await response.text();
  if (!text.includes("event: done")) {
    throw new Error(`${path} missing done event: ${text}`);
  }
  if (!text.includes(`"type":"${expectedDoneType}"`)) {
    throw new Error(`${path} expected done type ${expectedDoneType}: ${text}`);
  }
  return text;
}

async function assertSseWithTransientRetry(
  path: string,
  body: unknown,
  token: string,
  expectedDoneType: string,
): Promise<string> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await assertSse(path, body, token, expectedDoneType);
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      if (!/capacity temporarily exceeded|temporarily unavailable/i.test(message) || attempt === 3) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, attempt * 2_000));
    }
  }
  throw lastError;
}

const registered = await authRequest("/api/auth/register", { email, password }, 201);
const loggedIn = await authRequest("/api/auth/login", { email, password }, 200);
const token = loggedIn.data.accessToken;
const refreshToken = loggedIn.data.refreshToken;

await requestJson<AuthBody>("/api/auth/refresh", {
  method: "POST",
  headers: jsonHeaders(),
  body: JSON.stringify({ refreshToken }),
}, 200);

await requestJson("/api/settings", {
  method: "GET",
  headers: jsonHeaders(token),
}, 200);

await requestJson("/api/settings/preferences", {
  method: "PUT",
  headers: jsonHeaders(token),
  body: JSON.stringify({ personality: "default", theme: "dark" }),
}, 200);

await requestJson("/api/settings/password", {
  method: "PUT",
  headers: jsonHeaders(token),
  body: JSON.stringify({ currentPassword: password, newPassword }),
}, 200);

const oldPasswordLogin = await requestJson<ErrorBody>("/api/auth/login", {
  method: "POST",
  headers: jsonHeaders(),
  body: JSON.stringify({ email, password }),
}, 401);
assertErrorCode("/api/auth/login", oldPasswordLogin.body, "INVALID_CREDENTIALS");

const relogged = await authRequest("/api/auth/login", { email, password: newPassword }, 200);
const currentToken = relogged.data.accessToken;

const unlink = await requestJson<ErrorBody>("/api/settings/unlink-google", {
  method: "POST",
  headers: jsonHeaders(currentToken),
}, 400);
assertErrorCode("/api/settings/unlink-google", unlink.body, "NOT_LINKED");

await Promise.all([
  requestJson("/api/categories", { method: "GET", headers: jsonHeaders(currentToken) }, 200),
  requestJson("/api/categories", { method: "GET", headers: jsonHeaders(currentToken) }, 200),
]);

await requestJson("/api/categories", {
  method: "POST",
  headers: jsonHeaders(currentToken),
  body: JSON.stringify({ name: `Smoke ${Date.now()}`, icon: "S" }),
}, 200);

const today = new Date().toISOString().slice(0, 10);
await requestJson("/api/transactions", {
  method: "POST",
  headers: jsonHeaders(currentToken),
  body: JSON.stringify({
    type: "expense",
    amount: 50,
    category: "Food",
    description: "Smoke expense",
    date: today,
  }),
}, 200);

await requestJson("/api/transactions", {
  method: "POST",
  headers: jsonHeaders(currentToken),
  body: JSON.stringify({
    type: "income",
    amount: 50,
    category: "Salary",
    description: "Smoke income",
    date: today,
  }),
}, 200);

await requestJson("/api/transactions?limit=10&page=1", {
  method: "GET",
  headers: jsonHeaders(currentToken),
}, 200);

await requestJson(`/api/stats?period=monthly&date=${today}`, {
  method: "GET",
  headers: jsonHeaders(currentToken),
}, 200);

await assertSseWithTransientRetry("/api/chat", {
  messageTrail: [],
  newMessage: "Give me one short budgeting tip.",
}, currentToken, "normal");

await assertSse("/api/chat", {
  messageTrail: [],
  newMessage: "I spent 50 pesos on lunch",
}, currentToken, "confirmation");

await assertSse("/api/chat", {
  messageTrail: [],
  newMessage: "Save this transaction",
  confirmationData: {
    type: "income",
    amount: 50,
    currency: "PHP",
    category: "Salary",
    description: "Smoke chat income",
    date: today,
  },
}, currentToken, "saved");

await requestJson("/api/auth/logout", {
  method: "POST",
  headers: jsonHeaders(currentToken),
}, 200);

console.log(`D1 workflow smoke passed for ${email}; initial register token length ${registered.data.accessToken.length}`);

export {};
