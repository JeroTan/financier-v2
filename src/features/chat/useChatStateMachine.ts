import { useState, useCallback } from "react";

export type ChatState = "idle" | "typing" | "loading" | "streaming" | "confirm" | "success" | "error";

export type ChatStateMachine = {
  state: ChatState;
  setState: (state: ChatState) => void;
  transition: (action: string) => void;
  reset: () => void;
};

const TRANSITIONS: Record<ChatState, Record<string, ChatState>> = {
  idle: { start: "typing" },
  typing: { send: "loading", cancel: "idle" },
  loading: { response: "streaming", error: "error" },
  streaming: { done: "idle", confirm: "confirm", error: "error" },
  confirm: { confirm: "loading", cancel: "idle" },
  success: { done: "idle" },
  error: { retry: "loading", reset: "idle" },
};

export function useChatStateMachine(initialState: ChatState = "idle"): ChatStateMachine {
  const [state, setState] = useState<ChatState>(initialState);

  const transition = useCallback((action: string) => {
    setState((prev) => {
      const next = TRANSITIONS[prev]?.[action];
      return next ?? prev;
    });
  }, []);

  const reset = useCallback(() => {
    setState("idle");
  }, []);

  return { state, setState, transition, reset };
}
