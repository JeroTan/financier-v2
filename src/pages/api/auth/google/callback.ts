import type { APIContext } from "astro";
import { handleGoogleCallback } from "@/server/auth/google";
import { UserRepository } from "@/server/repositories/userRepository";
import { getRuntimeEnv } from "@/server/context/bindings";
import { getGoogleRedirectUri, redirectResponse } from "@/server/auth/utils";
import { withDatabaseErrorResponse } from "@/server/http/databaseErrorResponse";
import "../routes";

const handleGET = async (context: APIContext) => {
  const request = context.request;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) return redirectResponse(`${url.origin}/login?auth=error&message=${encodeURIComponent(error)}`);
  if (!code) return redirectResponse(`${url.origin}/login?auth=error&message=missing_code`);

  const env = getRuntimeEnv();
  const db = env.DB;
  if (!db) return redirectResponse(`${url.origin}/login?auth=error&message=server_error`);

  const userRepo = new UserRepository(db);
  const result = await handleGoogleCallback(
    {
      clientId: env.GOOGLE_CLIENT_ID as string,
      clientSecret: env.GOOGLE_CLIENT_SECRET as string,
      redirectUri: getGoogleRedirectUri(request),
    },
    userRepo,
    env,
    code,
  );

  if (result.error) return redirectResponse(`${url.origin}/login?auth=error&message=${encodeURIComponent(result.error)}`);

  const redirectUrl = new URL(result.data!.redirectUrl, url.origin);
  return redirectResponse(
    redirectUrl,
    result.data!.setCookie ? { "Set-Cookie": result.data!.setCookie } : {},
  );
};

export const GET = (context: APIContext) =>
  withDatabaseErrorResponse(context, () => handleGET(context));
