## Context

The AI chat personality system allows users to select from 10 distinct AI personalities in settings. Each personality has a unique communication style, vocabulary, and behavioral pattern. The selected personality is stored as a user preference and injected into the system prompt before each AI request. The `ai-chat-architecture` change provides the base system prompt loading; this change extends it with personality injection.

## Goals / Non-Goals

**Goals:**
- 10 distinct personalities with unique prompt templates
- Settings UI with preview cards showing personality examples
- Runtime personality injection into system prompt
- User preference persistence in D1

**Non-Goals:**
- Custom user-defined personalities (predefined set only for MVP)
- Personality changing mid-conversation (applies on next request)
- Personality affecting transaction parsing accuracy (only affects tone, not data extraction)

## Decisions

### 1. Personality Storage

**Decision**: Store personality as a string enum field (`personality`) in the user settings/preferences. Default value is `default`.

**Rationale**: Simple string field, easy to query, no additional table needed. Extensible — new personalities can be added to the enum without schema changes.

### 2. System Prompt Assembly

**Decision**: The system prompt is assembled at runtime: `[base_prompt] + [personality_prompt] + [action_format_instructions]`. Each personality has its own prompt file.

**Rationale**: Modular approach. Base prompt handles core behavior (parsing, confirmation, tool usage). Personality prompt handles tone and style. Action format instructions handle structured content.

```
System Prompt = 
  base_prompt (always) +
  personality_prompt (selected) +
  action_format_instructions (always)
```

### 3. Personality Prompt Structure

**Decision**: Each personality prompt defines: tone description, vocabulary guidelines, greeting style, response style, and behavioral quirks.

**Rationale**: Consistent structure across all personalities makes them easy to maintain and compare.

### 4. Settings UI

**Decision**: Display personalities as a grid of preview cards with name, icon, description, and example dialogue. Selected personality is highlighted.

**Rationale**: Visual grid lets users quickly compare options. Example dialogue helps users understand the personality before selecting.

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| Personality affects parsing accuracy | Medium | System prompt separates personality from parsing instructions — personality only affects conversational tone |
| Too many personalities overwhelm users | Low | 10 is manageable. Group by category (fun, professional, quirky) if needed |
| Personality prompt too long, eats context window | Medium | Keep each personality prompt under 200 tokens |
| User changes personality mid-conversation | Low | New personality applies on next request. Previous messages retain old tone (acceptable) |
