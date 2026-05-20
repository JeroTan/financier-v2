import { generateSpec } from "@/server/openapi/spec-generator";
import "@/server/openapi/index";

export const GET = async () => {
  const spec = generateSpec();

  return new Response(JSON.stringify(spec, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
  });
};
