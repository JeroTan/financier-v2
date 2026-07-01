import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChatMessage } from "./ChatMessage";
import { ChatConfirmationCard } from "./ChatConfirmationCard";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  timestamp: string;
};

type ChatMessageListProps = {
  messages: Message[];
  userEmail?: string;
  streamingText?: string;
  isThinking?: boolean;
  confirmation?: Record<string, unknown> | null;
  onConfirm?: (data: Record<string, unknown>) => void;
  onCancel?: () => void;
  onActionClick?: (action: string) => void;
  categories: string[];
};
function ChatThinkingIndicator() {
  return (
    <div className="flex gap-3" aria-live="polite" aria-label="AI is thinking">
      <Avatar className="h-8 w-8 flex-shrink-0 shadow-sm">
        <AvatarFallback className="bg-muted">AI</AvatarFallback>
      </Avatar>
      <div className="flex max-w-[70%] flex-col items-start">
        <div className="rounded-xl rounded-tl-sm border border-chat-border bg-chat-bot-bg px-4 py-3 text-chat-bot-text">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Thinking</span>
            <span className="flex gap-1" aria-hidden="true">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChatMessageList({
  messages,
  userEmail,
  streamingText,
  isThinking,
  confirmation,
  onConfirm,
  onCancel,
  onActionClick,
  categories,
}: ChatMessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const isEmpty = messages.length === 0 && !streamingText && !isThinking && !confirmation;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText, isThinking, confirmation]);

  return (
    <div className="chat-content relative min-h-0 flex-1 overflow-y-auto space-y-chat-gap bg-surface-container-lowest">
      {isEmpty && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center">
          <p className="max-w-sm text-sm font-medium text-muted-foreground">
            Start chatting about your finances.
          </p>
        </div>
      )}

      {messages.map((msg) => (
        <ChatMessage
          key={msg.id}
          role={msg.role}
          content={msg.content}
          imageUrl={msg.imageUrl}
          timestamp={msg.timestamp}
          onActionClick={onActionClick}
          userEmail={userEmail}
        />
      ))}

      {streamingText ? (
        <ChatMessage role="assistant" content={streamingText} onActionClick={onActionClick} userEmail={userEmail} />
      ) : isThinking ? (
        <ChatThinkingIndicator />
      ) : null}

      {confirmation && onConfirm && onCancel && (
        <ChatConfirmationCard
          data={confirmation}
          onConfirm={onConfirm}
          onCancel={onCancel}
          categories={categories}
        />
      )}

      <div ref={endRef} />
    </div>
  );
}
