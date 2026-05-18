## Why

The PRD specifies that users should be able to personalize their AI chat experience. By allowing personality selection in settings, users can choose an AI tone that makes financial tracking more engaging and enjoyable. Currently, the system prompt is static with no personality variation. This feature adds 10 selectable personalities, each with distinct communication styles, stored as a user preference and applied to the system prompt at runtime.

## What Changes

- Create 10 AI personality definitions with unique system prompt instructions
- Add personality selection to user settings with preview descriptions
- Store personality preference in user profile (D1)
- Dynamically inject personality instructions into the system prompt before each AI request
- Provide personality preview cards in settings so users can see examples before selecting

## Capabilities

### New Capabilities
- `personality-definitions`: 10 personality prompt templates with distinct tones, vocabularies, and behavioral rules
- `personality-selection`: Settings UI for browsing, previewing, and selecting an AI personality
- `personality-injection`: Runtime system prompt assembly that injects the selected personality into the AI request
- `personality-storage`: User preference persistence in D1 user settings table

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- New personality definition files in `src/server/ai/personalities/`
- Settings page extended with personality selector (depends on `auth-setup` user-settings)
- AI chat service modified to inject personality into system prompt (depends on `ai-chat-architecture`)
- New user preference field in user settings (extends `database-schema` user table)
- Frontend settings UI needs personality preview cards (extends `auth-setup` user-settings)
