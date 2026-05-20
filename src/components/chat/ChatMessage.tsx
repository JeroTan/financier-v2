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
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className={isUser ? "bg-gold-500 text-gold-950" : "bg-muted"}>
          {isUser ? "U" : "AI"}
        </AvatarFallback>
      </Avatar>
      <div className={`max-w-[75%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`rounded-2xl px-4 py-2 ${
            isUser
              ? "bg-gold-500 text-gold-950 rounded-tr-sm"
              : "bg-muted text-foreground rounded-tl-sm"
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
          <span className="text-xs text-muted-foreground mt-1 px-1">{timestamp}</span>
        )}
      </div>
    </div>
  );
}
