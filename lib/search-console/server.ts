import "server-only";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { getBoardAccess } from "@/lib/auth/session";
import { taskBody, TaskError } from "@/lib/tasks-server";
import { SEARCH_SITE, SearchConsoleError, seal, unseal } from "./core";
import {
  fetchSearchReport,
  inspectUrl,
  refreshAccessToken,
  revokeToken,
  type GoogleCredentials,
} from "./google";
import type { SearchCountry, SearchDashboard, SearchReport } from "./types";

export type StoredConnection = {
  site_url: string;
  client_credentials: string;
  refresh_token: string | null;
  generation: string;
  connected_at: string | null;
};

export function encryptionKey() {
  // A dedicated key may be configured; the existing server secret supports bootstrapping
  // without copying OAuth secrets into the repository or browser bundles.
  const key =
    process.env.GOOGLE_SEARCH_CONSOLE_ENCRYPTION_KEY ||
    process.env.SUPABASE_SECRET_KEY;
  if (!key || key.length < 32)
    throw new SearchConsoleError(
      "إعداد اتصال Google على الخادم غير مكتمل.",
      503,
      "not_configured",
    );
  return key;
}

export function searchAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key)
    throw new SearchConsoleError(
      "إعداد اتصال Google على الخادم غير مكتمل.",
      503,
      "not_configured",
    );
  // Never attach the board user's JWT to this service-only client.
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          cache: "no-store",
          signal: AbortSignal.timeout(15000),
        }),
    },
  });
}

export async function searchSession() {
  const access = await getBoardAccess();
  if (access.status === "unavailable")
    throw new SearchConsoleError(
      "تعذر التحقق من صلاحيات لوحة الإدارة.",
      503,
      "unavailable",
    );
  if (access.status !== "allowed")
    throw new SearchConsoleError(
      "سجّل دخولك بحساب مجلس الإدارة.",
      access.status === "forbidden" ? 403 : 401,
      "unauthorized",
    );
  return access.member;
}

export async function searchBody(request: Request) {
  try {
    return await taskBody(request);
  } catch (error) {
    if (error instanceof TaskError)
      throw new SearchConsoleError(error.message, error.status);
    throw error;
  }
}

export async function loadConnection(): Promise<StoredConnection | null> {
  const { data, error } = await searchAdmin()
    .from("seo_google_connections")
    .select("site_url,client_credentials,refresh_token,generation,connected_at")
    .eq("site_url", SEARCH_SITE)
    .maybeSingle();
  if (error)
    throw new SearchConsoleError(
      "تعذر قراءة حالة اتصال Google.",
      503,
      "unavailable",
    );
  return data;
}

export function credentials(connection: StoredConnection): GoogleCredentials {
  try {
    const data = unseal<GoogleCredentials>(
      connection.client_credentials,
      encryptionKey(),
      "credentials",
    );
    if (!data.clientId || !data.clientSecret) throw new Error();
    return data;
  } catch {
    throw new SearchConsoleError(
      "تعذر فتح بيانات الاتصال. أعد إعداد اتصال Google على الخادم.",
      503,
      "not_configured",
    );
  }
}

function readRefreshToken(connection: StoredConnection) {
  if (!connection.refresh_token)
    throw new SearchConsoleError(
      "اربط حساب Google أولًا.",
      409,
      "not_connected",
    );
  try {
    return unseal<string>(connection.refresh_token, encryptionKey(), "refresh");
  } catch {
    throw new SearchConsoleError(
      "تعذر قراءة التفويض. أعد ربط حساب Google.",
      409,
      "reconnect_required",
    );
  }
}

export async function accessToken(connection: StoredConnection) {
  const refresh = readRefreshToken(connection);
  const token = await refreshAccessToken(credentials(connection), refresh);
  if (token.refresh_token && token.refresh_token !== refresh) {
    const { error } = await searchAdmin()
      .from("seo_google_connections")
      .update({
        refresh_token: seal(token.refresh_token, encryptionKey(), "refresh"),
        updated_at: new Date().toISOString(),
      })
      .eq("site_url", SEARCH_SITE)
      .eq("generation", connection.generation)
      .eq("refresh_token", connection.refresh_token!);
    if (error)
      throw new SearchConsoleError(
        "تعذر حفظ تجديد تفويض Google.",
        503,
        "unavailable",
      );
  }
  return token.access_token;
}

