import { chatService, type ChatServiceDeps } from "@/server/services/chatService";
import { createToolDefinitions, type ToolDefinition } from "@/server/ai/tooling/tools";
import { executeToolLoop } from "@/server/ai/tooling/toolExecutor";
import { createAiToolSchemas, normalizeAiCompletion, type AiCompletion } from "@/server/ai/llm/completion";
import { formatMessageEvent, formatDoneEvent, formatErrorEvent, type ChatMessage, type ConfirmationData, type CreateConfirmationData, type SSERequest } from "@/server/ai/llm/types";
import { formatTransactionConfirmation, parseTransactionIntent } from "@/server/ai/transactions/transactionIntent";
import type { ParsedTransactionIntent } from "@/server/ai/transactions/transactionIntent";
import { stripCompletionMetadata } from "@/lib/chat/actionParser";
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
        const sanitizedContent = stripCompletionMetadata(content);

        for (let i = 0; i < sanitizedContent.length; i += 20) {
          controller.enqueue(encoder.encode(formatMessageEvent(sanitizedContent.substring(i, i + 20))));
          await new Promise((r) => setTimeout(r, 10));
        }
      };

      try {
        if (confirmationData) {
          const mutation = await applyConfirmedMutation(deps, confirmationData);
          const message = mutation.operation === "updated"
            ? "Updated. Transaction changed in your ledger."
            : mutation.operation === "deleted"
              ? "Deleted. Transaction removed from your ledger."
              : "Saved. Transaction added to your ledger.";
          controller.enqueue(encoder.encode(formatMessageEvent(message)));
          controller.enqueue(encoder.encode(formatDoneEvent(mutation.operation, {
            transactionId: mutation.id,
          })));
          controller.close();
          return;
        }

        const parsedTransaction = image ? null : parseTransactionIntent(newMessage);
        if (parsedTransaction) {
          const categorizedTransaction = await applyKnownCategory(deps, parsedTransaction, newMessage);
          await streamText(formatTransactionConfirmation(categorizedTransaction));
          controller.enqueue(encoder.encode(formatDoneEvent("confirmation", {
            parsedData: categorizedTransaction,
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
            || formatConfirmationText(toolResult.confirmation);
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

async function applyKnownCategory(
  deps: AiChatControllerDeps,
  transaction: ParsedTransactionIntent,
  message: string,
): Promise<ParsedTransactionIntent> {
  if (transaction.category && transaction.category !== "Other") return transaction;

  const categories = await deps.categoryRepo.seedDefaultCategories(deps.userId);
  const lowerMessage = message.toLowerCase();
  const matchedCategory = categories
    .filter((category) => category.name.toLowerCase() !== "other")
    .sort((a, b) => b.name.length - a.name.length)
    .find((category) => lowerMessage.includes(category.name.toLowerCase()));

  return matchedCategory
    ? { ...transaction, category: matchedCategory.name }
    : transaction;
}

async function applyConfirmedMutation(
  deps: AiChatControllerDeps,
  data: ConfirmationData,
): Promise<{ operation: "saved" | "updated" | "deleted"; id: string }> {
  if (data.operation === "update") {
    const hasChange = [
      data.type,
      data.amount,
      data.currency,
      data.category,
      data.description,
      data.date,
    ].some((value) => value !== undefined);
    if (!hasChange) throw new Error("No transaction changes provided");

    const updates: Parameters<TransactionRepository["updateTransaction"]>[2] = {};
    if (data.type !== undefined) updates.type = data.type;
    if (data.amount !== undefined) updates.amount = data.amount;
    if (data.currency !== undefined) updates.currency = data.currency;
    if (data.description !== undefined) updates.description = data.description;
    if (data.date !== undefined) updates.date = data.date;
    if (data.category !== undefined) {
      const matchedCategory = await deps.categoryRepo.findOrCreateCategory(deps.userId, data.category);
      updates.categoryId = matchedCategory.id;
    }

    const transaction = await deps.transactionRepo.updateTransaction(data.transactionId, deps.userId, updates);
    if (!transaction) throw new Error("Transaction not found");
    return { operation: "updated", id: transaction.id };
  }

  if (data.operation === "delete") {
    const deleted = await deps.transactionRepo.deleteTransaction(data.transactionId, deps.userId);
    if (!deleted) throw new Error("Transaction not found");
    return { operation: "deleted", id: data.transactionId };
  }

  const matchedCategory = await deps.categoryRepo.findOrCreateCategory(deps.userId, data.category);

  const transaction = await deps.transactionRepo.createTransaction({
    id: crypto.randomUUID(),
    userId: deps.userId,
    type: data.type,
    amount: data.amount,
    currency: data.currency ?? "PHP",
    categoryId: matchedCategory.id,
    description: data.description ?? null,
    date: data.date,
  });

  return { operation: "saved", id: transaction.id };
}

function formatConfirmationText(data: ConfirmationData): string {
  if (data.operation === "update") {
    const changes = [
      data.type ? `type to ${data.type}` : null,
      data.amount !== undefined ? `amount to PHP ${data.amount.toFixed(2)}` : null,
      data.category ? `category to ${data.category}` : null,
      data.description ? `description to ${data.description}` : null,
      data.date ? `date to ${data.date}` : null,
    ].filter(Boolean);
    return `Confirm update${changes.length > 0 ? `: ${changes.join(", ")}` : ""}?`;
  }

  if (data.operation === "delete") {
    return "Confirm delete this transaction?";
  }

  return formatTransactionConfirmation(data as CreateConfirmationData);
}
