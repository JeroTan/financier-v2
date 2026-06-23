import type { ConfirmationData } from "@/server/ai/llm/types";

export type ParsedTransactionIntent = ConfirmationData;

const EXPENSE_WORDS = [
  "spent",
  "spend",
  "paid",
  "pay",
  "bought",
  "buy",
  "purchased",
  "purchase",
  "expense",
  "expenses",
  "cost",
  "costs",
];

const INCOME_WORDS = [
  "gained",
  "gain",
  "earned",
  "earn",
  "received",
  "receive",
  "got",
  "income",
  "salary",
  "allowance",
  "sold",
  "made",
];

const EXPENSE_CLEANUP_WORDS = EXPENSE_WORDS;
const INCOME_CLEANUP_WORDS = [
  "gained",
  "gain",
  "earned",
  "earn",
  "received",
  "receive",
  "got",
  "income",
  "sold",
  "made",
];

const CATEGORY_HINTS: Array<{ category: string; terms: string[] }> = [
  { category: "Food", terms: ["food", "lunch", "dinner", "breakfast", "coffee", "snack", "meal", "restaurant"] },
  { category: "Transport", terms: ["transport", "bus", "taxi", "grab", "gas", "fuel", "jeep", "train", "fare"] },
  { category: "Shopping", terms: ["shopping", "clothes", "shirt", "shoes", "store", "mall"] },
  { category: "Entertainment", terms: ["movie", "game", "concert", "netflix", "spotify"] },
  { category: "Bills", terms: ["bill", "electric", "water", "internet", "rent", "subscription"] },
  { category: "Salary", terms: ["salary", "paycheck", "allowance"] },
  { category: "Freelance", terms: ["freelance", "client", "commission"] },
  { category: "Investment", terms: ["dividend", "interest", "investment"] },
];

const AMOUNT_PATTERNS = [
  /(?:php|peso|pesos|₱)\s*([0-9][0-9,]*(?:\.[0-9]+)?)/i,
  /([0-9][0-9,]*(?:\.[0-9]+)?)\s*(?:php|peso|pesos|₱)\b/i,
  /\b([0-9][0-9,]*(?:\.[0-9]+)?)\b/i,
];

export function parseTransactionIntent(
  message: string,
  now: Date = new Date(),
): ParsedTransactionIntent | null {
  const trimmed = message.trim();
  if (!trimmed) return null;
  if (isQuestionOrHypothetical(trimmed)) return null;

  const lower = trimmed.toLowerCase();
  const expenseIndex = firstWordIndex(lower, EXPENSE_WORDS);
  const incomeIndex = firstWordIndex(lower, INCOME_WORDS);
  const type = resolveType(expenseIndex, incomeIndex);
  if (!type) return null;

  const amountMatch = findAmount(trimmed);
  if (!amountMatch) return null;

  const category = inferCategory(lower, type);
  const description = buildDescription(trimmed, amountMatch.raw, category, type);

  return {
    type,
    amount: amountMatch.amount,
    currency: "PHP",
    category,
    description,
    date: toLocalDate(now),
  };
}

function isQuestionOrHypothetical(message: string): boolean {
  if (message.includes("?")) return true;

  return /^(?:how|what|when|where|why|which|can|could|would|should|do|did|does|is|are)\b/i.test(message)
    || /\b(?:if|suppose|assuming|imagine)\s+(?:i|we|my|our)\b/i.test(message);
}

export function formatTransactionConfirmation(data: ParsedTransactionIntent): string {
  const typeLabel = data.type === "income" ? "Income" : "Expense";
  const amount = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: data.currency,
  }).format(data.amount);
  const detail = data.description ? ` for ${data.description}` : "";

  return `Got it. ${typeLabel}: ${amount}${detail}. Date: ${data.date}. Save this?`;
}

function firstWordIndex(message: string, words: string[]): number {
  let first = -1;

  for (const word of words) {
    const match = new RegExp(`\\b${escapeRegExp(word)}\\b`, "i").exec(message);
    if (!match) continue;
    if (first === -1 || match.index < first) first = match.index;
  }

  return first;
}

function resolveType(
  expenseIndex: number,
  incomeIndex: number,
): "income" | "expense" | null {
  if (expenseIndex === -1 && incomeIndex === -1) return null;
  if (expenseIndex === -1) return "income";
  if (incomeIndex === -1) return "expense";

  return incomeIndex < expenseIndex ? "income" : "expense";
}

function findAmount(message: string): { amount: number; raw: string } | null {
  for (const pattern of AMOUNT_PATTERNS) {
    const match = pattern.exec(message);
    if (!match?.[1]) continue;

    const amount = Number(match[1].replace(/,/g, ""));
    if (Number.isFinite(amount) && amount > 0) {
      return { amount, raw: match[0] };
    }
  }

  return null;
}

function inferCategory(message: string, type: "income" | "expense"): string {
  for (const { category, terms } of CATEGORY_HINTS) {
    if (terms.some((term) => message.includes(term))) return category;
  }

  return type === "income" ? "Other" : "Other";
}

function buildDescription(
  message: string,
  rawAmount: string,
  category: string,
  type: "income" | "expense",
): string {
  const verbs = type === "income" ? INCOME_CLEANUP_WORDS : EXPENSE_CLEANUP_WORDS;
  let description = message
    .replace(rawAmount, " ")
    .replace(new RegExp(`\\b(?:${verbs.map(escapeRegExp).join("|")})\\b`, "gi"), " ")
    .replace(/\b(?:i|my|me|from|for|on|at|today|yesterday|this|a|an|the)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!description || /^[.,!?-]+$/.test(description)) {
    description = category;
  }

  return description;
}

function toLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
