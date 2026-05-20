import { useState, useCallback, useRef } from "react";
import type { ChatMessage } from "@/server/ai/llm/types";

const TRAIL_KEY = "financier:chat:trail";
const MAX_EXCHANGES = 10;

export function useMessageTrail() {
  const [trail, setTrail] = useState<ChatMessage[]>(() => {
    try {
      const stored = localStorage.getItem(TRAIL_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const addMessage = useCallback((message: ChatMessage) => {
    setTrail((prev) => {
      const next = [...prev, message];
      try {
        localStorage.setItem(TRAIL_KEY, JSON.stringify(next));
      } catch {
        // Storage full — trim and retry
        const trimmed = next.slice(-MAX_EXCHANGES * 2);
        localStorage.setItem(TRAIL_KEY, JSON.stringify(trimmed));
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
    localStorage.removeItem(TRAIL_KEY);
  }, []);

  const setTrailFromAPI = useCallback((messages: ChatMessage[]) => {
    setTrail(messages);
    try {
      localStorage.setItem(TRAIL_KEY, JSON.stringify(messages));
    } catch {
      // Ignore
    }
  }, []);

  return { trail, addMessage, getTrailForAPI, clearTrail, setTrailFromAPI };
}
