import { authMiddleware } from "@/server/middleware/auth";
import { getRuntimeEnv } from "@/server/context/bindings";

function jsonError(code: string, message: string, status: number): Response {
  return new Response(JSON.stringify({ error: { code, message } }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET = async (context: any) => {
  const request = context.request;
  const env = getRuntimeEnv();

  const auth = await authMiddleware(request, env);
  if (!auth.authenticated) return jsonError("UNAUTHORIZED", auth.error, auth.status);

  const storage = env.STORAGE;
  if (!storage) return jsonError("STORAGE_ERROR", "Storage not configured", 500);

  const pathname = new URL(request.url).pathname;
  const key = decodeURIComponent(pathname.replace(/^\/api\/receipts\//, ""));
  const expectedPrefix = `receipts/${auth.context.userId}/`;

  if (!key || !key.startsWith(expectedPrefix)) {
    return jsonError("NOT_FOUND", "Receipt not found", 404);
  }

  const object = await storage.get(key);
  if (!object) return jsonError("NOT_FOUND", "Receipt not found", 404);

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Cache-Control", "private, max-age=300");
  headers.set("ETag", object.httpEtag);

  return new Response(object.body, { headers });
};
