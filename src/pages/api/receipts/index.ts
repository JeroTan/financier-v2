import { routeDetail } from "@/server/openapi/route-metadata";
import { z } from "zod";
import { authMiddleware } from "@/server/middleware/auth";
import { getRuntimeEnv } from "@/server/context/bindings";
import { withDatabaseErrorResponse } from "@/server/http/databaseErrorResponse";

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

function isFormContentType(request: Request): boolean {
  const contentType = request.headers.get("Content-Type") ?? "";
  return contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded");
}

const handlePOST = async (context: any) => {
  const request = context.request;
  const env = getRuntimeEnv();

  const auth = await authMiddleware(request, env);
  if (!auth.authenticated) {
    const code = auth.status === 503 ? "DATABASE_UNAVAILABLE" : "UNAUTHORIZED";
    return errorResponse(code, auth.error, auth.status);
  }

  if (!isFormContentType(request)) {
    return errorResponse("INVALID_FILE", "Receipt upload requires multipart form data", 400);
  }

  const storage = env.STORAGE;
  if (!storage) return errorResponse("STORAGE_ERROR", "Storage not configured", 500);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse("INVALID_FILE", "Invalid form data", 400);
  }

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

export const POST = (context: any) =>
  withDatabaseErrorResponse(context, () => handlePOST(context));
