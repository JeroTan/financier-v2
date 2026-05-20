import { useState, useEffect, useCallback } from "react";

type StatsData = {
  totalIncome: number;
  totalExpenses: number;
  net: number;
};

type UseStatsReturn = {
  stats: StatsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useStats(period: string, date: string, token: string): UseStatsReturn {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ period, date });
      const response = await fetch(`/api/stats?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json() as { success: boolean; data: StatsData };
      if (data.success) setStats(data.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [period, date, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handler = () => fetchData();
    window.addEventListener("transaction_saved", handler);
    return () => window.removeEventListener("transaction_saved", handler);
  }, [fetchData]);

  return { stats, loading, error, refetch: fetchData };
}
