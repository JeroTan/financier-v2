import { chatService, type ChatServiceDeps } from "@/server/services/chatService";
import { createToolDefinitions, type ToolDefinition } from "@/server/ai/tooling/tools";
import { executeToolLoop } from "@/server/ai/tooling/toolExecutor";
import { formatMessageEvent, formatDoneEvent, formatErrorEvent, type ChatMessage, type ConfirmationData, type SSERequest } from "@/server/ai/llm/types";
import type { TransactionRepository } from "@/server/repositories/transactionRepository";
import type { CategoryRepository } from "@/server/repositories/categoryRepository";
import type { UserRepository } from "@/server/repositories/userRepository";

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
  const { messageTrail, newMessage, image, confirmationData } = request;

  const tools = createToolDefinitions(deps.transactionRepo, deps.categoryRepo, deps.userId);

  const user = await deps.userRepo.findById(deps.userId);
  const personality = user?.personality;

  const chatDeps: ChatServiceDeps = {
    ai: deps.ai,
    userId: deps.userId,
    personality,
  };

  // Helper to run AI with tool support
  const runAI = async (messages: ChatMessage[], availableTools?: ToolDefinition[]): Promise<string> => {
    const toolSchemas = availableTools?.map((t) => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    }));

    const response = await deps.ai.run("@cf/moonshotai/kimi-k2.6", {
      messages: messages.map((m: ChatMessage) => ({ role: m.role, content: m.content })),
      tools: toolSchemas,
      stream: false,
      max_tokens: 1024,
      temperature: 0.7,
    });

    // Extract response content
    if (typeof response === "string") return response;

    const res = response as { response?: string; tool_calls?: unknown[] };
    return res.response ?? "";
  };

  return new ReadableStream({
    async start(controller) {
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

        // Initial AI call
        const initialResult = await chatService(chatDeps, messageTrail, newMessage, image);

        if (!initialResult.success) {
          // Stream fallback content
          const fallback = initialResult.fallbackContent;
          for (let i = 0; i < fallback.length; i += 20) {
            controller.enqueue(encoder.encode(formatMessageEvent(fallback.substring(i, i + 20))));
            await new Promise((r) => setTimeout(r, 10));
          }
          controller.enqueue(encoder.encode(formatDoneEvent("error", { message: initialResult.error })));
          controller.close();
          return;
        }

        // Stream the initial response
        const content = initialResult.content;
        for (let i = 0; i < content.length; i += 20) {
          controller.enqueue(encoder.encode(formatMessageEvent(content.substring(i, i + 20))));
          await new Promise((r) => setTimeout(r, 10));
        }

        // Execute tool loop
        const toolResult = await executeToolLoop(
          content,
          tools,
          runAI,
          [
            ...messageTrail,
            { role: "user", content: newMessage },
          ],
        );

        // Stream remaining content from tool loop
        const lastMessage = toolResult.messages[toolResult.messages.length - 1];
        if (lastMessage && lastMessage.content !== content) {
          const additionalContent = lastMessage.content;
          for (let i = 0; i < additionalContent.length; i += 20) {
            controller.enqueue(encoder.encode(formatMessageEvent(additionalContent.substring(i, i + 20))));
            await new Promise((r) => setTimeout(r, 10));
          }
        }

        // Send done event with metadata
        if (toolResult.confirmation) {
          controller.enqueue(encoder.encode(formatDoneEvent("confirmation", {
            parsedData: toolResult.confirmation,
          })));
        } else if (toolResult.saved) {
          controller.enqueue(encoder.encode(formatDoneEvent("saved", {
            transactionId: toolResult.saved.id,
          })));
        } else {
          controller.enqueue(encoder.encode(formatDoneEvent("normal")));
        }

        controller.close();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Internal server error";
        controller.enqueue(encoder.encode(formatErrorEvent("AI_ERROR", errorMessage)));
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
