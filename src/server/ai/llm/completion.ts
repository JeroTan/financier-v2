import type { ToolCall, ToolDefinition } from "@/server/ai/tooling/tools";

export type AiCompletion = {
  content: string;
  toolCalls: ToolCall[];
};

export function createAiToolSchemas(tools: ToolDefinition[]) {
  return tools.map((tool) => ({
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }));
}

export function normalizeAiCompletion(response: unknown): AiCompletion {
  const record = asRecord(response);
  const choices = Array.isArray(record?.choices) ? record.choices : [];
  const choice = asRecord(choices[0]);
  const message = asRecord(choice?.message);

  const content = stringValue(message?.content)
    ?? stringValue(record?.response)
    ?? stringValue(record?.output_text)
    ?? "";
  const nativeCalls = normalizeToolCalls(message?.tool_calls ?? record?.tool_calls);

  return {
    content,
    toolCalls: nativeCalls.length > 0 ? nativeCalls : parseTextToolCalls(content),
  };
}

function normalizeToolCalls(value: unknown): ToolCall[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item): ToolCall[] => {
    const record = asRecord(item);
    if (!record) return [];

    const fn = asRecord(record.function);
    const name = stringValue(fn?.name) ?? stringValue(record.name);
    if (!name) return [];

    const rawArguments = fn?.arguments ?? record.arguments ?? {};
    return [{
      id: stringValue(record.id),
      name,
      arguments: parseArguments(rawArguments),
    }];
  });
}

function parseTextToolCalls(content: string): ToolCall[] {
  const calls: ToolCall[] = [];
  const fencedPattern = /```(?:json)?\s*([\s\S]*?)```/gi;
  let match: RegExpExecArray | null;

  while ((match = fencedPattern.exec(content)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      const record = asRecord(parsed);
      const fn = asRecord(record?.function);
      const name = stringValue(fn?.name) ?? stringValue(record?.name);
      if (name) {
        calls.push({
          id: stringValue(record?.id),
          name,
          arguments: parseArguments(fn?.arguments ?? record?.arguments ?? {}),
        });
      }
    } catch {
      // Ordinary fenced content is not a tool call.
    }
  }

  const inlinePattern = /TOOL_CALL:\s*([A-Za-z0-9_]+)\s*\((\{[\s\S]*?\})\)/g;
  while ((match = inlinePattern.exec(content)) !== null) {
    calls.push({ name: match[1], arguments: parseArguments(match[2]) });
  }

  return calls;
}

function parseArguments(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  if (typeof value !== "string" || !value.trim()) return {};

  try {
    const parsed = JSON.parse(value);
    return asRecord(parsed) ?? {};
  } catch {
    return {};
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}
