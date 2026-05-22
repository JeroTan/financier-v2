import { useState, useCallback, useRef, useEffect } from "react";

type SSEEvent = {
  type: "message" | "done" | "error";
  data?: unknown;
};

type UseChatSSEReturn = {
  isConnected: boolean;
  streamingText: string;
  doneData: Record<string, unknown> | null;
  error: string | null;
  startStream: (body: Record<string, unknown>) => Promise<void>;
  abort: () => void;
};

export function useChatSSE(): UseChatSSEReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [doneData, setDoneData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const parseSSEBlock = useCallback((block: string): SSEEvent | null => {
    let type: SSEEvent["type"] = "message";
    const dataLines: string[] = [];

    for (const line of block.split(/\r?\n/)) {
      if (line.startsWith("event:")) {
        type = line.slice(6).trim() as SSEEvent["type"];
      } else if (line.startsWith("data:")) {
        dataLines.push(line.slice(5).trimStart());
      }
    }

    if (dataLines.length === 0) return null;

    const rawData = dataLines.join("\n");
    try {
      return { type, data: JSON.parse(rawData) };
    } catch {
      return { type, data: rawData };
    }
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
        credentials: "same-origin",
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
        const blocks = buffer.split(/\r?\n\r?\n/);
        buffer = blocks.pop() ?? "";

        for (const block of blocks) {
          const parsed = parseSSEBlock(block);
          if (!parsed) continue;

          if (parsed.type === "message") {
            const payload = parsed.data as { content?: string } | string;
            setStreamingText((prev) => prev + (typeof payload === "string" ? payload : payload.content ?? ""));
          }

          if (parsed.type === "done") {
            setDoneData((parsed.data ?? {}) as Record<string, unknown>);
            return;
          }

          if (parsed.type === "error") {
            const payload = parsed.data as { message?: string } | string;
            setError(typeof payload === "string" ? payload : payload.message ?? "AI response error");
            return;
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setIsConnected(false);
      abortRef.current = null;
    }
  }, [parseSSEBlock]);

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
