import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ActionRenderer } from "@/components/chat/actions/ActionRenderer";
import { parseActions, type ParsedSegment } from "@/lib/chat/actionParser";

type ChatMessageProps = {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
};

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === "user";
  const segments: ParsedSegment[] = isUser ? [] : parseActions(content);

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <Avatar className="h-8 w-8 flex-shrink-0 shadow-sm">
        <AvatarFallback className={isUser ? "bg-gold-500 text-gold-950" : "bg-muted"}>
          {isUser ? "U" : "AI"}
        </AvatarFallback>
      </Avatar>
      <div className={`max-w-[70%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`rounded-xl border px-4 py-3 ${
            isUser
              ? "rounded-tr-sm border-primary-fixed-dim bg-primary-fixed-dim text-on-primary-fixed"
              : "rounded-tl-sm border-chat-border bg-chat-bot-bg text-chat-bot-text"
          }`}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap">{content}</p>
          ) : (
            <div className="text-sm">
              <ActionRenderer segments={segments.length > 0 ? segments : [{ kind: "text", content }]} />
            </div>
          )}
        </div>
        {timestamp && (
          <span className="mt-1 px-1 text-xs text-muted-foreground">{timestamp}</span>
        )}
      </div>
    </div>
  );
}
