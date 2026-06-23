import { describe, expect, it } from "vitest";
import { normalizeAiCompletion } from "./completion";

describe("normalizeAiCompletion", () => {
  it("normalizes legacy Workers AI tool calls", () => {
    expect(normalizeAiCompletion({
      response: "",
      tool_calls: [{
        name: "getFinancialSummary",
        arguments: { startDate: "2026-06-23", endDate: "2026-06-23" },
      }],
    })).toEqual({
      content: "",
      toolCalls: [{
        id: undefined,
        name: "getFinancialSummary",
        arguments: { startDate: "2026-06-23", endDate: "2026-06-23" },
      }],
    });
  });

  it("normalizes OpenAI-compatible Workers AI tool calls", () => {
    expect(normalizeAiCompletion({
      choices: [{
        message: {
          content: null,
          tool_calls: [{
            id: "call-1",
            type: "function",
            function: {
              name: "getTransactions",
              arguments: "{\"type\":\"expense\",\"startDate\":\"2026-06-22\"}",
            },
          }],
        },
      }],
    })).toEqual({
      content: "",
      toolCalls: [{
        id: "call-1",
        name: "getTransactions",
        arguments: { type: "expense", startDate: "2026-06-22" },
      }],
    });
  });

  it("keeps plain text responses", () => {
    expect(normalizeAiCompletion({ response: "You spent PHP 50 today." })).toEqual({
      content: "You spent PHP 50 today.",
      toolCalls: [],
    });
  });
});
