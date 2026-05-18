## 1. Personality Definitions

- [ ] 1.1 Create `src/server/ai/personalities/` directory
- [ ] 1.2 Create `default.md` — normal, friendly, professional tone
- [ ] 1.3 Create `influencer.md` — Gen-Z/Alpha slang, trendy, emoji-heavy
- [ ] 1.4 Create `tsundere.md` — reluctant but caring, "b-baka" tropes
- [ ] 1.5 Create `yandere.md` — overly possessive, intense devotion
- [ ] 1.6 Create `businessman.md` — sharp, data-driven, professional
- [ ] 1.7 Create `caveman.md` — basic English, simple words, short sentences
- [ ] 1.8 Create `gamer.md` — gaming references, HP/XP metaphors
- [ ] 1.9 Create `detective.md` — analytical, probing questions, observant
- [ ] 1.10 Create `zenmaster.md` — calm, mindful, philosophical
- [ ] 1.11 Create `pirate.md` — nautical language, fun, adventurous

## 2. Personality Storage

- [ ] 2.1 Add `personality` column to user settings table (TEXT, default 'default')
- [ ] 2.2 Generate and apply migration for personality column
- [ ] 2.3 Update user repository `updateUserSettings` to handle personality field
- [ ] 2.4 Add personality validation (must be one of 10 defined IDs)

## 3. Personality Injection

- [ ] 3.1 Create personality prompt loader in `src/server/ai/personalities/loader.ts`
- [ ] 3.2 Implement system prompt assembly: base + personality + action instructions
- [ ] 3.3 Add fallback to `default` if personality file is missing
- [ ] 3.4 Wire personality loader into AI chat service request preparation
- [ ] 3.5 Verify each personality prompt is under 200 tokens

## 4. Personality Selection UI

- [ ] 4.1 Create `PersonalitySelector` component with grid of preview cards
- [ ] 4.2 Implement personality card with name, icon, description, example dialogue
- [ ] 4.3 Add hover/tap preview showing example dialogue
- [ ] 4.4 Implement selected state highlighting
- [ ] 4.5 Wire personality selection to PUT `/api/settings/preferences`
- [ ] 4.6 Add toast confirmation on personality change
- [ ] 4.7 Integrate personality selector into settings page
