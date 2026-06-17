import { useState, useCallback } from "react";

export type ChatState = "idle" | "typing" | "loading" | "streaming" | "confirm" | "success" | "error";

export type ChatStateMachine = {
  state: ChatState;
  setState: (state: ChatState) => void;
  transition: (action: string) => void;
  reset: () => void;
};

const TRANSITIONS: Record<ChatState, Record<string, ChatState>> = {
  idle: { start: "typing", send: "loading", reset: "idle" },
  typing: { send: "loading", cancel: "idle", reset: "idle" },
  loading: { response: "streaming", done: "idle", error: "error", reset: "idle" },
  streaming: { done: "idle", confirm: "confirm", error: "error", reset: "idle" },
  confirm: { confirm: "loading", cancel: "idle", reset: "idle" },
  success: { done: "idle", reset: "idle" },
  error: { send: "loading", retry: "loading", reset: "idle" },
};

export function nextChatState(state: ChatState, action: string): ChatState {
  return TRANSITIONS[state]?.[action] ?? state;
}

export function useChatStateMachine(initialState: ChatState = "idle"): ChatStateMachine {
  const [state, setState] = useState<ChatState>(initialState);

  const transition = useCallback((action: string) => {
    setState((prev) => nextChatState(prev, action));
  }, []);

  const reset = useCallback(() => {
    setState("idle");
  }, []);

  return { state, setState, transition, reset };
}
