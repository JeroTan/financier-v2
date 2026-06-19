import { ArrowDownLeft, ArrowUpRight, Scale } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type StatsSummaryProps = {
  totalIncome: number;
  totalExpenses: number;
  net: number;
  loading?: boolean;
};

const formatCurrency = (amount: number) => new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
}).format(amount);

export function StatsSummary({ totalIncome, totalExpenses, net, loading }: StatsSummaryProps) {
  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="min-h-36 rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-card"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-9 rounded-md" />
            </div>
            <Skeleton className="mt-7 h-8 w-32" />
          </div>
        ))}
      </div>
    );
  }

  const summaries = [
    {
      label: "Income",
      value: totalIncome,
      prefix: "+",
      icon: ArrowDownLeft,
      amountClass: "text-income",
      iconClass: "bg-income-bg text-income",
    },
    {
      label: "Expenses",
      value: totalExpenses,
      prefix: "-",
      icon: ArrowUpRight,
      amountClass: "text-expense",
      iconClass: "bg-expense-bg text-expense",
    },
    {
      label: "Net balance",
      value: net,
      prefix: net >= 0 ? "+" : "",
      icon: Scale,
      amountClass: net >= 0 ? "text-income" : "text-expense",
      iconClass: "bg-primary-fixed text-on-primary-fixed",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3" data-testid="stats-summary">
      {summaries.map((summary) => {
        const Icon = summary.icon;

        return (
          <article
            key={summary.label}
            data-testid="stats-summary-card"
            className="min-w-0 rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-card"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="label-md text-muted-foreground">{summary.label}</p>
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${summary.iconClass}`}>
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <p className={`data-display mt-7 break-words tabular-nums ${summary.amountClass}`}>
              {summary.prefix}{formatCurrency(summary.value)}
            </p>
          </article>
        );
      })}
    </div>
  );
}
