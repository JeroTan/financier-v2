import { describe, expect, it } from "vitest";

import { databaseErrorResponse, databaseUnavailableError } from "./databaseErrorResponse";

describe("databaseErrorResponse", () => {
  it("returns a retryable service response for observed D1 network failures", async () => {
    const response = databaseErrorResponse(
      { message: "D1_ERROR: Network connection lost." },
      "request-123",
    );

    expect(response.status).toBe(503);
    expect(response.headers.get("Retry-After")).toBe("1");
    expect(response.headers.get("X-Request-ID")).toBe("request-123");
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "DATABASE_UNAVAILABLE",
        message: "Database temporarily unavailable. Please retry.",
        requestId: "request-123",
      },
    });
  });

  it("does not expose unknown database details", async () => {
    const response = databaseErrorResponse(
      new Error("Failed query with private parameters"),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "SERVER_ERROR",
        message: "A database error occurred.",
      },
    });
  });

  it("maps missing DB bindings to the retryable database envelope", async () => {
    const response = databaseErrorResponse(
      databaseUnavailableError("D1_ERROR: DB binding not available"),
      "request-789",
    );

    expect(response.status).toBe(503);
    expect(response.headers.get("X-Request-ID")).toBe("request-789");
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "DATABASE_UNAVAILABLE",
        message: "Database temporarily unavailable. Please retry.",
        requestId: "request-789",
      },
    });
  });
});
