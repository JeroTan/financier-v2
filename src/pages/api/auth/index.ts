import type { APIContext } from "astro";
import { errorResponse } from "@/server/auth/utils";
import "./routes";

export const GET = async (_context: APIContext) => errorResponse("NOT_FOUND", "Route not found", 404);
export const POST = async (_context: APIContext) => errorResponse("NOT_FOUND", "Route not found", 404);
