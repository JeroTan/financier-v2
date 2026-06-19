import businessmanPrompt from "./businessman.md?raw";
import cavemanPrompt from "./caveman.md?raw";
import defaultPrompt from "./default.md?raw";
import detectivePrompt from "./detective.md?raw";
import gamerPrompt from "./gamer.md?raw";
import influencerPrompt from "./influencer.md?raw";
import piratePrompt from "./pirate.md?raw";
import tsunderePrompt from "./tsundere.md?raw";
import yanderePrompt from "./yandere.md?raw";
import zenmasterPrompt from "./zenmaster.md?raw";

const PERSONALITY_CACHE: Record<string, string> = {};

const PERSONALITY_PROMPTS: Record<string, string> = {
  businessman: businessmanPrompt,
  caveman: cavemanPrompt,
  default: defaultPrompt,
  detective: detectivePrompt,
  gamer: gamerPrompt,
  influencer: influencerPrompt,
  pirate: piratePrompt,
  tsundere: tsunderePrompt,
  yandere: yanderePrompt,
  zenmaster: zenmasterPrompt,
};

export async function loadPersonalityPrompt(personality: string): Promise<string> {
  if (PERSONALITY_CACHE[personality]) {
    return PERSONALITY_CACHE[personality];
  }

  const safeName = personality.replace(/[^a-z0-9_-]/gi, "");
  const prompt = PERSONALITY_PROMPTS[safeName];
  if (prompt) {
    PERSONALITY_CACHE[personality] = prompt.trim();
    return PERSONALITY_CACHE[personality];
  }

  if (personality !== "default") {
    console.warn(`[PersonalityLoader] Falling back to default for: ${personality}`);
    return loadDefaultPersonality();
  }

  return getDefaultFallback();
}

async function loadDefaultPersonality(): Promise<string> {
  if (PERSONALITY_CACHE.default) return PERSONALITY_CACHE.default;

  PERSONALITY_CACHE.default = defaultPrompt.trim() || getDefaultFallback();
  return PERSONALITY_CACHE.default;
}

function getDefaultFallback(): string {
  return "You are a helpful AI assistant. Respond in a normal, friendly tone.";
}
