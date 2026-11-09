import { cookies } from "next/headers";
import {
  authorizationUrl,
  createOAuthState,
  seal,
  STATE_COOKIE,
  SearchConsoleError,
} from "@/lib/search-console/core";
import {
  credentials,
  encryptionKey,
  loadConnection,
  searchBody,
  searchFailure,
  searchJson,
  searchSession,
} from "@/lib/search-console/server";

export async function POST(request: Request) {
  try {
    const member = await searchSession();
    await searchBody(request);
    const connection = await loadConnection();
    if (!connection)
      throw new SearchConsoleError(
        "بيانات اتصال Google لم تُجهز على الخادم بعد.",
        503,
        "not_configured",
      );
    const state = createOAuthState(member.id, connection.generation);
    (await cookies()).set(STATE_COOKIE, seal(state, encryptionKey(), "state"), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 600,
      path: "/api/board/seo/google",
    });
    return searchJson({
      url: authorizationUrl(credentials(connection).clientId, state),
    });
  } catch (error) {
    return searchFailure(error);
  }
}
