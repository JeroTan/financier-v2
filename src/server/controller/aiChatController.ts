import { chatService, type ChatServiceDeps } from "@/server/services/chatService";
import { createToolDefinitions, type ToolDefinition } from "@/server/ai/tooling/tools";
import { executeToolLoop } from "@/server/ai/tooling/toolExecutor";
import { createAiToolSchemas, normalizeAiCompletion, type AiCompletion } from "@/server/ai/llm/completion";
import { formatMessageEvent, formatDoneEvent, formatErrorEvent, type ChatMessage, type ConfirmationData, type SSERequest } from "@/server/ai/llm/types";
import { formatTransactionConfirmation, parseTransactionIntent } from "@/server/ai/transactions/transactionIntent";
import type { TransactionRepository } from "@/server/repositories/transactionRepository";
import type { CategoryRepository } from "@/server/repositories/categoryRepository";
import type { UserRepository } from "@/server/repositories/userRepository";
import { isTransientDatabaseError } from "@/server/db/errors";

export type AiChatControllerDeps = {
  ai: Ai;
  userId: string;
  transactionRepo: TransactionRepository;
  categoryRepo: CategoryRepository;
  userRepo: UserRepository;
};

export async function aiChatController(
  deps: AiChatControllerDeps,
  request: SSERequest,
): Promise<ReadableStream> {
  const encoder = new TextEncoder();
  const { messageTrail, newMessage, image, confirmationData, timeZone } = request;

  const tools = createToolDefinitions(deps.transactionRepo, deps.categoryRepo, deps.userId);

  const user = await deps.userRepo.findById(deps.userId);
  const personality = user?.personality;

  const chatDeps: ChatServiceDeps = {
    ai: deps.ai,
    userId: deps.userId,
    personality,
    timeZone,
  };

  const runAI = async (messages: ChatMessage[], availableTools?: ToolDefinition[]): Promise<AiCompletion> => {
    const response = await deps.ai.run("@cf/moonshotai/kimi-k2.6", {
      messages: messages.map((m: ChatMessage) => ({ role: m.role, content: m.content })),
      tools: createAiToolSchemas(availableTools ?? []),
      stream: false,
      max_tokens: 1024,
      temperature: 0.7,
    });

    return normalizeAiCompletion(response);
  };

  return new ReadableStream({
    async start(controller) {
      const streamText = async (content: string) => {
        for (let i = 0; i < content.length; i += 20) {
          controller.enqueue(encoder.encode(formatMessageEvent(content.substring(i, i + 20))));
          await new Promise((r) => setTimeout(r, 10));
        }
      };

      try {
        if (confirmationData) {
          const saved = await saveConfirmedTransaction(deps, confirmationData);
          const message = "Saved. Transaction added to your ledger.";
          controller.enqueue(encoder.encode(formatMessageEvent(message)));
          controller.enqueue(encoder.encode(formatDoneEvent("saved", {
            transactionId: saved.id,
          })));
          controller.close();
          return;
        }

        const parsedTransaction = image ? null : parseTransactionIntent(newMessage);
        if (parsedTransaction) {
          await streamText(formatTransactionConfirmation(parsedTransaction));
          controller.enqueue(encoder.encode(formatDoneEvent("confirmation", {
            parsedData: parsedTransaction,
          })));
          controller.close();
          return;
        }

        // Initial AI call
        const initialResult = await chatService(chatDeps, messageTrail, newMessage, image, tools);

        if (!initialResult.success) {
          // Stream fallback content
          await streamText(initialResult.fallbackContent);
          controller.enqueue(encoder.encode(formatDoneEvent("error", { message: initialResult.error })));
          controller.close();
          return;
        }

        const toolResult = await executeToolLoop(
          initialResult.completion,
          tools,
          runAI,
          initialResult.requestMessages,
        );

        if (toolResult.confirmation) {
          const confirmationText = toolResult.content.trim()
            || formatTransactionConfirmation(toolResult.confirmation);
          await streamText(confirmationText);
          controller.enqueue(encoder.encode(formatDoneEvent("confirmation", {
            parsedData: toolResult.confirmation,
          })));
        } else if (toolResult.saved) {
          await streamText(toolResult.content);
          controller.enqueue(encoder.encode(formatDoneEvent("saved", {
            transactionId: toolResult.saved.id,
          })));
        } else {
          const content = toolResult.content.trim()
            ? toolResult.content
            : "Ask me about your spending, income, balances, or a financial scenario.";
          await streamText(content);
          controller.enqueue(encoder.encode(formatDoneEvent("normal")));
        }

        controller.close();
      } catch (err) {
        const databaseUnavailable = isTransientDatabaseError(err);
        const errorCode = databaseUnavailable ? "DATABASE_UNAVAILABLE" : "AI_ERROR";
        const errorMessage = databaseUnavailable
          ? "Database temporarily unavailable. Please retry."
          : err instanceof Error
            ? err.message
            : "Internal server error";
        controller.enqueue(encoder.encode(formatErrorEvent(errorCode, errorMessage)));
        controller.close();
      }
    },
  });
}

async function saveConfirmedTransaction(
  deps: AiChatControllerDeps,
  data: ConfirmationData,
): Promise<{ id: string }> {
  const categories = await deps.categoryRepo.seedDefaultCategories(deps.userId);
  const categoryName = data.category?.trim().toLowerCase();
  const matchedCategory = categoryName
    ? categories.find((category) => category.name.toLowerCase() === categoryName)
    : undefined;

  const transaction = await deps.transactionRepo.createTransaction({
    id: crypto.randomUUID(),
    userId: deps.userId,
    type: data.type,
    amount: data.amount,
    currency: data.currency ?? "PHP",
    categoryId: matchedCategory?.id ?? null,
    description: data.description ?? null,
    date: data.date,
  });

  return { id: transaction.id };
}
