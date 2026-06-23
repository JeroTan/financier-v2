import type { ChatMessage } from "@/server/ai/llm/types";
import { loadSystemPrompt } from "@/server/ai/llm/systemPrompt";
import { buildMessageArray } from "@/server/ai/llm/messageTrail";
import { createAiToolSchemas, normalizeAiCompletion, type AiCompletion } from "@/server/ai/llm/completion";
import type { ToolDefinition } from "@/server/ai/tooling/tools";

export type ChatServiceDeps = {
  ai: Ai;
  userId: string;
  personality?: string;
  timeZone?: string;
  now?: Date;
};

export type ChatServiceResult = {
  success: true;
  content: string;
  completion: AiCompletion;
  requestMessages: ChatMessage[];
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
  tools: ToolDefinition[] = [],
): Promise<ChatServiceResult> {
  try {
    const basePrompt = await loadSystemPrompt(deps.personality);
    const systemPrompt = `${basePrompt}\n\n${buildRuntimeContext(deps.now ?? new Date(), deps.timeZone)}`;
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
      tools: createAiToolSchemas(tools),
      stream: false,
      max_tokens: 1024,
      temperature: 0.7,
    });

    const completion = normalizeAiCompletion(response);
    const content = completion.content;

    const newTrail: ChatMessage[] = [
      ...messageTrail,
      { role: "user", content: newMessage },
      { role: "assistant", content },
    ];

    return { success: true, content, completion, requestMessages: messages, messageTrail: newTrail };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "AI service unavailable";
    return {
      success: false,
      error: errorMessage,
      fallbackContent: "I'm having trouble connecting right now. Please try again in a moment, or enter your transaction manually.",
    };
  }
}

export function buildRuntimeContext(now: Date, requestedTimeZone?: string): string {
  const timeZone = validTimeZone(requestedTimeZone) ? requestedTimeZone : "UTC";
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const dateTime = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    dateStyle: "full",
    timeStyle: "long",
  }).format(now);

  return [
    "## Request Date Context",
    `User timezone: ${timeZone}`,
    `User local date: ${date}`,
    `User local date and time: ${dateTime}`,
    "Resolve relative dates such as today, yesterday, this week, and last month from this context.",
  ].join("\n");
}

function validTimeZone(value?: string): value is string {
  if (!value) return false;
  try {
    new Intl.DateTimeFormat("en", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

export function withFallbackContent(fallback: string): string {
  return fallback;
}