export async function saveConnection(
  connection: StoredConnection,
  refreshToken: string,
  memberId: string,
  scopes: string[],
) {
  const { data, error } = await searchAdmin()
    .from("seo_google_connections")
    .update({
      refresh_token: seal(refreshToken, encryptionKey(), "refresh"),
      connected_at: new Date().toISOString(),
      connected_by: memberId,
      granted_scopes: scopes,
      generation: randomUUID(),
      updated_at: new Date().toISOString(),
    })
    .eq("site_url", SEARCH_SITE)
    .eq("generation", connection.generation)
    .select("generation")
    .maybeSingle();
  if (error || !data)
    throw new SearchConsoleError(
      "تغيّر الاتصال أثناء الربط. ابدأ محاولة جديدة.",
      409,
      "connection_changed",
    );
}

export async function loadDashboard(
  country: SearchCountry,
  force = false,
): Promise<SearchDashboard> {
  const connection = await loadConnection();
  const dashboard: SearchDashboard = {
    configured: Boolean(connection),
    connected: Boolean(connection?.refresh_token),
    siteUrl: SEARCH_SITE,
    connectedAt: connection?.connected_at || null,
    report: null,
    error: null,
    reconnectRequired: false,
  };
  if (!connection?.refresh_token) return dashboard;
  const { data: cached, error } = await searchAdmin()
    .from("seo_google_reports")
    .select("report,updated_at")
    .eq("site_url", SEARCH_SITE)
    .eq("country", country)
    .eq("generation", connection.generation)
    .maybeSingle();
  if (error)
    throw new SearchConsoleError(
      "تعذر قراءة تقرير البحث المحفوظ.",
      503,
      "unavailable",
    );
  if (cached) dashboard.report = cached.report as SearchReport;
  const age = cached
    ? Date.now() - new Date(cached.updated_at).getTime()
    : Infinity;
  // At most one manual refresh per minute; normal visits reuse a six-hour snapshot.
  if (cached && age >= 0 && age < (force ? 60000 : 21600000)) return dashboard;
  try {
    const report = await fetchSearchReport(
      await accessToken(connection),
      country,
    );
    const { error: saveError } = await searchAdmin()
      .from("seo_google_reports")
      .upsert(
        {
          site_url: SEARCH_SITE,
          country,
          generation: connection.generation,
          report,
          updated_at: report.fetchedAt,
        },
        { onConflict: "site_url,country" },
      );
    if (saveError)
      throw new SearchConsoleError(
        "تمت قراءة Google وتعذر حفظ التقرير. حاول لاحقًا.",
        503,
        "unavailable",
      );
    dashboard.report = report;
  } catch (failure) {
    dashboard.error =
      failure instanceof SearchConsoleError
        ? failure.message
        : "تعذر تحديث تقرير Google الآن.";
    dashboard.reconnectRequired =
      failure instanceof SearchConsoleError &&
      failure.code === "reconnect_required";
  }
  return dashboard;
}

export async function inspectPage(url: string) {
  const connection = await loadConnection();
  if (!connection?.refresh_token)
    throw new SearchConsoleError(
      "اربط حساب Google أولًا.",
      409,
      "not_connected",
    );
  return inspectUrl(await accessToken(connection), url);
}

export async function disconnectGoogle() {
  const connection = await loadConnection();
  if (!connection?.refresh_token) return { revoked: true };
  const token = readRefreshToken(connection);
  const { data, error } = await searchAdmin()
    .from("seo_google_connections")
    .update({
      refresh_token: null,
      connected_at: null,
      connected_by: null,
      granted_scopes: [],
      generation: randomUUID(),
      updated_at: new Date().toISOString(),
    })
    .eq("site_url", SEARCH_SITE)
    .eq("generation", connection.generation)
    .select("generation")
    .maybeSingle();
  if (error || !data)
    throw new SearchConsoleError(
      "تغيّر الاتصال. حدّث الصفحة وأعد المحاولة.",
      409,
      "connection_changed",
    );
  await searchAdmin()
    .from("seo_google_reports")
    .delete()
    .eq("site_url", SEARCH_SITE)
    .eq("generation", connection.generation);
  return { revoked: await revokeToken(token) };
}

export const privateHeaders = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
};
export function searchJson(value: unknown, status = 200) {
  return Response.json(value, { status, headers: privateHeaders });
}
export function searchFailure(error: unknown) {
  if (error instanceof SearchConsoleError)
    return searchJson({ error: error.message, code: error.code }, error.status);
  console.error(
    "Search Console request failed",
    error instanceof Error ? error.name : "Unknown",
  );
  return searchJson(
    { error: "تعذر تنفيذ طلب Search Console الآن.", code: "unavailable" },
    503,
  );
}
