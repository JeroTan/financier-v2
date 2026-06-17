import { routeDetail } from "@/server/openapi/route-metadata";
import { z } from "zod";

export const chatDetail = routeDetail("POST", "/api/chat", {
  summary: "Send a message to the AI assistant",
  description: "Sends a user message to the AI finance assistant. Returns a streaming SSE response with the AI's reply. Supports text messages and optional image attachments for receipt analysis.",
  tags: ["Chat"],
  auth: true,
  request: {
    body: z.object({
      messageTrail: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })).default([]),
      newMessage: z.string().min(1).max(4000),
      message: z.string().min(1).max(4000).optional().describe("Legacy alias for newMessage."),
      image: z.string().base64().optional(),
      confirmationData: z.object({
        type: z.enum(["income", "expense"]),
        amount: z.number().positive(),
        currency: z.string().default("PHP"),
        category: z.string().optional(),
        description: z.string().optional(),
        date: z.string(),
      }).optional(),
    }),
  },
  response: {
    description: "Streaming SSE response with AI reply chunks",
    isStream: true,
  },
  errorCodes: [
    { code: "RATE_LIMITED", status: 429, description: "Too many messages sent. Please wait before sending another." },
    { code: "AI_SERVICE_ERROR", status: 502, description: "AI service is temporarily unavailable" },
  ],
});
