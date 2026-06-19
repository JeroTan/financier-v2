import { describe, expect, it } from "vitest";

import { isUniqueConstraintError } from "./categoryRepository";

describe("isUniqueConstraintError", () => {
  it("recognizes normal unique-constraint errors", () => {
    expect(
      isUniqueConstraintError(
        new Error("D1_ERROR: UNIQUE constraint failed: categories.slug"),
      ),
    ).toBe(true);
  });

  it("recognizes cross-realm D1 error objects", () => {
    const d1Error = {
      message: "SQLITE_CONSTRAINT (extended: SQLITE_CONSTRAINT_UNIQUE)",
    };

    expect(isUniqueConstraintError(d1Error)).toBe(true);
  });

  it("does not hide unrelated database failures", () => {
    expect(
      isUniqueConstraintError({ message: "D1_ERROR: Network connection lost" }),
    ).toBe(false);
  });
});
