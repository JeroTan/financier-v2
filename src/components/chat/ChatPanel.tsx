import { useState, useCallback, useEffect } from "react";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { useChatStateMachine } from "@/features/chat/useChatStateMachine";
import { useMessageTrail } from "@/features/chat/useMessageTrail";
import { useChatSSE } from "@/features/chat/useChatSSE";
import { toast } from "sonner";

type ChatPanelProps = {
  token?: string;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

export function ChatPanel(_props: ChatPanelProps) {
  const { state, transition, setState } = useChatStateMachine();
  const { trail, addMessage, getTrailForAPI, clearTrail } = useMessageTrail();
  const { streamingText, doneData, error, startStream } = useChatSSE();
  const [messages, setMessages] = useState<Message[]>([]);
  const [confirmationData, setConfirmationData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const stored = trail
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        id: crypto.randomUUID() as string,
        role: m.role as "user" | "assistant",
        content: m.content,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }));
    setMessages(stored);
  }, []);

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

      transition("send");

      const body: Record<string, unknown> = {
        messageTrail: getTrailForAPI(),
        newMessage: text,
      };
      if (image) body.image = image;

      await startStream(body);
    },
    [addMessage, getTrailForAPI, transition, startStream],
  );

  useEffect(() => {
    if (streamingText) {
      transition("response");
    }
  }, [streamingText, transition]);

  useEffect(() => {
    if (doneData) {
      const aiContent = streamingText;
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
  }, [doneData]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      transition("error");
    }
  }, [error]);

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
    transition("reset");
  }, [clearTrail, transition]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <h2 className="font-semibold">AI Chat</h2>
        <button
          onClick={handleNewChat}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          New Chat
        </button>
      </div>
      <ChatMessageList
        messages={messages}
        streamingText={state === "streaming" ? streamingText : undefined}
        confirmation={confirmationData}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      <ChatInput
        onSend={handleSend}
        disabled={state === "loading" || state === "streaming"}
        placeholder={state === "confirm" ? "Confirm or edit above..." : "Ask about your finances..."}
      />
    </div>
  );
}
