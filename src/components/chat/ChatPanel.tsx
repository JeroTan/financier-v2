import { useState, useCallback, useEffect, type ReactNode } from "react";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { useChatStateMachine } from "@/features/chat/useChatStateMachine";
import { useMessageTrail } from "@/features/chat/useMessageTrail";
import { useChatSSE } from "@/features/chat/useChatSSE";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ChatPanelProps = {
  token?: string;
  className?: string;
  headerAction?: ReactNode;
  onMessageSent?: () => void;
  onNewChat?: () => void;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

const DEFAULT_CATEGORY_NAMES = [
  "Bills",
  "Entertainment",
  "Food",
  "Freelance",
  "Investment",
  "Other",
  "Salary",
  "Shopping",
  "Transport",
];

function mergeCategoryNames(current: string[], next: string[]): string[] {
  return Array.from(new Set([...current, ...next].map((category) => category.trim()).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b));
}

export function ChatPanel({ token, className, headerAction, onMessageSent, onNewChat }: ChatPanelProps) {
  const { state, transition, setState } = useChatStateMachine();
  const { trail, ready: trailReady, addMessage, getTrailForAPI, clearTrail } = useMessageTrail();
  const { streamingText, doneData, error, startStream } = useChatSSE();
  const [messages, setMessages] = useState<Message[]>([]);
  const [confirmationData, setConfirmationData] = useState<Record<string, unknown> | null>(null);
  const [restoredTrail, setRestoredTrail] = useState(false);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORY_NAMES);

  const loadCategories = useCallback(() => {
    fetch("/api/categories", {
      credentials: "same-origin",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then((res) => res.json() as Promise<{ success: boolean; data: { name: string }[] }>)
      .then((data) => {
        if (data.success) {
          setCategories((current) => mergeCategoryNames(current, data.data.map((category) => category.name)));
        }
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    const handler = () => loadCategories();
    window.addEventListener("transaction_saved", handler);
    return () => window.removeEventListener("transaction_saved", handler);
  }, [loadCategories]);

  useEffect(() => {
    if (!trailReady || restoredTrail) return;

    const stored = trail
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        id: crypto.randomUUID() as string,
        role: m.role as "user" | "assistant",
        content: m.content,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }));
    setMessages(stored);
    setRestoredTrail(true);
  }, [trail, trailReady, restoredTrail]);

  const handleSend = useCallback(
    async (text: string, image?: string) => {
      if (!text && !image) return;

      const userMsg: Message = {
        id: crypto.randomUUID() as string,
        role: "user",
        content: text || "[Image attached]",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, userMsg]);
      addMessage({ role: "user", content: text || "[Image attached]" });
      onMessageSent?.();

      transition("send");

      const body: Record<string, unknown> = {
        messageTrail: getTrailForAPI(),
        newMessage: text,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
      if (image) body.image = image;

      await startStream(body);
    },
    [addMessage, getTrailForAPI, onMessageSent, transition, startStream],
  );

  useEffect(() => {
    if (streamingText) {
      transition("response");
    }
  }, [streamingText, transition]);

  useEffect(() => {
    if (doneData) {
      const aiContent = typeof doneData.streamedText === "string"
        ? doneData.streamedText
        : streamingText;
      if (aiContent) {
        const aiMsg: Message = {
          id: crypto.randomUUID() as string,
          role: "assistant",
          content: aiContent,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, aiMsg]);
        addMessage({ role: "assistant", content: aiContent });
      }

      if (doneData.type === "confirmation" && doneData.parsedData) {
        setConfirmationData(doneData.parsedData as Record<string, unknown>);
        setState("confirm");
      } else if (doneData.type === "saved") {
        toast.success("Transaction saved!");
        window.dispatchEvent(new CustomEvent("transaction_saved", { detail: doneData }));
        transition("done");
      } else {
        transition("done");
      }
    }
  }, [addMessage, doneData, setState, streamingText, transition]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      transition("error");
    }
  }, [error, transition]);

  const handleConfirm = useCallback(
    async (data: Record<string, unknown>) => {
      setConfirmationData(null);
      transition("confirm");

      const confirmMsg: Message = {
        id: crypto.randomUUID() as string,
        role: "user",
        content: "Yes, confirm",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, confirmMsg]);

      const body: Record<string, unknown> = {
        messageTrail: getTrailForAPI(),
        newMessage: "Yes, confirm this transaction",
        confirmationData: data,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      await startStream(body);
    },
    [getTrailForAPI, transition, startStream],
  );

  const handleCancel = useCallback(() => {
    setConfirmationData(null);
    transition("cancel");
  }, [transition]);

  const handleNewChat = useCallback(() => {
    clearTrail();
    setMessages([]);
    setConfirmationData(null);
    setRestoredTrail(true);
    transition("reset");
    onNewChat?.();
  }, [clearTrail, onNewChat, transition]);

  return (
    <div className={cn("flex h-full min-h-0 flex-col bg-surface-container-lowest", className)}>
      <div className="flex items-center justify-between border-b border-chat-border px-4 py-3">
        <h2 className="headline-md text-foreground">FinChat</h2>
        <div className="flex items-center gap-3">
          {headerAction}
          <button
            onClick={handleNewChat}
            className="rounded-full border border-outline-variant px-3 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-primary-fixed hover:text-on-primary-fixed"
          >
            New Chat
          </button>
        </div>
      </div>
      <ChatMessageList
        messages={messages}
        streamingText={state === "streaming" ? streamingText : undefined}
        isThinking={state === "loading" && !streamingText}
        confirmation={confirmationData}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        categories={categories}
      />
      <ChatInput
        onSend={handleSend}
        disabled={state === "loading" || state === "streaming"}
        placeholder={state === "confirm" ? "Confirm or edit above..." : "Ask about your finances..."}
      />
    </div>
  );
}
