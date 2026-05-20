import type { ToolDefinition, ToolCall, ToolResult } from "./tools";
import type { ChatMessage, ConfirmationData } from "../llm/types";

const MAX_TOOL_ROUNDS = 5;

export type ToolExecutorResult = {
  messages: ChatMessage[];
  confirmation?: ConfirmationData;
  saved?: { id: string };
  toolCalls: ToolCall[];
  toolResults: ToolResult[];
};

export async function executeToolLoop(
  aiResponse: string,
  tools: ToolDefinition[],
  runAI: (messages: ChatMessage[], tools?: ToolDefinition[]) => Promise<string>,
  initialMessages: ChatMessage[],
): Promise<ToolExecutorResult> {
  const messages = [...initialMessages];
  const toolCalls: ToolCall[] = [];
  const toolResults: ToolResult[] = [];
  let confirmation: ConfirmationData | undefined;
  let saved: { id: string } | undefined;

  // Parse initial AI response for tool calls
  let currentResponse = aiResponse;
  let round = 0;

  while (round < MAX_TOOL_ROUNDS) {
    const parsedCalls = parseToolCalls(currentResponse);

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
          category: args.categoryId as string | undefined,
          description: args.description as string | undefined,
          date: args.date as string,
        };

        // Don't execute yet — return confirmation to frontend
        // The frontend will send a confirmation message, which triggers another round
        messages.push({ role: "assistant", content: currentResponse });
        return { messages, confirmation, toolCalls, toolResults };
      }

      // Execute other tools
      const tool = tools.find((t) => t.name === call.name);
      if (tool) {
        const result = await tool.execute(call.arguments);
        toolResults.push(result);

        // Add tool result to messages for next AI round
        messages.push({
          role: "assistant",
          content: `[Tool: ${call.name}] Result: ${JSON.stringify(result)}`,
        });
      }
    }

    // Run AI again with tool results
    currentResponse = await runAI(messages, tools);
    round++;
  }

  // Check for saved transaction in final response
  const savedMatch = currentResponse.match(/Transaction saved.*?id["\s:]+([a-f0-9-]+)/i);
  if (savedMatch) {
    saved = { id: savedMatch[1] };
  }

  messages.push({ role: "assistant", content: currentResponse });

  return { messages, confirmation, saved, toolCalls, toolResults };
}

function parseToolCalls(response: string): ToolCall[] {
  const calls: ToolCall[] = [];

  // Look for tool call patterns in the response
  // Pattern 1: JSON tool calls
  const jsonPattern = /```(?:json)?\s*\{[\s\S]*?"name"\s*:\s*"([^"]+)"[\s\S]*?"arguments"\s*:\s*\{[\s\S]*?\}[\s\S]*?\}[\s\S]*?```/g;
  let match;
  while ((match = jsonPattern.exec(response)) !== null) {
    try {
      const json = match[0].replace(/```(?:json)?/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(json);
      if (parsed.name && parsed.arguments) {
        calls.push({ name: parsed.name, arguments: parsed.arguments });
      }
    } catch {
      // Invalid JSON, skip
    }
  }

  // Pattern 2: Inline tool calls
  const inlinePattern = /TOOL_CALL:\s*(\w+)\s*\(([\s\S]*?)\)/g;
  while ((match = inlinePattern.exec(response)) !== null) {
    try {
      const argsStr = match[2].trim();
      const args: Record<string, unknown> = {};
      if (argsStr) {
        const pairs = argsStr.split(",").map((p) => p.trim());
        for (const pair of pairs) {
          const [key, ...valueParts] = pair.split(":").map((s) => s.trim());
          if (key && valueParts.length > 0) {
            let value = valueParts.join(":").trim();
            // Remove quotes
            value = value.replace(/^["']|["']$/g, "");
            // Parse numbers
            const num = Number(value);
            args[key] = isNaN(num) ? value : num;
          }
        }
      }
      calls.push({ name: match[1], arguments: args });
    } catch {
      // Skip invalid
    }
  }

  return calls;
}
