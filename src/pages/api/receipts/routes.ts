import { routeDetail } from "@/server/openapi/route-metadata";
import { z } from "zod";

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
