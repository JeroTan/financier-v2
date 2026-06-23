import { describe, expect, it, vi } from "vitest";
import { executeToolLoop } from "./toolExecutor";
import type { ToolDefinition } from "./tools";

describe("executeToolLoop", () => {
  it("executes a read tool and returns the model answer", async () => {
    const execute = vi.fn().mockResolvedValue({
      success: true,
      data: { totalIncome: 50, totalExpenses: 100, net: -50 },
    });
    const tool: ToolDefinition = {
      name: "getFinancialSummary",
      description: "Read summary",
      parameters: { type: "object" },
      execute,
    };
    const runAI = vi.fn().mockResolvedValue({
      content: "You spent PHP 100 today.",
      toolCalls: [],
    });

    const result = await executeToolLoop(
      {
        content: "",
        toolCalls: [{
          name: "getFinancialSummary",
          arguments: { startDate: "2026-06-23", endDate: "2026-06-23" },
        }],
      },
      [tool],
      runAI,
      [
        { role: "system", content: "Finance assistant" },
        { role: "user", content: "How much did I spend today?" },
      ],
    );

    expect(execute).toHaveBeenCalledWith({
      startDate: "2026-06-23",
      endDate: "2026-06-23",
    });
    expect(runAI.mock.calls[0][0]).toContainEqual(expect.objectContaining({
      role: "system",
      content: expect.stringContaining("Trusted tool result: getFinancialSummary"),
    }));
    expect(result.content).toBe("You spent PHP 100 today.");
    expect(result.toolCalls).toHaveLength(1);
  });

  it("gates transaction writes for confirmation", async () => {
    const result = await executeToolLoop(
      {
        content: "Please confirm this transaction.",
        toolCalls: [{
          name: "createTransaction",
          arguments: {
            type: "expense",
            amount: 100,
            currency: "PHP",
            category: "Food",
            date: "2026-06-23",
          },
        }],
      },
      [],
      vi.fn(),
      [{ role: "user", content: "Record PHP 100 for lunch" }],
    );

    expect(result.confirmation).toEqual({
      type: "expense",
      amount: 100,
      currency: "PHP",
      category: "Food",
      description: undefined,
      date: "2026-06-23",
    });
  });
});
