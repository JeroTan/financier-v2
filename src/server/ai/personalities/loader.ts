const PERSONALITY_CACHE: Record<string, string> = {};

export async function loadPersonalityPrompt(personality: string): Promise<string> {
  if (PERSONALITY_CACHE[personality]) {
    return PERSONALITY_CACHE[personality];
  }

  const safeName = personality.replace(/[^a-z0-9_-]/gi, "");
  const url = new URL(`../personalities/${safeName}.md`, import.meta.url).toString();

  try {
    const response = await fetch(url);
    if (response.ok) {
      const text = await response.text();
      PERSONALITY_CACHE[personality] = text.trim();
      return PERSONALITY_CACHE[personality];
    }
  } catch {
    console.warn(`[PersonalityLoader] Failed to load personality: ${personality}`);
  }

  if (personality !== "default") {
    console.warn(`[PersonalityLoader] Falling back to default for: ${personality}`);
    return loadDefaultPersonality();
  }

  return getDefaultFallback();
}

async function loadDefaultPersonality(): Promise<string> {
  if (PERSONALITY_CACHE.default) return PERSONALITY_CACHE.default;

  try {
    const response = await fetch(new URL("../personalities/default.md", import.meta.url).toString());
    if (response.ok) {
      PERSONALITY_CACHE.default = (await response.text()).trim();
      return PERSONALITY_CACHE.default;
    }
  } catch {
    // Fall through
  }

  return getDefaultFallback();
}

function getDefaultFallback(): string {
  return "You are a helpful AI assistant. Respond in a normal, friendly tone.";
}
