## Why

The AI chat needs a structured content format so the AI can send renderable components (cards, tables, charts, alerts) that the frontend displays as rich UI elements instead of plain text. The format `@#=_ACTION=> content <=ACTION=#@` allows the AI to embed structured content within its conversational responses, and the frontend parser extracts and renders them as specialized components.

## What Changes

- Define 10 action types (Card, Table, Chart, Progress, Alert, List, Image, Divider, Insight, Button) with content schemas
- Implement server-side action format generation in the AI system prompt instructions
- Implement frontend action parser that extracts action blocks from streamed AI text
- Create React render components for each action type
- Handle partial/malformed action blocks gracefully during streaming

## Capabilities

### New Capabilities
- `action-format-spec`: The `@#=_ACTION=> content <=ACTION=#@` protocol definition with all action types and content schemas
- `action-parser`: Frontend parser that extracts action blocks from AI response text during streaming
- `action-components`: React components for rendering each action type (Card, Table, Chart, Progress, Alert, List, Image, Divider, Insight, Button)
- `action-system-prompt`: System prompt instructions that teach the AI when and how to use each action type

### Modified Capabilities
- `ai-streaming-protocol`: Extended to handle action blocks within streamed text (the SSE consumer must parse and render actions inline)

## Impact

- New parser utility in `src/lib/chat/actionParser.ts`
- New React components in `src/components/chat/actions/`
- System prompt (`chat_instruction.md`) extended with action format instructions
- SSE consumer in `frontend-chat-ui` must parse action blocks from text chunks
- Depends on `ai-chat-architecture` for the streaming pipeline
- Depends on `ui-design-system` for component styling
