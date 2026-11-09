import {
  SEARCH_CALLBACK,
  ANALYTICS_SCOPE,
  SEARCH_SCOPE,
  SEARCH_SITE,
  SearchConsoleError,
  searchPeriods,
} from "./core";
import type {
  Inspection,
  SearchCountry,
  SearchMetrics,
  SearchPeriod,
  SearchReport,
  SearchRow,
} from "./types";

export type GoogleCredentials = { clientId: string; clientSecret: string };
type Fetcher = typeof fetch;
type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  scope?: string;
};

export async function googleJson(
  url: string,
  init: RequestInit,
  fetcher: Fetcher = fetch,
) {
  let response: Response;
  try {
    response = await fetcher(url, {
      ...init,
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new SearchConsoleError(
      "تعذر الاتصال بـGoogle الآن. حاول لاحقًا.",
      503,
      "google_unavailable",
    );
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const reason =
      typeof body.error === "string" ? body.error : body.error?.status;
    if (reason === "invalid_grant" || response.status === 401)
      throw new SearchConsoleError(
        "انتهى تفويض Google أو أُلغي. أعد ربط الحساب.",
        409,
        "reconnect_required",
      );
    if (response.status === 403)
      throw new SearchConsoleError(
        "لم يسمح Google بالطلب. تحقق من تفعيل API المطلوبة وصلاحية الحساب للموقع أو خاصية Analytics.",
        403,
        "google_forbidden",
      );
    if (response.status === 429)
      throw new SearchConsoleError(
        "وصلنا إلى حد طلبات Google مؤقتًا. حاول لاحقًا.",
        429,
        "google_quota",
      );
    throw new SearchConsoleError(
      "تعذر قراءة استجابة Google. حاول لاحقًا.",
      503,
      "google_unavailable",
    );
  }
  try {
    return await response.json();
  } catch {
    throw new SearchConsoleError(
      "استجابة Google غير مكتملة. حاول لاحقًا.",
      503,
      "google_unavailable",
    );
  }
}

export async function exchangeCode(
  credentials: GoogleCredentials,
  code: string,
  verifier: string,
  fetcher: Fetcher = fetch,
  analytics = false,
): Promise<TokenResponse> {
  const token = await googleJson(
    "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        code,
        code_verifier: verifier,
        redirect_uri: SEARCH_CALLBACK,
        grant_type: "authorization_code",
      }),
    },
    fetcher,
  );
  if (
    typeof token.access_token !== "string" ||
    typeof token.refresh_token !== "string" ||
    !token.refresh_token ||
    (token.scope && !token.scope.split(" ").includes(SEARCH_SCOPE)) ||
    (analytics &&
      (!token.scope?.split(" ").includes(ANALYTICS_SCOPE) ||
        !token.scope.split(" ").includes(SEARCH_SCOPE)))
  )
    throw new SearchConsoleError(
      "لم يكتمل تفويض القراءة. أعد الربط ووافق على الصلاحيات المطلوبة.",
      409,
      "reconnect_required",
    );
  return token;
}

export async function refreshAccessToken(
  credentials: GoogleCredentials,
  refreshToken: string,
  fetcher: Fetcher = fetch,
): Promise<TokenResponse> {
  const token = await googleJson(
    "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    },
    fetcher,
  );
  if (typeof token.access_token !== "string" || !token.access_token)
    throw new SearchConsoleError(
      "أعد تفويض Google للمتابعة.",
      409,
      "reconnect_required",
    );
  return token;
}

export async function verifyProperty(
  accessToken: string,
  fetcher: Fetcher = fetch,
) {
  const property = await googleJson(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SEARCH_SITE)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
    fetcher,
  );
  if (!["siteOwner", "siteFullUser"].includes(property.permissionLevel))
    throw new SearchConsoleError(
      "اختر حساب Google الذي يملك الموقع أو له صلاحية مستخدم كامل عليه.",
      403,
      "google_forbidden",
    );
}

