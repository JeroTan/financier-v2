import type { ChatMessage } from "@/server/ai/llm/types";
import { loadSystemPrompt } from "@/server/ai/llm/systemPrompt";
import { buildMessageArray } from "@/server/ai/llm/messageTrail";

export type ChatServiceDeps = {
  ai: Ai;
  userId: string;
  personality?: string;
};

export type ChatServiceResult = {
  success: true;
  content: string;
  messageTrail: ChatMessage[];
} | {
  success: false;
  error: string;
  fallbackContent: string;
};

export async function chatService(
  deps: ChatServiceDeps,
  messageTrail: ChatMessage[],
  newMessage: string,
  image?: string,
): Promise<ChatServiceResult> {
  try {
    const systemPrompt = await loadSystemPrompt(deps.personality);
    const messages = buildMessageArray(systemPrompt, messageTrail, newMessage);

    // Add image if provided
    if (image) {
      messages.push({
        role: "user",
        content: `[Image attached: ${image.substring(0, 50)}...]`,
      });
    }

    const response = await deps.ai.run("@cf/moonshotai/kimi-k2.6", {
      messages: messages.map((m: ChatMessage) => ({ role: m.role, content: m.content })),
      stream: false,
      max_tokens: 1024,
      temperature: 0.7,
    });

    const content = typeof response === "string" ? response : (response as { response?: string })?.response ?? "";

    const newTrail: ChatMessage[] = [
      ...messageTrail,
      { role: "user", content: newMessage },
      { role: "assistant", content },
    ];

    return { success: true, content, messageTrail: newTrail };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "AI service unavailable";
    return {
      success: false,
      error: errorMessage,
      fallbackContent: "I'm having trouble connecting right now. Please try again in a moment, or enter your transaction manually.",
    };
  }
}

export function withFallbackContent(fallback: string): string {
  return fallback;
}
