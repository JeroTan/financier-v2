import { routeDetail } from "@/server/openapi/route-metadata";
import { z } from "zod";
import { authMiddleware } from "@/server/middleware/auth";

export const uploadReceiptDetail = routeDetail("POST", "/api/receipts", {
  summary: "Upload a receipt image",
  description: "Uploads a receipt image to R2 storage. Returns the public URL of the uploaded file.",
  tags: ["Receipts"],
  auth: true,
  request: {
    body: z.object({
      file: z.instanceof(File).or(z.any()),
    }),
  },
  response: {
    schema: z.object({
      success: z.boolean(),
      data: z.object({
        url: z.string(),
      }),
    }),
    description: "Receipt uploaded successfully with URL",
  },
  errorCodes: [
    { code: "INVALID_FILE", status: 400, description: "Invalid file type or size. Max 10MB." },
    { code: "STORAGE_ERROR", status: 500, description: "Failed to upload to storage" },
  ],
});

type AppLocals = {
  storage?: R2Bucket;
};

function getLocals(request: Request): AppLocals {
  return ((request as any).locals ?? {}) as AppLocals;
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function errorResponse(code: string, message: string, status: number): Response {
  return jsonResponse({ error: { code, message } }, status);
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 10 * 1024 * 1024;

export const POST = async (context: any) => {
  const request = context.request;
  const locals = getLocals(request);
  const env = (context as any).env as Record<string, unknown> | undefined;

  const auth = await authMiddleware(request, env ?? {});
  if (!auth.authenticated) return errorResponse("UNAUTHORIZED", auth.error, auth.status);

  const storage = locals.storage;
  if (!storage) return errorResponse("STORAGE_ERROR", "Storage not configured", 500);

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) return errorResponse("INVALID_FILE", "No file provided", 400);
  if (!ALLOWED_TYPES.includes(file.type)) return errorResponse("INVALID_FILE", "Invalid file type", 400);
  if (file.size > MAX_SIZE) return errorResponse("INVALID_FILE", "File too large (max 10MB)", 400);

  const key = `receipts/${auth.context.userId}/${crypto.randomUUID()}-${file.name}`;

  try {
    await storage.put(key, file, {
      httpMetadata: { contentType: file.type },
    });

    const url = `/api/receipts/${key}`;

    return jsonResponse({
      success: true,
      data: { url },
    });
  } catch {
    return errorResponse("STORAGE_ERROR", "Failed to upload file", 500);
  }
};
