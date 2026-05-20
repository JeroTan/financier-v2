import { z } from "zod";
import { routeDetail } from "@/server/openapi/route-metadata";
import { aiChatController } from "@/server/controller/aiChatController";
import { UserRepository } from "@/server/repositories/userRepository";
import { TransactionRepository } from "@/server/repositories/transactionRepository";
import { CategoryRepository } from "@/server/repositories/categoryRepository";
import { authMiddleware } from "@/server/middleware/auth";

const chatRequestSchema = z.object({
  messageTrail: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })).default([]),
  newMessage: z.string().min(1).max(4000),
  image: z.string().base64().optional(),
});

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

type AppLocals = {
  db?: D1Database;
  ai?: Ai;
  userId?: string;
  userEmail?: string;
};

function getLocals(request: Request): AppLocals {
  return ((request as any).locals ?? {}) as AppLocals;
}

export const POST = async (context: any) => {
  const request = context.request;
  const locals = getLocals(request);

  // Auth check
  const env = (context as any).env as Record<string, unknown> | undefined;
  const auth = await authMiddleware(request, env ?? {});
  if (!auth.authenticated) {
    return new Response(
      JSON.stringify({ error: { code: "UNAUTHORIZED", message: auth.error } }),
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
  const parseResult = chatRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return new Response(
      JSON.stringify({ error: { code: "INVALID_INPUT", message: parseResult.error.message } }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { messageTrail, newMessage, image } = parseResult.data;

  // Check for AI binding
  const ai = locals.ai;
  const db = locals.db;
  if (!ai) {
    return new Response(
      JSON.stringify({ error: { code: "AI_SERVICE_ERROR", message: "AI service not configured" } }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!db) {
    return new Response(
      JSON.stringify({ error: { code: "SERVER_ERROR", message: "Database not available" } }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
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
    { messageTrail, newMessage, image },
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
