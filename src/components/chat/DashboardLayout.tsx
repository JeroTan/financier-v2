import { useState, useEffect } from "react";
import { ChatWorkspace } from "@/components/chat/ChatWorkspace";
import { StatsDashboard } from "@/components/stats/StatsDashboard";

type DashboardLayoutProps = {
  token?: string;
};

export function DashboardLayout({ token }: DashboardLayoutProps) {
  const [chatActive, setChatActive] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("financier:chat:active");
    if (stored === "true") setChatActive(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("financier:chat:active", String(chatActive));
  }, [chatActive]);

  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col gap-4 lg:h-[calc(100vh-3rem)]">
      {!chatActive && (
        <section className="max-h-[34vh] overflow-y-auto rounded-lg bg-surface-container-lowest p-4 shadow-card">
          <StatsDashboard token={token} />
        </section>
      )}

      <div className="min-h-0 flex-1">
        <ChatWorkspace
          token={token}
          onMessageSent={() => setChatActive(true)}
          headerAction={
            <button
              onClick={() => setChatActive((active) => !active)}
              className="rounded-full border border-outline-variant px-3 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-primary-fixed hover:text-on-primary-fixed"
            >
              {chatActive ? "Show Stats" : "Focus Chat"}
            </button>
          }
        />
      </div>
    </div>
  );
}
