import { useState, useCallback, useRef, useEffect } from "react";

type SSEEvent = {
  type: "message" | "done" | "error";
  data?: string;
};

type UseChatSSEReturn = {
  isConnected: boolean;
  streamingText: string;
  doneData: Record<string, unknown> | null;
  error: string | null;
  startStream: (body: Record<string, unknown>) => void;
  abort: () => void;
};

export function useChatSSE(): UseChatSSEReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [doneData, setDoneData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const parseSSELine = useCallback((line: string): SSEEvent | null => {
    if (line.startsWith("event: ")) {
      const type = line.slice(7) as SSEEvent["type"];
      return { type };
    }
    if (line.startsWith("data: ")) {
      return { type: "message", data: line.slice(6) };
    }
    return null;
  }, []);

  const startStream = useCallback(async (body: Record<string, unknown>) => {
    abortRef.current = new AbortController();
    setIsConnected(true);
    setStreamingText("");
    setDoneData(null);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        let currentEvent: SSEEvent | null = null;

        for (const line of lines) {
          const parsed = parseSSELine(line);
          if (parsed) {
            if (parsed.type === "message" && parsed.data) {
              setStreamingText((prev) => prev + parsed.data);
            } else if (parsed.type === "done") {
              currentEvent = { type: "done" };
            } else if (parsed.type === "error") {
              currentEvent = { type: "error" };
            }
          }
        }

        if (currentEvent?.type === "done") {
          try {
            const dataMatch = buffer.match(/data:\s*(.+)/);
            if (dataMatch) {
              setDoneData(JSON.parse(dataMatch[1]));
            }
          } catch {
            // Ignore parse errors
          }
          break;
        }

        if (currentEvent?.type === "error") {
          setError("AI response error");
          break;
        }
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setIsConnected(false);
      abortRef.current = null;
    }
  }, [parseSSELine]);

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return { isConnected, streamingText, doneData, error, startStream, abort };
}
