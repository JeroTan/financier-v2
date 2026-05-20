import { useState, useEffect } from "react";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { StatsDashboard } from "@/components/stats/StatsDashboard";

type DashboardLayoutProps = {
  token: string;
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
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
      {/* Stats Panel */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-y-auto ${
          chatActive ? "lg:w-0 lg:overflow-hidden lg:p-0" : "lg:w-2/5 p-4"
        }`}
      >
        {!chatActive && (
          <div className="h-full">
            <StatsDashboard token={token} />
          </div>
        )}
      </div>

      {/* Divider */}
      {!chatActive && (
        <div className="hidden lg:block w-px bg-border self-stretch" />
      )}

      {/* Chat Panel */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          chatActive ? "w-full" : "lg:w-3/5"
        }`}
      >
        <div className="h-full flex flex-col">
          {!chatActive && (
            <div className="px-4 py-2 flex items-center justify-between border-b">
              <h2 className="font-semibold">AI Chat</h2>
              <button
                onClick={() => setChatActive(true)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Expand
              </button>
            </div>
          )}
          <div className="flex-1">
            <ChatPanel token={token} />
          </div>
        </div>
      </div>
    </div>
  );
}
