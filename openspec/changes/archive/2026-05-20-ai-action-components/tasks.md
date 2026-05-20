## 1. Action Format Parser

- [x] 1.1 Create `src/lib/chat/actionParser.ts` with state machine parser
- [x] 1.2 Implement TEXT → DETECTING_ACTION → PARSING_ACTION → TEXT state transitions
- [x] 1.3 Implement action block extraction with regex pattern matching
- [x] 1.4 Implement JSON parsing for structured actions (Card, Table, Chart, Progress, Button)
- [x] 1.5 Implement plain text parsing for simple actions (Alert, List, Image, Insight, Divider)
- [x] 1.6 Implement partial block buffering for streaming
- [x] 1.7 Implement malformed action fallback (render as plain text)
- [ ] 1.8 Write unit tests for parser with various action formats

## 2. Action Components

- [x] 2.1 Create `src/components/chat/actions/` directory
- [x] 2.2 Create `ActionCard` component — transaction summary card
- [x] 2.3 Create `ActionTable` component — data table with headers/rows
- [x] 2.4 Create `ActionChart` component — sparkline visualization
- [x] 2.5 Create `ActionProgress` component — progress bar with percentage
- [x] 2.6 Create `ActionAlert` component — styled alert box with type colors
- [x] 2.7 Create `ActionList` component — bullet/numbered list
- [x] 2.8 Create `ActionImage` component — image preview from URL
- [x] 2.9 Create `ActionDivider` component — horizontal line separator
- [x] 2.10 Create `ActionInsight` component — highlighted text with lightbulb icon
- [x] 2.11 Create `ActionButton` component — actionable buttons

## 3. Action Renderer

- [x] 3.1 Create `ActionRenderer` component that maps action types to components
- [x] 3.2 Implement unknown action type fallback (plain text rendering)
- [ ] 3.3 Wire ActionRenderer into chat message display pipeline
- [ ] 3.4 Integrate action parser with SSE consumer — parse actions from streamed text

## 4. System Prompt Extension

- [x] 4.1 Add action format instructions to `src/assets/chat_instruction.md`
- [x] 4.2 Include examples for all 10 action types in system prompt
- [x] 4.3 Add contextual usage guidelines (when to use each action)
- [ ] 4.4 Test AI generates correct action format in responses

## 5. Integration

- [ ] 5.1 Wire action parser to chat message list — render actions inline with text
- [ ] 5.2 Test Card action in transaction confirmation flow
- [ ] 5.3 Test Table action in stats breakdown responses
- [ ] 5.4 Test Progress action in goal tracking responses
- [ ] 5.5 Test streaming with action blocks split across SSE chunks
- [ ] 5.6 Test malformed action fallback rendering
