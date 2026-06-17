const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function normalizeTransactionDate(date: string): string {
  if (DATE_ONLY_PATTERN.test(date)) {
    return `${date}T00:00:00.000Z`;
  }

  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toISOString();
}

export function normalizeRangeStart(date: string): string {
  if (DATE_ONLY_PATTERN.test(date)) {
    return `${date}T00:00:00.000Z`;
  }

  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toISOString();
}

export function normalizeRangeEnd(date: string): string {
  if (DATE_ONLY_PATTERN.test(date)) {
    return `${date}T23:59:59.999Z`;
  }

  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toISOString();
}

export function getPeriodRange(
  period: "daily" | "monthly" | "yearly",
  dateStr?: string,
): { startDate: string; endDate: string } {
  const refDate = dateStr && DATE_ONLY_PATTERN.test(dateStr)
    ? new Date(`${dateStr}T00:00:00.000Z`)
    : dateStr
      ? new Date(dateStr)
      : new Date();

  if (period === "daily") {
    const day = refDate.toISOString().slice(0, 10);
    return {
      startDate: normalizeRangeStart(day),
      endDate: normalizeRangeEnd(day),
    };
  }

  if (period === "monthly") {
    const start = new Date(Date.UTC(refDate.getUTCFullYear(), refDate.getUTCMonth(), 1));
    const end = new Date(Date.UTC(refDate.getUTCFullYear(), refDate.getUTCMonth() + 1, 0, 23, 59, 59, 999));
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }

  const start = new Date(Date.UTC(refDate.getUTCFullYear(), 0, 1));
  const end = new Date(Date.UTC(refDate.getUTCFullYear(), 11, 31, 23, 59, 59, 999));
  return { startDate: start.toISOString(), endDate: end.toISOString() };
}
