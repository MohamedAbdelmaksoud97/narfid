import { cookies } from "next/headers";
import { siteOrigin } from "@/lib/seo";
import {
  SEARCH_SCOPE,
  STATE_COOKIE,
  unseal,
  validateOAuthState,
  SearchConsoleError,
  type OAuthState,
} from "@/lib/search-console/core";
import { exchangeCode, verifyProperty } from "@/lib/search-console/google";
import {
  credentials,
  encryptionKey,
  loadConnection,
  privateHeaders,
  saveConnection,
  searchSession,
} from "@/lib/search-console/server";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const encrypted = cookieStore.get(STATE_COOKIE)?.value;
  cookieStore.set(STATE_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/api/board/seo/google",
  });
  let result = "connected";
  try {
    const member = await searchSession();
    const connection = await loadConnection();
    if (!encrypted || !connection)
      throw new SearchConsoleError(
        "محاولة الربط غير صالحة.",
        400,
        "invalid_state",
      );
    let state: OAuthState;
    try {
      state = unseal<OAuthState>(encrypted, encryptionKey(), "state");
    } catch {
      throw new SearchConsoleError(
        "محاولة الربط غير صالحة.",
        400,
        "invalid_state",
      );
    }
    const params = new URL(request.url).searchParams;
    validateOAuthState(
      state,
      params.get("state"),
      member.id,
      connection.generation,
    );
    if (params.has("error"))
      throw new SearchConsoleError(
        "لم تكتمل موافقة Google.",
        400,
        "google_denied",
      );
    const code = params.get("code");
    if (!code || code.length > 4096)
      throw new SearchConsoleError("لم يصل رمز التفويض.", 400, "invalid_state");
    const token = await exchangeCode(
      credentials(connection),
      code,
      state.verifier,
    );
    await verifyProperty(token.access_token);
    await saveConnection(
      connection,
      token.refresh_token!,
      member.id,
      token.scope?.split(" ") || [SEARCH_SCOPE],
    );
  } catch (error) {
    result = error instanceof SearchConsoleError ? error.code : "unavailable";
  }
  const target = new URL("/board/seo", siteOrigin());
  target.searchParams.set("google", result);
  target.hash = "seo-google";
  return new Response(null, {
    status: 303,
    headers: { ...privateHeaders, Location: target.href },
  });
}
