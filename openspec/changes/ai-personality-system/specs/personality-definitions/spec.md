## ADDED Requirements

### Requirement: Personality definitions
The system SHALL define 10 distinct AI personalities, each with a unique prompt template containing: tone description, vocabulary guidelines, greeting style, response style, and behavioral quirks. The personalities are:

| ID | Name | Icon | Tone |
|----|------|------|------|
| `default` | Default AI | 🤖 | Normal, friendly, professional |
| `influencer` | Influencer | ✨ | Gen-Z/Alpha slang, trendy, emoji-heavy |
| `tsundere` | Tsundere | 😤 | Reluctant but caring, uses "b-baka", denies caring |
| `yandere` | Yandere | 💕 | Overly possessive, intense devotion, slightly unsettling |
| `businessman` | Businessman | 💼 | Sharp, data-driven, professional financial advisor |
| `caveman` | Caveman | 🪨 | Basic English, simple words, short sentences |
| `gamer` | Gamer | 🎮 | Gaming references, HP/XP metaphors, player-focused |
| `detective` | Detective | 🔍 | Analytical, asks probing questions, observant |
| `zenmaster` | Zen Master | 🧘 | Calm, mindful, philosophical, non-judgmental |
| `pirate` | Pirate | 🏴‍☠️ | Thematic nautical language, fun, adventurous |

#### Scenario: Default personality loaded
- **WHEN** no personality is selected or `default` is selected
- **THEN** the AI responds in a normal, friendly, professional tone

#### Scenario: Influencer personality loaded
- **WHEN** `influencer` is selected
- **THEN** the AI uses Gen-Z slang, trendy expressions, and emojis

#### Scenario: Tsundere personality loaded
- **WHEN** `tsundere` is selected
- **THEN** the AI acts reluctant but helpful, using tsundere tropes

#### Scenario: Caveman personality loaded
- **WHEN** `caveman` is selected
- **THEN** the AI uses basic English with short, simple sentences

#### Scenario: Gamer personality loaded
- **WHEN** `gamer` is selected
- **THEN** the AI uses gaming metaphors (HP, XP, level up, grind)

### Requirement: Personality prompt isolation
The system SHALL ensure that personality prompts only affect conversational tone and style, NOT the core parsing logic, tool calling behavior, or confirmation flow.

#### Scenario: Parsing accuracy maintained
- **WHEN** any personality is selected
- **THEN** transaction parsing accuracy remains at 95%+ as specified in the PRD

#### Scenario: Confirmation flow maintained
- **WHEN** any personality is selected
- **THEN** the AI still asks for confirmation before saving transactions
