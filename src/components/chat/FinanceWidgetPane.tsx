import { useState } from "react";
import type { ReactNode } from "react";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useStats } from "@/features/stats/useStats";
import { cn } from "@/lib/utils";

type FinanceWidgetPaneProps = {
  token?: string;
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);

export function FinanceWidgetPane({ token }: FinanceWidgetPaneProps) {
  const [date] = useState(() => new Date().toISOString().split("T")[0]);
  const { stats, loading } = useStats("monthly", date, token);
  const income = stats?.totalIncome ?? 0;
  const expenses = stats?.totalExpenses ?? 0;
  const net = stats?.net ?? 0;
  const topCategories = stats?.topCategories ?? [];
  const hasActivity = income > 0 || expenses > 0 || topCategories.length > 0;
  const expenseRatio = income > 0 ? Math.min(100, Math.round((expenses / income) * 100)) : 0;

  return (
    <aside className="hidden min-h-0 w-72 shrink-0 flex-col gap-4 overflow-y-auto border-l border-chat-border bg-surface-container-lowest p-5 xl:flex">
      <WidgetCard label="Total Wealth" value={loading ? "..." : formatMoney(net)} accent={net >= 0 ? "income" : "expense"}>
        {loading ? (
          <WidgetNote>Loading monthly activity...</WidgetNote>
        ) : hasActivity ? (
          <div className="mt-5 space-y-2 text-xs text-muted-foreground">
            <MetricRow label="Income" value={formatMoney(income)} tone="income" />
            <MetricRow label="Expenses" value={formatMoney(expenses)} tone="expense" />
            <MetricRow label="Net" value={formatMoney(net)} tone={net >= 0 ? "income" : "expense"} />
          </div>
        ) : (
          <WidgetNote>No transactions this month.</WidgetNote>
        )}
      </WidgetCard>

      <WidgetCard label="Income" value={loading ? "..." : formatMoney(income)} accent="income">
        {loading ? <WidgetNote>Loading income...</WidgetNote> : <ProgressLine value={income > 0 ? 100 : 0} tone="income" />}
      </WidgetCard>

      <WidgetCard label="Expenses" value={loading ? "..." : formatMoney(expenses)} accent="expense">
        {loading ? (
          <WidgetNote>Loading expenses...</WidgetNote>
        ) : (
          <ProgressLine value={expenses > 0 && income === 0 ? 100 : expenseRatio} tone="expense" />
        )}
      </WidgetCard>

      <WidgetCard label="Top Categories" value={loading ? "..." : topCategories.length > 0 ? "This Month" : "No expenses"}>
        {loading ? (
          <WidgetNote>Loading categories...</WidgetNote>
        ) : topCategories.length > 0 ? (
          <div className="mt-4 space-y-3">
            {topCategories.map((category) => (
              <CategoryLine
                key={category.categoryId ?? category.name}
                label={category.name}
                value={category.total}
                pct={category.percentage}
              />
            ))}
          </div>
        ) : (
          <WidgetNote>No spending categories yet.</WidgetNote>
        )}
      </WidgetCard>
    </aside>
  );
}

function WidgetCard({
  label,
  value,
  accent,
  children,
}: {
  label: string;
  value: string;
  accent?: "income" | "expense";
  children: ReactNode;
}) {
  const Icon = accent === "expense" ? TrendingDown : accent === "income" ? TrendingUp : Wallet;

  return (
    <section className="rounded-lg bg-card p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="label-md text-muted-foreground">{label}</p>
          <p
            className={cn(
              "mt-2 text-xl font-bold leading-none",
              accent === "income" && "text-income",
              accent === "expense" && "text-expense",
            )}
          >
            {value}
          </p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      {children}
    </section>
  );
}

function ProgressLine({ value, tone }: { value: number; tone: "income" | "expense" }) {
  return (
    <div className="mt-5 h-2 overflow-hidden rounded-full bg-surface-container">
      <div
        className={cn("h-full rounded-full", tone === "income" ? "bg-income" : "bg-expense")}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function WidgetNote({ children }: { children: ReactNode }) {
  return (
    <div className="mt-5 rounded-lg border border-dashed border-outline-variant bg-surface-container-low p-3 text-sm text-muted-foreground">
      {children}
    </div>
  );
}

function MetricRow({ label, value, tone }: { label: string; value: string; tone: "income" | "expense" }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className={cn("font-semibold", tone === "income" ? "text-income" : "text-expense")}>{value}</span>
    </div>
  );
}

function CategoryLine({ label, value, pct }: { label: string; value: number; pct: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-foreground">{label}</span>
        <span className="text-muted-foreground">{formatMoney(value)}</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-container">
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