function metrics(row: Record<string, unknown>): SearchMetrics {
  const result = {
    clicks: Number(row.clicks),
    impressions: Number(row.impressions),
    ctr: Number(row.ctr),
    position: Number(row.position),
  };
  if (
    Object.values(result).some((n) => !Number.isFinite(n) || n < 0) ||
    result.ctr > 1
  )
    throw new SearchConsoleError(
      "بيانات الأداء التي أعادها Google غير مكتملة.",
      503,
      "google_unavailable",
    );
  return result;
}

export async function fetchSearchReport(
  accessToken: string,
  country: SearchCountry,
  now = new Date(),
  fetcher: Fetcher = fetch,
): Promise<SearchReport> {
  const periods = searchPeriods(now);
  const query = async (
    period: SearchPeriod,
    dimensions: string[] = [],
  ): Promise<SearchRow[]> => {
    const result = await googleJson(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SEARCH_SITE)}/searchAnalytics/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...period,
          type: "web",
          dataState: "final",
          dimensions,
          rowLimit: dimensions[0] === "date" ? 28 : dimensions.length ? 20 : 1,
          ...(country === "sau"
            ? {
                dimensionFilterGroups: [
                  {
                    groupType: "and",
                    filters: [
                      {
                        dimension: "country",
                        operator: "equals",
                        expression: "SAU",
                      },
                    ],
                  },
                ],
              }
            : {}),
        }),
      },
      fetcher,
    );
    if (result.rows !== undefined && !Array.isArray(result.rows))
      throw new SearchConsoleError(
        "بيانات الأداء غير مكتملة.",
        503,
        "google_unavailable",
      );
    return (result.rows || []).map((row: Record<string, unknown>) => ({
      ...metrics(row),
      key: Array.isArray(row.keys) ? String(row.keys[0] || "") : "",
    }));
  };
  const [current, previous, trend, queries, pages, devices] = await Promise.all(
    [
      query(periods.current),
      query(periods.previous),
      query(periods.current, ["date"]),
      query(periods.current, ["query"]),
      query(periods.current, ["page"]),
      query(periods.current, ["device"]),
    ],
  );
  const metricOnly = (row?: SearchRow): SearchMetrics | null =>
    row
      ? {
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: row.ctr,
          position: row.position,
        }
      : null;
  trend.sort((a, b) => a.key.localeCompare(b.key));
  return {
    country,
    currentPeriod: periods.current,
    previousPeriod: periods.previous,
    current: metricOnly(current[0]),
    previous: metricOnly(previous[0]),
    trend,
    queries,
    pages,
    devices,
    fetchedAt: now.toISOString(),
    lastDataDate: trend.at(-1)?.key || null,
  };
}

export async function inspectUrl(
  accessToken: string,
  url: string,
  fetcher: Fetcher = fetch,
): Promise<Inspection> {
  const data = await googleJson(
    "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inspectionUrl: url,
        siteUrl: SEARCH_SITE,
        languageCode: "ar",
      }),
    },
    fetcher,
  );
  const result = data.inspectionResult;
  if (!result?.indexStatusResult)
    throw new SearchConsoleError(
      "لا تتوفر نتيجة فحص لهذا الرابط حاليًا.",
      503,
      "google_unavailable",
    );
  const index = result.indexStatusResult;
  const text = (value: unknown) =>
    typeof value === "string" ? value.slice(0, 2048) : null;
  const inspectionLink = text(result.inspectionResultLink);
  return {
    url,
    verdict: text(index.verdict) || "VERDICT_UNSPECIFIED",
    coverage: text(index.coverageState) || "لم يحدد Google حالة التغطية",
    indexingState: text(index.indexingState),
    robotsState: text(index.robotsTxtState),
    lastCrawlTime: text(index.lastCrawlTime),
    googleCanonical: text(index.googleCanonical),
    userCanonical: text(index.userCanonical),
    inspectionLink: inspectionLink?.startsWith(
      "https://search.google.com/search-console/",
    )
      ? inspectionLink
      : null,
    inspectedAt: new Date().toISOString(),
  };
}

export async function revokeToken(
  refreshToken: string,
  fetcher: Fetcher = fetch,
) {
  try {
    const response = await fetcher("https://oauth2.googleapis.com/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token: refreshToken }),
      signal: AbortSignal.timeout(10000),
      redirect: "error",
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}
