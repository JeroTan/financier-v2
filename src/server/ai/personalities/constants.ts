export const VALID_PERSONALITIES = [
  "default",
  "influencer",
  "tsundere",
  "yandere",
  "businessman",
  "caveman",
  "gamer",
  "detective",
  "zenmaster",
  "pirate",
] as const;

export type PersonalityId = (typeof VALID_PERSONALITIES)[number];

export function isValidPersonality(value: string): value is PersonalityId {
  return VALID_PERSONALITIES.includes(value as PersonalityId);
}

export function sanitizePersonality(value: string | undefined): PersonalityId {
  if (!value || !isValidPersonality(value)) return "default";
  return value;
}
