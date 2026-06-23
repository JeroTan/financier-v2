import { z } from "zod";
import { routeDetail } from "@/server/openapi/route-metadata";
import { CategoryRepository } from "@/server/repositories/categoryRepository";
import { authMiddleware } from "@/server/middleware/auth";
import { getRuntimeEnv } from "@/server/context/bindings";
import { databaseUnavailableError, withDatabaseErrorResponse } from "@/server/http/databaseErrorResponse";

const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  icon: z.string().max(10).optional(),
});

export const categoriesRouteDetail = routeDetail("GET", "/api/categories", {
  summary: "List user categories",
  description: "Returns all categories for the authenticated user, including seeded defaults.",
  tags: ["Categories"],
  auth: true,
  response: {
    description: "List of categories",
    schema: z.object({
      success: z.literal(true),
      data: z.array(z.object({
        id: z.string(),
        name: z.string(),
        icon: z.string().nullable(),
        isDefault: z.number(),
      })),
    }),
  },
  errorCodes: [
    { code: "UNAUTHORIZED", status: 401, description: "Authentication required" },
    { code: "SERVER_ERROR", status: 500, description: "Database error" },
  ],
});

export const createCategoryRouteDetail = routeDetail("POST", "/api/categories", {
  summary: "Create a new category",
  description: "Creates a new custom category for the authenticated user, or returns the existing matching category.",
  tags: ["Categories"],
  auth: true,
  request: {
    body: createCategorySchema,
  },
  response: {
    description: "Category created or returned successfully",
    schema: z.object({
      success: z.literal(true),
      data: z.object({
        id: z.string(),
        name: z.string(),
        icon: z.string().nullable(),
      }),
    }),
  },
  errorCodes: [
    { code: "INVALID_INPUT", status: 400, description: "Invalid request body" },
    { code: "UNAUTHORIZED", status: 401, description: "Authentication required" },
    { code: "SERVER_ERROR", status: 500, description: "Database error" },
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

const handleGET = async (context: any) => {
  const request = context.request;
  const env = getRuntimeEnv();

  const auth = await authMiddleware(request, env);
  if (!auth.authenticated) {
    const code = auth.status === 503 ? "DATABASE_UNAVAILABLE" : "UNAUTHORIZED";
    return errorResponse(code, auth.error, auth.status);
  }

  const db = env.DB;
  if (!db) throw databaseUnavailableError("D1_ERROR: DB binding not available");

  const repo = new CategoryRepository(db);
  const categories = await repo.seedDefaultCategories(auth.context.userId);

  return jsonResponse({
    success: true,
    data: categories,
  });
};

const handlePOST = async (context: any) => {
  const request = context.request;
  const env = getRuntimeEnv();

  const auth = await authMiddleware(request, env);
  if (!auth.authenticated) {
    const code = auth.status === 503 ? "DATABASE_UNAVAILABLE" : "UNAUTHORIZED";
    return errorResponse(code, auth.error, auth.status);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("INVALID_INPUT", "Invalid request body", 400);
  }

  const parseResult = createCategorySchema.safeParse(body);
  if (!parseResult.success) {
    return errorResponse("INVALID_INPUT", parseResult.error.message, 400);
  }

  const db = env.DB;
  if (!db) throw databaseUnavailableError("D1_ERROR: DB binding not available");

  const repo = new CategoryRepository(db);
  const category = await repo.findOrCreateCategory(auth.context.userId, parseResult.data.name);

  return jsonResponse({
    success: true,
    data: {
      id: category.id,
      name: category.name,
      icon: category.icon,
    },
  });
};

export const GET = (context: any) =>
  withDatabaseErrorResponse(context, () => handleGET(context));

export const POST = (context: any) =>
  withDatabaseErrorResponse(context, () => handlePOST(context));
