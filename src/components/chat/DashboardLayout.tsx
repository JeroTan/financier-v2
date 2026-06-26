import { useState, useEffect } from "react";
import { ChatWorkspace } from "@/components/chat/ChatWorkspace";
import { StatsSummary } from "@/components/stats/StatsSummary";
import { useStats } from "@/features/stats/useStats";
import { cn } from "@/lib/utils";

type DashboardLayoutProps = {
  token?: string;
  userEmail?: string;
};

export function DashboardLayout({ token, userEmail }: DashboardLayoutProps) {
  const [chatActive, setChatActive] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("financier:chat:active") === "true";
  });

  useEffect(() => {
    localStorage.setItem("financier:chat:active", String(chatActive));
  }, [chatActive]);

  return (
    <div className="flex flex-col gap-4">
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity,transform] duration-300 ease-out",
          chatActive ? "grid-rows-[0fr] -translate-y-2 opacity-0" : "grid-rows-[1fr] translate-y-0 opacity-100",
        )}
        aria-hidden={chatActive}
      >
        <div className="min-h-0 overflow-hidden">
          <DashboardReportingHeader token={token} />
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <ChatWorkspace
          token={token}
          userEmail={userEmail}
          onMessageSent={() => setChatActive(true)}
          onNewChat={() => setChatActive(false)}
        />
      </div>
    </div>
  );
}

function DashboardReportingHeader({ token }: DashboardLayoutProps) {
  const [period, setPeriod] = useState<"daily" | "monthly" | "yearly">("monthly");
  const [date] = useState(() => new Date().toISOString().split("T")[0]);
  const { stats, loading } = useStats(period, date, token);

  const periodLabel = new Intl.DateTimeFormat("en-PH", {
    day: period === "daily" ? "numeric" : undefined,
    month: period === "yearly" ? undefined : "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));

  return (
    <section className="rounded-lg border border-chat-border bg-surface-container-lowest p-4 shadow-card">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="label-md text-muted-foreground">Reporting period</p>
          <p className="mt-1 text-lg font-semibold">{periodLabel}</p>
        </div>
        <div
          className="grid grid-cols-3 rounded-lg bg-surface-container p-1"
          data-testid="dashboard-period-selector"
          role="group"
          aria-label="Reporting period"
        >
          {(["daily", "monthly", "yearly"] as const).map((item) => {
            const active = period === item;

            return (
              <button
                key={item}
                type="button"
                aria-pressed={active}
                onClick={() => setPeriod(item)}
                className={cn(
                  "h-9 rounded-md px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-primary-container text-on-primary-fixed shadow-sm"
                    : "text-muted-foreground hover:bg-surface-container-high hover:text-foreground",
                )}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
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
    </section>
  );
}
