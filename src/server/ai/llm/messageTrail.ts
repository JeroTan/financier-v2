import type { ChatMessage } from "../llm/types";

const MAX_EXCHANGES = 10;

export function trimMessageTrail(messages: ChatMessage[]): ChatMessage[] {
  if (messages.length <= MAX_EXCHANGES * 2) {
    return messages;
  }

  // Keep last MAX_EXCHANGES exchanges (2 messages each)
  const trimmed = messages.slice(-MAX_EXCHANGES * 2);

  // Add a summary note for older messages
  const olderCount = messages.length - trimmed.length;
  const summary: ChatMessage = {
    role: "system",
    content: `[Previous conversation: ${olderCount} messages were summarized. User has been discussing their finances.]`,
  };

  return [summary, ...trimmed];
}

export function buildMessageArray(
  systemPrompt: string,
  messageTrail: ChatMessage[],
  newMessage: string,
): ChatMessage[] {
  const trimmed = trimMessageTrail(messageTrail);

  return [
    { role: "system" as const, content: systemPrompt },
    ...trimmed,
    { role: "user" as const, content: newMessage },
  ];
}
