import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { StatsSummary } from "@/components/stats/StatsSummary";
import { StatsLedgerTable } from "@/components/stats/StatsLedgerTable";
import { GoalCard } from "@/components/stats/GoalCard";
import { GoalCreationForm } from "@/components/stats/GoalCreationForm";
import { useStats } from "@/features/stats/useStats";

type StatsDashboardProps = {
  token: string;
};

type Goal = {
  id: string;
  label: string;
  target: number;
  icon?: string;
};

export function StatsDashboard({ token }: StatsDashboardProps) {
  const [period, setPeriod] = useState<"daily" | "monthly" | "yearly">("monthly");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [goals, setGoals] = useState<Goal[]>(() => {
    try {
      const stored = localStorage.getItem("financier:goals");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const { stats, loading, error, refetch } = useStats(period, date, token);

  useEffect(() => {
    localStorage.setItem("financier:goals", JSON.stringify(goals));
  }, [goals]);

  const handleCreateGoal = async (label: string, target: number) => {
    const newGoal: Goal = {
      id: crypto.randomUUID() as string,
      label,
      target,
      icon: "🎯",
    };
    setGoals((prev) => [...prev, newGoal]);
  };

  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const ledgerEntries = stats
    ? [
        { label: "Total Income", icon: "📈", amount: stats.totalIncome, type: "income" as const },
        { label: "Total Expenses", icon: "📉", amount: stats.totalExpenses, type: "expense" as const },
      ]
    : [];

  return (
    <div className="space-y-4">
      {/* Period Toggle */}
      <div className="flex gap-2">
        {(["daily", "monthly", "yearly"] as const).map((p) => (
          <Button
            key={p}
            variant={period === p ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod(p)}
            className={period === p ? "bg-gold-500 text-gold-950 hover:bg-gold-600" : ""}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </Button>
        ))}
      </div>

      {/* Stats Summary */}
      <StatsSummary
        totalIncome={stats?.totalIncome ?? 0}
        totalExpenses={stats?.totalExpenses ?? 0}
        net={stats?.net ?? 0}
        loading={loading}
      />

      {/* Error State */}
      {error && (
        <div className="text-center py-4">
          <p className="text-destructive mb-2">{error}</p>
          <Button variant="outline" size="sm" onClick={refetch}>Retry</Button>
        </div>
      )}

      {/* Ledger Table */}
      {!error && <StatsLedgerTable entries={ledgerEntries} loading={loading} />}

      {/* Goals */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Goals</h3>
        {goals.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <div className="text-3xl mb-2">🎯</div>
            <p>No goals set yet. Create your first financial goal!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                id={goal.id}
                label={goal.label}
                current={stats?.net ?? 0 > 0 ? Math.min(stats!.net, goal.target) : 0}
                target={goal.target}
                icon={goal.icon}
                onDelete={handleDeleteGoal}
              />
            ))}
          </div>
        )}
        <GoalCreationForm onCreate={handleCreateGoal} />
      </div>
    </div>
  );
}
