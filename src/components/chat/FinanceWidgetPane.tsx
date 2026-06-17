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
  const expenseRatio = income > 0 ? Math.min(100, Math.round((expenses / income) * 100)) : 0;

  return (
    <aside className="hidden min-h-0 w-72 shrink-0 flex-col gap-4 overflow-y-auto border-l border-chat-border bg-surface-container-lowest p-5 xl:flex">
      <WidgetCard label="Total Wealth" value={formatMoney(net)} accent={net >= 0 ? "income" : "expense"}>
        <div className="mt-5 flex h-20 items-end gap-2">
          {[36, 48, 30, 58, 72].map((height, index) => (
            <div
              key={index}
              className="w-full rounded-t-sm bg-primary-container"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <p className="mt-3 text-right text-xs font-semibold text-income">
          {net >= 0 ? "+" : ""}
          {formatMoney(net)}
        </p>
      </WidgetCard>

      <WidgetCard label="Income" value={loading ? "..." : formatMoney(income)} accent="income">
        <ProgressLine value={income > 0 ? 82 : 0} tone="income" />
      </WidgetCard>

      <WidgetCard label="Expenses" value={loading ? "..." : formatMoney(expenses)} accent="expense">
        <ProgressLine value={expenseRatio} tone="expense" />
      </WidgetCard>

      <WidgetCard label="Top Categories" value="This Month">
        <div className="mt-4 space-y-3">
          <CategoryLine label="Food" value={expenses > 0 ? Math.round(expenses * 0.45) : 0} pct={60} />
          <CategoryLine label="Transport" value={expenses > 0 ? Math.round(expenses * 0.25) : 0} pct={36} />
          <CategoryLine label="Other" value={expenses > 0 ? Math.round(expenses * 0.3) : 0} pct={44} />
        </div>
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
