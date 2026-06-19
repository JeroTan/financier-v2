import { describe, expect, it } from "vitest";

import {
  classifyDatabaseError,
  getErrorMessage,
  isDuplicateColumnError,
  isTransientDatabaseError,
  isUniqueConstraintError,
} from "./errors";

describe("D1 error classification", () => {
  it("extracts messages from native and cross-realm errors", () => {
    expect(getErrorMessage(new Error("native"))).toBe("native");
    expect(getErrorMessage({ message: "cross-realm" })).toBe("cross-realm");
  });

  it("recognizes D1 and SQLite unique constraints", () => {
    expect(isUniqueConstraintError(
      new Error("D1_ERROR: UNIQUE constraint failed: categories.slug"),
    )).toBe(true);
    expect(isUniqueConstraintError({
      message: "SQLITE_CONSTRAINT (extended: SQLITE_CONSTRAINT_UNIQUE)",
    })).toBe(true);
  });

  it("recognizes duplicate-column races", () => {
    expect(isDuplicateColumnError({
      message: "D1_ERROR: duplicate column name: refresh_token",
    })).toBe(true);
  });

  it("recognizes observed remote D1 transport failures", () => {
    expect(isTransientDatabaseError({
      message: "D1_ERROR: Failed to parse body as JSON, got: Error: Network connection lost.",
    })).toBe(true);
  });

  it("does not hide unrelated failures", () => {
    expect(classifyDatabaseError({ message: "FOREIGN KEY constraint failed" }))
      .toBe("unknown");
  });
});
