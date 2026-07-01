export type SSEEventType = "message" | "done" | "error";

export type SSEMessageEvent = {
  type: "message";
  content: string;
};

export type DoneState = "confirmation" | "saved" | "updated" | "deleted" | "normal" | "error";

export type SSERequest = {
  messageTrail: ChatMessage[];
  newMessage: string;
  image?: string | ChatImageAttachment;
  confirmationData?: ConfirmationData;
  timeZone?: string;
};

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type ChatTextContentPart = {
  type: "text";
  text: string;
};

export type ChatImageContentPart = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "low" | "high" | "auto";
  };
};

export type AiMessage = {
  role: "user" | "assistant" | "system";
  content: string | Array<ChatTextContentPart | ChatImageContentPart>;
};

export type ChatImageAttachment = {
  dataUrl: string;
  mediaType?: string;
};

export type CreateConfirmationData = {
  operation?: "create";
  type: "income" | "expense";
  amount: number;
  currency: string;
  category?: string;
  description?: string;
  date: string;
};

export type UpdateConfirmationData = {
  operation: "update";
  transactionId: string;
  type?: "income" | "expense";
  amount?: number;
  currency?: string;
  category?: string;
  description?: string;
  date?: string;
};

export type DeleteConfirmationData = {
  operation: "delete";
  transactionId: string;
  description?: string;
};

export type ConfirmationData = CreateConfirmationData | UpdateConfirmationData | DeleteConfirmationData;

export type SSEResponse = {
  success: true;
  data: {
    messageTrail: ChatMessage[];
    confirmation?: ConfirmationData;
    saved?: { id: string };
  };
} | {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

export function formatSSEEvent(type: SSEEventType, data: unknown): string {
  return `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
}

export function formatMessageEvent(content: string): string {
  return formatSSEEvent("message", { type: "text", content });
}

export function formatDoneEvent(state: DoneState, metadata?: Record<string, unknown>): string {
  return formatSSEEvent("done", { type: state, ...metadata });
}

export function formatErrorEvent(code: string, message: string): string {
  return formatSSEEvent("error", { code, message });
}
