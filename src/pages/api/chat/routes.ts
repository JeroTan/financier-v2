import { routeDetail } from "@/server/openapi/route-metadata";
import { z } from "zod";

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

const imageAttachmentSchema = z.union([
  z.string().base64(),
  z.object({
    dataUrl: z.string().min(1).refine(
      (value) => /^data:image\/(?:jpeg|png|webp|gif);base64,/i.test(value),
      "Image must be a JPEG, PNG, WebP, or GIF data URL",
    ),
    mediaType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]).optional(),
  }),
]);

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
      image: imageAttachmentSchema.optional(),
      timeZone: z.string().min(1).max(100).optional().describe("Browser IANA timezone used to resolve relative dates."),
      confirmationData: z.union([
        createConfirmationDataSchema,
        updateConfirmationDataSchema,
        deleteConfirmationDataSchema,
      ]).optional(),
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
