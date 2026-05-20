import { z } from "zod";
import { routeDetail } from "@/server/openapi/route-metadata";
import { CategoryRepository } from "@/server/repositories/categoryRepository";
import { authMiddleware } from "@/server/middleware/auth";

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
        icon: z.string(),
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
  description: "Creates a new custom category for the authenticated user.",
  tags: ["Categories"],
  auth: true,
  request: {
    body: createCategorySchema,
  },
  response: {
    description: "Category created successfully",
    schema: z.object({
      success: z.literal(true),
      data: z.object({
        id: z.string(),
        name: z.string(),
        icon: z.string(),
      }),
    }),
  },
  errorCodes: [
    { code: "INVALID_INPUT", status: 400, description: "Invalid request body" },
    { code: "UNAUTHORIZED", status: 401, description: "Authentication required" },
    { code: "SERVER_ERROR", status: 500, description: "Database error" },
  ],
});

type AppLocals = {
  db?: D1Database;
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

export const GET = async (context: any) => {
  const request = context.request;
  const locals = getLocals(request);
  const env = (context as any).env as Record<string, unknown> | undefined;

  const auth = await authMiddleware(request, env ?? {});
  if (!auth.authenticated) return errorResponse("UNAUTHORIZED", auth.error, auth.status);

  const db = locals.db;
  if (!db) return errorResponse("SERVER_ERROR", "Database not available", 500);

  const repo = new CategoryRepository(db);
  const categories = await repo.seedDefaultCategories(auth.context.userId);

  return jsonResponse({
    success: true,
    data: categories,
  });
};

export const POST = async (context: any) => {
  const request = context.request;
  const locals = getLocals(request);
  const env = (context as any).env as Record<string, unknown> | undefined;

  const auth = await authMiddleware(request, env ?? {});
  if (!auth.authenticated) return errorResponse("UNAUTHORIZED", auth.error, auth.status);

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

  const db = locals.db;
  if (!db) return errorResponse("SERVER_ERROR", "Database not available", 500);

  const repo = new CategoryRepository(db);
  const data = parseResult.data;

  const category = await repo.createCategory({
    id: crypto.randomUUID(),
    userId: auth.context.userId,
    name: data.name,
    icon: data.icon ?? "📦",
    isDefault: 0,
  });

  return jsonResponse({
    success: true,
    data: {
      id: category.id,
      name: category.name,
      icon: category.icon,
    },
  });
};
