import type { ZodTypeAny } from "zod";
import { z } from "zod";
import { getRegistry } from "./route-metadata";
import { createTransactionSchema, transactionQuerySchema } from "@/server/dto/transaction";
import { createUserSchema, updateUserSettingsSchema, updatePasswordSchema } from "@/server/dto/user";
import { createCategorySchema } from "@/server/dto/category";
import { createGoalSchema } from "@/server/dto/goal";
import { statsQuerySchema } from "@/server/dto/stats";

type OpenAPIPathItem = {
  get?: Record<string, unknown>;
  post?: Record<string, unknown>;
  put?: Record<string, unknown>;
  delete?: Record<string, unknown>;
  patch?: Record<string, unknown>;
};

type OpenAPISpec = {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers: { url: string }[];
  paths: Record<string, OpenAPIPathItem>;
  components: {
    schemas: Record<string, unknown>;
    securitySchemes: Record<string, unknown>;
  };
  tags: { name: string; description: string }[];
};

function zodToJsonSchema(schema: ZodTypeAny): Record<string, unknown> {
  try {
    const jsonSchema = z.toJSONSchema(schema);
    return jsonSchema as Record<string, unknown>;
  } catch {
    // Fallback for types that can't be converted (coerce, transform, etc.)
    return { type: "object", description: "Schema contains types that cannot be represented in JSON Schema" };
  }
}

let cachedSpec: OpenAPISpec | null = null;

export function generateSpec(): OpenAPISpec {
  if (cachedSpec) return cachedSpec;

  const registry = getRegistry();
  const paths: Record<string, OpenAPIPathItem> = {};
  const schemas: Record<string, unknown> = {};
  const tagSet = new Set<string>();

  for (const { method, path, options } of registry) {
    if (!paths[path]) paths[path] = {};

    const operation: Record<string, unknown> = {
      summary: options.summary,
      tags: options.tags,
      operationId: `${method.toLowerCase()}_${path.replace(/[^a-zA-Z0-9]/g, "_")}`,
    };

    if (options.description) operation.description = options.description;
    if (options.deprecated) operation.deprecated = true;
    if (options.auth) {
      operation.security = [{ BearerAuth: [] }];
    }

    // Request body
    if (options.request?.body && method.toLowerCase() !== "get") {
      operation.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: zodToJsonSchema(options.request.body),
          },
        },
      };
    }

    // Query parameters
    if (options.request?.query) {
      const querySchemaObj = zodToJsonSchema(options.request.query) as { properties?: Record<string, unknown>; required?: string[] };
      const params: Record<string, unknown>[] = [];

      if (querySchemaObj.properties) {
        for (const [key, value] of Object.entries(querySchemaObj.properties)) {
          params.push({
            name: key,
            in: "query",
            required: querySchemaObj.required?.includes(key) ?? false,
            schema: value,
          });
        }
      }

      operation.parameters = params;
    }

    // Response
    if (options.response?.isStream) {
      operation.responses = {
        "200": {
          description: options.response.description || "Streaming response",
          content: {
            "text/event-stream": {
              schema: { type: "string" },
            },
          },
        },
      };
    } else if (options.response?.schema) {
      operation.responses = {
        "200": {
          description: options.response.description || "Successful response",
          content: {
            "application/json": {
              schema: zodToJsonSchema(options.response.schema),
            },
          },
        },
      };
    } else {
      operation.responses = {
        "200": { description: "Successful response" },
      };
    }

    // Error responses
    if (options.errorCodes && options.errorCodes.length > 0) {
      for (const err of options.errorCodes) {
        if (!operation.responses) operation.responses = {};
        (operation.responses as Record<string, unknown>)[err.status] = {
          description: err.description,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  error: {
                    type: "object",
                    properties: {
                      code: { type: "string", example: err.code },
                      message: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        };
      }
    }

    const methodKey = method.toLowerCase() as keyof OpenAPIPathItem;
    paths[path][methodKey] = operation as any;

    for (const tag of options.tags) tagSet.add(tag);
  }

  // Register DTO schemas
  const dtoSchemas = getDTOSchemas();
  for (const [name, schema] of Object.entries(dtoSchemas)) {
    schemas[name] = zodToJsonSchema(schema);
  }

  cachedSpec = {
    openapi: "3.1.0",
    info: {
      title: "Financier API",
      version: "1.0.0",
      description: "AI-Powered Personal Finance Tracker API",
    },
    servers: [{ url: "/api" }],
    paths,
    components: {
      schemas,
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT access token",
        },
      },
    },
    tags: Array.from(tagSet).map((name) => ({ name, description: `${name} operations` })),
  };

  return cachedSpec;
}

export function invalidateCache(): void {
  cachedSpec = null;
}

function getDTOSchemas(): Record<string, ZodTypeAny> {
  return {
    CreateTransaction: createTransactionSchema,
    TransactionQuery: transactionQuerySchema,
    CreateUser: createUserSchema,
    UpdateUserSettings: updateUserSettingsSchema,
    UpdatePassword: updatePasswordSchema,
    CreateCategory: createCategorySchema,
    CreateGoal: createGoalSchema,
    StatsQuery: statsQuerySchema,
  };
}
