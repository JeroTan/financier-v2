import { useState, useEffect } from "react";
import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsSummary } from "@/components/stats/StatsSummary";
import { StatsLedgerTable } from "@/components/stats/StatsLedgerTable";
import { GoalCard } from "@/components/stats/GoalCard";
import { GoalCreationForm } from "@/components/stats/GoalCreationForm";
import { useStats } from "@/features/stats/useStats";

type StatsDashboardProps = {
  token?: string;
};

type Goal = {
  id: string;
  label: string;
  target: number;
  icon?: string;
};

export function StatsDashboard({ token }: StatsDashboardProps) {
  const [period, setPeriod] = useState<"daily" | "monthly" | "yearly">("monthly");
  const [date] = useState(() => new Date().toISOString().split("T")[0]);
  const [goals, setGoals] = useState<Goal[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      const stored = localStorage.getItem("financier:goals");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const { stats, loading, error, refetch } = useStats(period, date, token);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("financier:goals", JSON.stringify(goals));
  }, [goals]);

  const handleCreateGoal = async (label: string, target: number) => {
    const newGoal: Goal = {
      id: crypto.randomUUID() as string,
      label,
      target,
    };
    setGoals((prev) => [...prev, newGoal]);
  };

  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const ledgerEntries = stats
    ? [
        { label: "Income", amount: stats.totalIncome, type: "income" as const },
        { label: "Expenses", amount: stats.totalExpenses, type: "expense" as const },
      ]
    : [];

  const periodLabel = new Intl.DateTimeFormat("en-PH", {
    day: period === "daily" ? "numeric" : undefined,
    month: period === "yearly" ? undefined : "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="label-md text-muted-foreground">Reporting period</p>
          <p className="mt-1 text-lg font-semibold">{periodLabel}</p>
        </div>
        <div
          className="grid grid-cols-3 rounded-lg bg-surface-container p-1"
          data-testid="stats-period-selector"
          role="group"
          aria-label="Reporting period"
        >
          {(["daily", "monthly", "yearly"] as const).map((p) => {
            const active = period === p;

            return (
              <button
                key={p}
                type="button"
                aria-pressed={active}
                onClick={() => setPeriod(p)}
                className={`h-9 rounded-md px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? "bg-primary-container text-on-primary-fixed shadow-sm" : "text-muted-foreground hover:bg-surface-container-high hover:text-foreground"}`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      <StatsSummary
        totalIncome={stats?.totalIncome ?? 0}
        totalExpenses={stats?.totalExpenses ?? 0}
        net={stats?.net ?? 0}
        loading={loading}
      />

      {error && (
        <div className="rounded-lg border border-error/40 bg-error-container p-5 text-center">
          <p className="text-destructive mb-2">{error}</p>
          <Button variant="outline" size="sm" onClick={refetch}>Retry</Button>
        </div>
      )}

      {!error && <StatsLedgerTable entries={ledgerEntries} loading={loading} />}

      <section className="space-y-4 border-t border-outline-variant pt-6">
        <div>
          <p className="label-md text-muted-foreground">Planning</p>
          <h2 className="mt-1 text-lg font-semibold">Goals</h2>
        </div>
        {goals.length === 0 ? (
          <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-low p-6 text-center text-muted-foreground">
            <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-primary-fixed text-on-primary-fixed">
              <Target className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-sm">No goals yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                id={goal.id}
                label={goal.label}
                current={stats && stats.net > 0 ? Math.min(stats.net, goal.target) : 0}
                target={goal.target}
                icon={goal.icon}
                onDelete={handleDeleteGoal}
              />
            ))}
          </div>
        )}
        <GoalCreationForm onCreate={handleCreateGoal} />
      </section>
    </div>
  );
}
