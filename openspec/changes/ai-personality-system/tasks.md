## 1. Personality Definitions

- [x] 1.1 Create `src/server/ai/personalities/` directory
- [x] 1.2 Create `default.md` — normal, friendly, professional tone
- [x] 1.3 Create `influencer.md` — Gen-Z/Alpha slang, trendy, emoji-heavy
- [x] 1.4 Create `tsundere.md` — reluctant but caring, "b-baka" tropes
- [x] 1.5 Create `yandere.md` — overly possessive, intense devotion
- [x] 1.6 Create `businessman.md` — sharp, data-driven, professional
- [x] 1.7 Create `caveman.md` — basic English, simple words, short sentences
- [x] 1.8 Create `gamer.md` — gaming references, HP/XP metaphors
- [x] 1.9 Create `detective.md` — analytical, probing questions, observant
- [x] 1.10 Create `zenmaster.md` — calm, mindful, philosophical
- [x] 1.11 Create `pirate.md` — nautical language, fun, adventurous

## 2. Personality Storage

- [x] 2.1 Add `personality` column to user settings table (TEXT, default 'default')
- [x] 2.2 Generate and apply migration for personality column
- [x] 2.3 Update user repository `updateUserSettings` to handle personality field
- [x] 2.4 Add personality validation (must be one of 10 defined IDs)

## 3. Personality Injection

- [x] 3.1 Create personality prompt loader in `src/server/ai/personalities/loader.ts`
- [x] 3.2 Implement system prompt assembly: base + personality + action instructions
- [x] 3.3 Add fallback to `default` if personality file is missing
- [x] 3.4 Wire personality loader into AI chat service request preparation
- [x] 3.5 Verify each personality prompt is under 200 tokens

## 4. Personality Selection UI

- [x] 4.1 Create `PersonalitySelector` component with grid of preview cards
- [x] 4.2 Implement personality card with name, icon, description, example dialogue
- [x] 4.3 Add hover/tap preview showing example dialogue
- [x] 4.4 Implement selected state highlighting
- [x] 4.5 Wire personality selection to PUT `/api/settings/preferences`
- [x] 4.6 Add toast confirmation on personality change
- [x] 4.7 Integrate personality selector into settings page
