import type { ZodTypeAny } from "zod";

export type RouteErrorCode = {
  code: string;
  status: number;
  description: string;
};

export type RouteDetailOptions = {
  summary: string;
  description?: string;
  tags: string[];
  auth?: boolean;
  rateLimitClass?: string;
  errorCodes?: RouteErrorCode[];
  request?: {
    body?: ZodTypeAny;
    query?: ZodTypeAny;
    params?: ZodTypeAny;
  };
  response?: {
    schema?: ZodTypeAny;
    description?: string;
    isStream?: boolean;
  };
  deprecated?: boolean;
};

type RegistryEntry = {
  method: string;
  path: string;
  options: RouteDetailOptions;
};

const registry: RegistryEntry[] = [];

export function routeDetail(method: string, path: string, options: RouteDetailOptions): RouteDetailOptions {
  registry.push({ method, path, options });
  return options;
}

export function getRegistry(): RegistryEntry[] {
  return registry;
}
