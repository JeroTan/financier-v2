import type { ToolDefinition, ToolCall, ToolResult } from "./tools";
import type { AiMessage, ConfirmationData } from "../llm/types";
import type { AiCompletion } from "../llm/completion";

const MAX_TOOL_ROUNDS = 5;

export type ToolExecutorResult = {
  messages: AiMessage[];
  confirmation?: ConfirmationData;
  saved?: { id: string };
  content: string;
  limitReached: boolean;
  toolCalls: ToolCall[];
  toolResults: ToolResult[];
};

export async function executeToolLoop(
  initialCompletion: AiCompletion,
  tools: ToolDefinition[],
  runAI: (messages: AiMessage[], tools?: ToolDefinition[]) => Promise<AiCompletion>,
  initialMessages: AiMessage[],
): Promise<ToolExecutorResult> {
  const messages = [...initialMessages];
  const toolCalls: ToolCall[] = [];
  const toolResults: ToolResult[] = [];
  let confirmation: ConfirmationData | undefined;
  let saved: { id: string } | undefined;

  let currentCompletion = initialCompletion;
  let round = 0;

  while (round < MAX_TOOL_ROUNDS) {
    const parsedCalls = currentCompletion.toolCalls;

    if (parsedCalls.length === 0) {
      // No more tool calls, we're done
      break;
    }

    for (const call of parsedCalls) {
      toolCalls.push(call);

      // Confirmation gate for createTransaction
      if (call.name === "createTransaction") {
        const args = call.arguments;
        confirmation = {
          type: args.type as "income" | "expense",
          amount: Number(args.amount),
          currency: (args.currency as string) ?? "PHP",
          category: (args.category ?? args.categoryId) as string | undefined,
          description: args.description as string | undefined,
          date: args.date as string,
        };

        // Don't execute yet — return confirmation to frontend
        // The frontend will send a confirmation message, which triggers another round
        messages.push({ role: "assistant", content: currentCompletion.content });
        return {
          messages,
          confirmation,
          content: currentCompletion.content,
          limitReached: false,
          toolCalls,
          toolResults,
        };
      }

      if (call.name === "updateTransaction") {
        const args = call.arguments;
        confirmation = {
          operation: "update",
          transactionId: String(args.transactionId ?? ""),
          type: args.type === "income" || args.type === "expense" ? args.type : undefined,
          amount: args.amount === undefined ? undefined : Number(args.amount),
          currency: typeof args.currency === "string" ? args.currency : undefined,
          category: typeof args.category === "string" ? args.category : undefined,
          description: typeof args.description === "string" ? args.description : undefined,
          date: typeof args.date === "string" ? args.date : undefined,
        };

        messages.push({ role: "assistant", content: currentCompletion.content });
        return {
          messages,
          confirmation,
          content: currentCompletion.content,
          limitReached: false,
          toolCalls,
          toolResults,
        };
      }

      if (call.name === "deleteTransaction") {
        const args = call.arguments;
        confirmation = {
          operation: "delete",
          transactionId: String(args.transactionId ?? ""),
          description: typeof args.description === "string" ? args.description : undefined,
        };

        messages.push({ role: "assistant", content: currentCompletion.content });
        return {
          messages,
          confirmation,
          content: currentCompletion.content,
          limitReached: false,
          toolCalls,
          toolResults,
        };
      }

      // Execute other tools
      const tool = tools.find((t) => t.name === call.name);
      if (tool) {
        const result = await tool.execute(call.arguments);
        toolResults.push(result);

        messages.push({
          role: "assistant",
          content: `[Requested tool: ${call.name}] ${JSON.stringify(call.arguments)}`,
        });
        messages.push({
          role: "system",
          content: `[Trusted tool result: ${call.name}] ${JSON.stringify(result)}`,
        });
      } else {
        messages.push({
          role: "system",
          content: `[Tool error] Unknown tool: ${call.name}`,
        });
      }
    }

    currentCompletion = await runAI(messages, tools);
    round++;
  }

  const savedMatch = currentCompletion.content.match(/Transaction saved.*?id["\s:]+([a-f0-9-]+)/i);
  if (savedMatch) {
    saved = { id: savedMatch[1] };
  }

  const limitReached = round >= MAX_TOOL_ROUNDS && currentCompletion.toolCalls.length > 0;
  const content = limitReached
    ? "I could not finish that finance query after several data lookups. Please narrow the date range or question and try again."
    : currentCompletion.content;
  messages.push({ role: "assistant", content });

  return { messages, confirmation, saved, content, limitReached, toolCalls, toolResults };
}
