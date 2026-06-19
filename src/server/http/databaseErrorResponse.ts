import { isTransientDatabaseError } from "@/server/db/errors";

export function databaseUnavailableError(message = "D1_ERROR: service unavailable"): Error {
  return new Error(message.toLowerCase().includes("service unavailable")
    ? message
    : `D1_ERROR: service unavailable: ${message}`);
}

export function databaseErrorResponse(
  error: unknown,
  requestId?: string,
): Response {
  const transient = isTransientDatabaseError(error);
  const status = transient ? 503 : 500;
  const code = transient ? "DATABASE_UNAVAILABLE" : "SERVER_ERROR";
  const message = transient
    ? "Database temporarily unavailable. Please retry."
    : "A database error occurred.";

  return new Response(
    JSON.stringify({
      error: {
        code,
        message,
        ...(requestId ? { requestId } : {}),
      },
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        ...(requestId ? { "X-Request-ID": requestId } : {}),
        ...(transient ? { "Retry-After": "1" } : {}),
      },
    },
  );
}

export async function withDatabaseErrorResponse(
  context: { locals?: { requestId?: string } },
  operation: () => Promise<Response>,
): Promise<Response> {
  try {
    return await operation();
  } catch (error) {
    return databaseErrorResponse(error, context.locals?.requestId);
  }
}
