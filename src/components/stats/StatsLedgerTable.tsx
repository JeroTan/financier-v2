import { ArrowDownLeft, ArrowUpRight, ClipboardList } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type LedgerEntry = {
  label: string;
  amount: number;
  type: "income" | "expense";
};

type StatsLedgerTableProps = {
  entries: LedgerEntry[];
  loading?: boolean;
};

const formatCurrency = (amount: number) => new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
}).format(amount);

export function StatsLedgerTable({ entries, loading }: StatsLedgerTableProps) {
  if (loading) {
    return (
      <section className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-card">
        <div className="border-b border-outline-variant px-5 py-4">
          <Skeleton className="h-5 w-36" />
        </div>
        <div className="space-y-4 p-5">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </section>
    );
  }

  if (entries.length === 0) {
    return (
      <section className="rounded-lg border border-outline-variant bg-surface-container-lowest py-10 text-center text-muted-foreground shadow-card">
          <ClipboardList className="mx-auto mb-2 h-8 w-8" aria-hidden="true" />
          <p>No transactions for this period.</p>
      </section>
    );
  }

  return (
    <section
      className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-card"
      data-testid="stats-breakdown"
    >
      <div className="border-b border-outline-variant px-5 py-4">
        <h2 className="text-base font-semibold">Period breakdown</h2>
      </div>
      <div className="divide-y divide-outline-variant">
        {entries.map((entry) => {
          const isIncome = entry.type === "income";
          const Icon = isIncome ? ArrowDownLeft : ArrowUpRight;

          return (
            <div key={entry.type} className="flex items-center gap-3 px-5 py-4">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${isIncome ? "bg-income-bg text-income" : "bg-expense-bg text-expense"}`}>
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <p className="min-w-0 flex-1 text-sm font-medium">{entry.label}</p>
              <p className={`shrink-0 text-sm font-semibold tabular-nums ${isIncome ? "text-income" : "text-expense"}`}>
                {isIncome ? "+" : "-"}{formatCurrency(entry.amount)}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
