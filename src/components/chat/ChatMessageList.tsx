import { useEffect, useRef } from "react";
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
  confirmation?: Record<string, unknown> | null;
  onConfirm?: (data: Record<string, unknown>) => void;
  onCancel?: () => void;
};

export function ChatMessageList({ messages, streamingText, confirmation, onConfirm, onCancel }: ChatMessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText, confirmation]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg) => (
        <ChatMessage
          key={msg.id}
          role={msg.role}
          content={msg.content}
          timestamp={msg.timestamp}
        />
      ))}

      {streamingText && (
        <ChatMessage role="assistant" content={streamingText} />
      )}

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
