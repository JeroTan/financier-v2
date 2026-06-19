import basePromptSource from "@/assets/chat_instruction.md?raw";
import { loadPersonalityPrompt } from "@/server/ai/personalities/loader";

const SYSTEM_PROMPT_CACHE: Record<string, string> = {};

export async function loadSystemPrompt(personality?: string): Promise<string> {
  const cacheKey = personality || "default";
  if (SYSTEM_PROMPT_CACHE[cacheKey]) {
    return SYSTEM_PROMPT_CACHE[cacheKey];
  }

  const basePrompt = await loadBasePrompt();
  const personalityPrompt = await loadPersonalityPrompt(personality || "default");

  const assembled = `${basePrompt}\n\n${personalityPrompt}`;
  SYSTEM_PROMPT_CACHE[cacheKey] = assembled;
  return assembled;
}

async function loadBasePrompt(): Promise<string> {
  if (SYSTEM_PROMPT_CACHE.base) {
    return SYSTEM_PROMPT_CACHE.base;
  }

  SYSTEM_PROMPT_CACHE.base = basePromptSource.trim() || getDefaultBasePrompt();
  return SYSTEM_PROMPT_CACHE.base;
}

function getDefaultBasePrompt(): string {
  return `You are Financier, an AI-powered personal finance assistant. Help users track income and expenses through natural conversation. Parse transaction details, present them for confirmation, and only save after explicit user confirmation. Be concise and helpful.`;
}
