export type DatabaseErrorKind =
  | "unique"
  | "duplicate-column"
  | "transient"
  | "unknown";

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;

  if (
    typeof error === "object"
    && error !== null
    && "message" in error
    && typeof error.message === "string"
  ) {
    return error.message;
  }

  return String(error);
}

export function classifyDatabaseError(error: unknown): DatabaseErrorKind {
  const message = getErrorMessage(error).toLowerCase();

  if (
    message.includes("unique constraint failed")
    || message.includes("sqlite_constraint_unique")
  ) {
    return "unique";
  }

  if (
    message.includes("duplicate column")
    || message.includes("sqlite_error: duplicate column")
  ) {
    return "duplicate-column";
  }

  if (
    message.includes("network connection lost")
    || message.includes("failed to parse body as json")
    || message.includes("service unavailable")
    || message.includes("connection reset")
    || message.includes("timed out")
    || message.includes("timeout")
  ) {
    return "transient";
  }

  return "unknown";
}

export function isUniqueConstraintError(error: unknown): boolean {
  return classifyDatabaseError(error) === "unique";
}

export function isDuplicateColumnError(error: unknown): boolean {
  return classifyDatabaseError(error) === "duplicate-column";
}

export function isTransientDatabaseError(error: unknown): boolean {
  return classifyDatabaseError(error) === "transient";
}
