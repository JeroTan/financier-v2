export function jsonResponse(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

export function errorResponse(code: string, message: string, status: number, headers: Record<string, string> = {}): Response {
  return jsonResponse({ error: { code, message } }, status, headers);
}

export function redirectResponse(location: string | URL, headers: Record<string, string> = {}): Response {
  return new Response(null, {
    status: 302,
    headers: {
      Location: location.toString(),
      ...headers,
    },
  });
}

export function getGoogleRedirectUri(request: Request): string {
  const origin = new URL(request.url).origin;
  return `${origin}/api/auth/google/callback`;
}

function isFormSubmit(request: Request): boolean {
  const contentType = request.headers.get("Content-Type") ?? "";
  return contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data");
}

export async function readCredentials(request: Request): Promise<{ email: string; password: string } | null> {
  const contentType = request.headers.get("Content-Type") ?? "";

  try {
    if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      return {
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
      };
    }
    return (await request.json()) as { email: string; password: string };
  } catch {
    return null;
  }
}

export function authSuccessResponse(
  request: Request,
  data: { setCookie?: string; data: unknown },
  status: number,
): Response {
  const headers: Record<string, string> = {};
  if (data.setCookie) headers["Set-Cookie"] = data.setCookie;

  if (isFormSubmit(request)) {
    return new Response(null, {
      status: 303,
      headers: {
        Location: "/dashboard",
        ...headers,
      },
    });
  }

  return jsonResponse(data.data, status, headers);
}
