import type { ReactNode } from "react";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { FinanceWidgetPane } from "@/components/chat/FinanceWidgetPane";

type ChatWorkspaceProps = {
  token?: string;
  onMessageSent?: () => void;
  onNewChat?: () => void;
  headerAction?: ReactNode;
};

export function ChatWorkspace({ token, onMessageSent, onNewChat, headerAction }: ChatWorkspaceProps) {
  return (
    <div className="flex h-[calc(100vh-2rem)] min-h-[38rem] overflow-hidden rounded-lg border border-chat-border bg-surface-container-lowest shadow-card lg:h-[calc(100vh-3rem)]">
      <section className="min-w-0 flex-1">
        <ChatPanel token={token} onMessageSent={onMessageSent} onNewChat={onNewChat} headerAction={headerAction} />
      </section>
      <FinanceWidgetPane token={token} />
    </div>
  );
}
