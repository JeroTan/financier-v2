export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError<D = unknown> = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: D;
    requestId?: string;
  };
};

export type ApiResult<T, D = unknown> = ApiSuccess<T> | ApiError<D>;

export class ApiErrorClass extends Error {
  code: string;
  status: number;
  details?: unknown;
  requestId?: string;

  constructor(code: string, message: string, status: number, details?: unknown, requestId?: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
    this.requestId = requestId;
  }
}

let accessToken: string | null = null;
const ACCESS_TOKEN_STORAGE_KEY = "financier:accessToken";

function getBrowserSessionStorage(): Storage | null {
  if (typeof window === "undefined") return null;

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function setApiAccessToken(token: string | null): void {
  accessToken = token;

  const storage = getBrowserSessionStorage();
  if (!storage) return;

  if (token) {
    storage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
  } else {
    storage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  }
}

export function getApiAccessToken(): string | null {
  if (accessToken) return accessToken;

  const storage = getBrowserSessionStorage();
  accessToken = storage?.getItem(ACCESS_TOKEN_STORAGE_KEY) ?? null;
  return accessToken;
}

async function parseResponse<T, D>(response: Response): Promise<ApiResult<T, D>> {
  const requestId = response.headers.get("X-Request-ID") ?? undefined;

  if (!response.ok) {
    let errorBody: { code?: string; message?: string; details?: D } = {
      code: "HTTP_ERROR",
      message: response.statusText,
    };

    try {
      const json = (await response.json()) as { error?: { code?: string; message?: string; details?: D } };
      if (json.error) {
        errorBody = {
          code: json.error.code ?? "HTTP_ERROR",
          message: json.error.message ?? response.statusText,
          details: json.error.details,
        };
      }
    } catch {
      // Non-JSON error response
    }

    throw new ApiErrorClass(
      errorBody.code!,
      errorBody.message!,
      response.status,
      errorBody.details,
      requestId
    );
  }

  const json = (await response.json()) as { data?: T };
  return { success: true, data: json.data ?? (json as unknown as T) } as ApiSuccess<T>;
}

interface RequestOptions {
  headers?: Record<string, string>;
  body?: unknown;
}

async function request<T, D = unknown>(
  method: string,
  path: string,
  options: RequestOptions = {},
): Promise<ApiResult<T, D>> {
  const url = path.startsWith("http") ? path : `/api${path.startsWith("/") ? path : `/${path}`}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const token = getApiAccessToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const init: RequestInit = {
    method,
    headers,
    credentials: "same-origin",
  };

  if (options.body) {
    init.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, init);
    return parseResponse<T, D>(response);
  } catch (error) {
    if (error instanceof ApiErrorClass) throw error;

    throw new ApiErrorClass(
      "NETWORK_ERROR",
      error instanceof Error ? error.message : "Network request failed",
      0,
    );
  }
}

export const apiClient = {
  get: <T, D = unknown>(path: string, options?: RequestOptions) =>
    request<T, D>("GET", path, options),

  post: <T, D = unknown>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T, D>("POST", path, { ...options, body }),

  put: <T, D = unknown>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T, D>("PUT", path, { ...options, body }),

  delete: <T, D = unknown>(path: string, options?: RequestOptions) =>
    request<T, D>("DELETE", path, options),
};
