import { describe, expect, it } from "vitest";
import { formatTransactionConfirmation, parseTransactionIntent } from "./transactionIntent";

const NOW = new Date("2026-06-17T09:00:00+08:00");

describe("transaction intent parser", () => {
  it("parses peso expenses", () => {
    expect(parseTransactionIntent("I spent 50 pesos on lunch today", NOW)).toEqual({
      type: "expense",
      amount: 50,
      currency: "PHP",
      category: "Food",
      description: "lunch",
      date: "2026-06-17",
    });
  });

  it("parses peso income", () => {
    expect(parseTransactionIntent("I gain 50 pesos from allowance today", NOW)).toEqual({
      type: "income",
      amount: 50,
      currency: "PHP",
      category: "Salary",
      description: "allowance",
      date: "2026-06-17",
    });
  });

  it("does not turn finance questions into transactions", () => {
    expect(parseTransactionIntent("How much did I spend today?", NOW)).toBeNull();
    expect(parseTransactionIntent("If I spend 100 today, how much must I gain?", NOW)).toBeNull();
  });

  it("formats confirmation copy", () => {
    const parsed = parseTransactionIntent("I spent 50 pesos on lunch today", NOW);

    expect(parsed && formatTransactionConfirmation(parsed)).toBe(
      "Got it. Expense: ₱50.00 for lunch. Date: 2026-06-17. Save this?",
    );
  });
});
