import { useState, useCallback, useEffect } from "react";
import type { ChatMessage } from "@/server/ai/llm/types";

const TRAIL_KEY = "financier:chat:trail";
const MAX_EXCHANGES = 10;

function isStoredChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;

  const message = value as Partial<ChatMessage>;
  return (
    (message.role === "user" || message.role === "assistant" || message.role === "system") &&
    typeof message.content === "string"
  );
}

function readStoredTrail(): ChatMessage[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(TRAIL_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter(isStoredChatMessage) : [];
  } catch {
    return [];
  }
}

export function useMessageTrail() {
  const [trail, setTrail] = useState<ChatMessage[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTrail(readStoredTrail());
    setReady(true);
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    setTrail((prev) => {
      const next = [...prev, message];
      if (typeof window === "undefined") return next;

      try {
        localStorage.setItem(TRAIL_KEY, JSON.stringify(next));
      } catch {
        const trimmed = next.slice(-MAX_EXCHANGES * 2);
        try {
          localStorage.setItem(TRAIL_KEY, JSON.stringify(trimmed));
        } catch {
          // Ignore storage failures; in-memory chat can still continue.
        }
        return trimmed;
      }

      return next;
    });
  }, []);

  const getTrailForAPI = useCallback((): ChatMessage[] => {
    const exchanges = Math.floor(trail.length / 2);
    const start = Math.max(0, exchanges - MAX_EXCHANGES) * 2;
    return trail.slice(start);
  }, [trail]);

  const clearTrail = useCallback(() => {
    setTrail([]);
    if (typeof window === "undefined") return;

    localStorage.removeItem(TRAIL_KEY);
  }, []);

  const setTrailFromAPI = useCallback((messages: ChatMessage[]) => {
    setTrail(messages);
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(TRAIL_KEY, JSON.stringify(messages));
    } catch {
      // Ignore storage failures; in-memory chat can still continue.
    }
  }, []);

  return { trail, ready, addMessage, getTrailForAPI, clearTrail, setTrailFromAPI };
}
