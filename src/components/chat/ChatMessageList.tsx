import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChatMessage } from "./ChatMessage";
import { ChatConfirmationCard } from "./ChatConfirmationCard";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

type ChatMessageListProps = {
  messages: Message[];
  streamingText?: string;
  isThinking?: boolean;
  confirmation?: Record<string, unknown> | null;
  onConfirm?: (data: Record<string, unknown>) => void;
  onCancel?: () => void;
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

export function ChatMessageList({ messages, streamingText, isThinking, confirmation, onConfirm, onCancel }: ChatMessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText, isThinking, confirmation]);

  return (
    <div className="chat-content min-h-0 flex-1 overflow-y-auto space-y-chat-gap bg-surface-container-lowest">
      {messages.map((msg) => (
        <ChatMessage
          key={msg.id}
          role={msg.role}
          content={msg.content}
          timestamp={msg.timestamp}
        />
      ))}

      {streamingText ? (
        <ChatMessage role="assistant" content={streamingText} />
      ) : isThinking ? (
        <ChatThinkingIndicator />
      ) : null}

      {confirmation && onConfirm && onCancel && (
        <ChatConfirmationCard
          data={confirmation}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      )}

      <div ref={endRef} />
    </div>
  );
}
