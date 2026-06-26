import { z } from "zod";
import { routeDetail } from "@/server/openapi/route-metadata";
import { aiChatController } from "@/server/controller/aiChatController";
import { UserRepository } from "@/server/repositories/userRepository";
import { TransactionRepository } from "@/server/repositories/transactionRepository";
import { CategoryRepository } from "@/server/repositories/categoryRepository";
import { authMiddleware } from "@/server/middleware/auth";
import { getRuntimeEnv } from "@/server/context/bindings";
import { databaseUnavailableError, withDatabaseErrorResponse } from "@/server/http/databaseErrorResponse";

const createConfirmationDataSchema = z.object({
  operation: z.literal("create").optional(),
  type: z.enum(["income", "expense"]),
  amount: z.number().positive(),
  currency: z.string().default("PHP"),
  category: z.string().optional(),
  description: z.string().optional(),
  date: z.string(),
});

const updateConfirmationDataSchema = z.object({
  operation: z.literal("update"),
  transactionId: z.string().min(1),
  type: z.enum(["income", "expense"]).optional(),
  amount: z.number().positive().optional(),
  currency: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  date: z.string().optional(),
}).refine(
  (data) => [data.type, data.amount, data.currency, data.category, data.description, data.date]
    .some((value) => value !== undefined),
  "At least one transaction field is required",
);

const deleteConfirmationDataSchema = z.object({
  operation: z.literal("delete"),
  transactionId: z.string().min(1),
  description: z.string().optional(),
});

const confirmationDataSchema = z.union([
  createConfirmationDataSchema,
  updateConfirmationDataSchema,
  deleteConfirmationDataSchema,
]);

const chatRequestSchema = z.object({
  messageTrail: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })).default([]),
  newMessage: z.string().min(1).max(4000),
  image: z.string().base64().optional(),
  timeZone: z.string().min(1).max(100).optional(),
  confirmationData: confirmationDataSchema.optional(),
});

function normalizeChatBody(body: unknown): unknown {
  if (!body || typeof body !== "object" || Array.isArray(body)) return body;

  const data = body as Record<string, unknown>;
  if (typeof data.newMessage === "string") return data;
  if (typeof data.message !== "string") return data;

  return {
    ...data,
    newMessage: data.message,
  };
}

export const chatRouteDetail = routeDetail("POST", "/api/chat", {
  summary: "Send a message to the AI assistant",
  description: "Sends a user message to the AI finance assistant. Returns a streaming SSE response with the AI's reply. Supports text messages and optional image attachments for receipt analysis.",
  tags: ["Chat"],
  auth: true,
  request: {
    body: chatRequestSchema,
  },
  response: {
    description: "Streaming SSE response with AI reply chunks. Events: 'message' (text chunk), 'done' (completion with metadata), 'error' (error details)",
    isStream: true,
  },
  errorCodes: [
    { code: "RATE_LIMITED", status: 429, description: "Too many messages sent. Please wait before sending another." },
    { code: "AI_SERVICE_ERROR", status: 502, description: "AI service is temporarily unavailable" },
    { code: "UNAUTHORIZED", status: 401, description: "Authentication required" },
  ],
});

const handlePOST = async (context: any) => {
  const request = context.request;

  // Auth check
  const env = getRuntimeEnv();
  const auth = await authMiddleware(request, env);
  if (!auth.authenticated) {
    const code = auth.status === 503 ? "DATABASE_UNAVAILABLE" : "UNAUTHORIZED";
    return new Response(
      JSON.stringify({ error: { code, message: auth.error } }),
      { status: auth.status, headers: { "Content-Type": "application/json" } }
    );
  }

  // Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: { code: "INVALID_INPUT", message: "Invalid request body" } }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Validate
  const parseResult = chatRequestSchema.safeParse(normalizeChatBody(body));
  if (!parseResult.success) {
    return new Response(
      JSON.stringify({ error: { code: "INVALID_INPUT", message: parseResult.error.message } }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { messageTrail, newMessage, image, confirmationData, timeZone } = parseResult.data;

  // Check for AI binding
  const ai = env.AI;
  const db = env.DB;
  if (!ai) {
    return new Response(
      JSON.stringify({ error: { code: "AI_SERVICE_ERROR", message: "AI service not configured" } }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!db) {
    throw databaseUnavailableError("D1_ERROR: DB binding not available");
  }

  const userId = auth.context.userId;
  const userRepo = new UserRepository(db);
  const transactionRepo = new TransactionRepository(db);
  const categoryRepo = new CategoryRepository(db);

  // Create SSE stream
  const stream = await aiChatController(
    {
      ai,
      userId,
      transactionRepo,
      categoryRepo,
      userRepo,
    },
    { messageTrail, newMessage, image, confirmationData, timeZone },
  );

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
};

export const POST = (context: any) =>
  withDatabaseErrorResponse(context, () => handlePOST(context));
