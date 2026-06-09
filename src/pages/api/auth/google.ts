import type { APIContext } from "astro";
import { getGoogleAuthUrl } from "@/server/auth/google";
import { getRuntimeEnv } from "@/server/context/bindings";
import { getGoogleRedirectUri, redirectResponse } from "@/server/auth/utils";
import "./routes";

export const GET = async (context: APIContext) => {
  const env = getRuntimeEnv();
  const authUrl = getGoogleAuthUrl({
    clientId: env.GOOGLE_CLIENT_ID as string,
    clientSecret: env.GOOGLE_CLIENT_SECRET as string,
    redirectUri: getGoogleRedirectUri(context.request),
  });
  return redirectResponse(authUrl);
};
