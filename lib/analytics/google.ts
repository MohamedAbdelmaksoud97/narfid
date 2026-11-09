import { googleJson } from "@/lib/search-console/google";
import { SearchConsoleError } from "@/lib/search-console/core";
import type { SearchCountry } from "@/lib/search-console/types";
import type {
  AnalyticsMetrics,
  AnalyticsRealtime,
  AnalyticsReport,
  AnalyticsRow,
} from "./types";

export const ANALYTICS_PROPERTY = "563435056";
export const CONTACT_EVENTS = ["whatsapp_click", "demo_request_start"] as const;
const endpoint = `https://analyticsdata.googleapis.com/v1beta/properties/${ANALYTICS_PROPERTY}`;
type Report = {
  rows?: {
    dimensionValues?: { value?: string }[];
    metricValues?: { value?: string }[];
  }[];
  metricHeaders?: { name: string }[];
  metadata?: {
    timeZone?: string;
    subjectToThresholding?: boolean;
    dataLossFromOtherRow?: boolean;
    samplingMetadatas?: unknown[];
    emptyReason?: string;
    dataTruncationReasons?: unknown[];
  };
};
const invalid = () =>
  new SearchConsoleError(
    "بيانات Analytics غير مكتملة. حاول التحديث لاحقًا.",
    503,
    "google_unavailable",
  );

function number(value: unknown) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) throw invalid();
  const result = Number(value);
  if (!Number.isSafeInteger(result)) throw invalid();
  return result;
}
function rows(report: Report) {
  if (!report || (report.rows !== undefined && !Array.isArray(report.rows)))
    throw invalid();
  return report.rows || [];
}
function metric(
  report: Report,
  row: NonNullable<Report["rows"]>[number],
  name: string,
) {
  const index = report.metricHeaders?.findIndex((h) => h.name === name) ?? -1;
  if (index < 0) throw invalid();
  return number(row.metricValues?.[index]?.value);
}
function summary(report: Report): AnalyticsMetrics | null {
  const row = rows(report)[0];
  return row
    ? {
        users: metric(report, row, "activeUsers"),
        sessions: metric(report, row, "sessions"),
        views: metric(report, row, "screenPageViews"),
      }
    : null;
}
function table(report: Report, metricName: string): AnalyticsRow[] {
  return rows(report).map((row) => {
    const key = row.dimensionValues?.[0]?.value;
    if (typeof key !== "string" || key.length > 2048) throw invalid();
    return { key, value: metric(report, row, metricName) };
  });
}
function warnings(reports: Report[]) {
  const result = new Set<string>();
  for (const report of reports) {
    const meta = report.metadata;
    if (meta?.subjectToThresholding)
      result.add("قد تخضع بعض البيانات لحدود الخصوصية لدى Google.");
    if (meta?.dataLossFromOtherRow)
      result.add(
        "جمع Google بعض القيم في صف آخر؛ التفاصيل قد لا تشمل كل القيم.",
      );
    if (meta?.samplingMetadatas?.length)
      result.add("تتضمن الاستجابة بيانات مأخوذة بعينة.");
    if (meta?.dataTruncationReasons?.length)
      result.add("أبلغ Google عن اقتطاع بعض بيانات التقرير.");
    if (meta?.emptyReason)
      result.add(
        "أبلغ Google عن سبب لعدم توفر بعض البيانات؛ لا تعتبر الغياب صفرًا.",
      );
  }
  return [...result];
}
function countryFilter(country: SearchCountry) {
  return {
    filter: {
      fieldName: "countryId",
      stringFilter: {
        matchType: "EXACT",
        value: country === "sau" ? "SA" : "",
        caseSensitive: true,
      },
    },
  };
}
function publicFilter(country: SearchCountry) {
  return {
    andGroup: {
      expressions: [
        {
          filter: {
            fieldName: "hostName",
            stringFilter: { matchType: "EXACT", value: "www.narfid.com" },
          },
        },
        {
          filter: {
            fieldName: "pagePath",
            stringFilter: {
              matchType: "FULL_REGEXP",
              value:
                "^/(articles(/[-a-z0-9]+)?|solutions/[-a-z0-9]+|pricing|about|contact|technology-partnership|visual-identity|authors/nerved-team)?/?$",
            },
          },
        },
        ...(country === "sau" ? [countryFilter(country)] : []),
      ],
    },
  };
}
async function post(
  token: string,
  method: string,
  body: unknown,
  fetcher: typeof fetch,
) {
  return googleJson(
    `${endpoint}:${method}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
    fetcher,
  );
}

export async function verifyAnalyticsProperty(
  token: string,
  fetcher: typeof fetch = fetch,
) {
  // A successful request, even with no rows, verifies access to the exact property.
  await post(
    token,
    "runReport",
    {
      dateRanges: [{ startDate: "yesterday", endDate: "yesterday" }],
      metrics: [{ name: "activeUsers" }],
      limit: "1",
    },
    fetcher,
  );
}

export async function fetchAnalyticsReport(
  token: string,
  country: SearchCountry,
  now = new Date(),
  fetcher: typeof fetch = fetch,
): Promise<AnalyticsReport> {
  const range = [{ startDate: "28daysAgo", endDate: "yesterday" }];
  const metrics = ["activeUsers", "sessions", "screenPageViews"].map(
    (name) => ({ name }),
  );
  const base = {
    dateRanges: range,
    dimensionFilter: publicFilter(country),
    keepEmptyRows: false,
  };
  const detail = (dimension: string, measure: string, limit: string) => ({
    ...base,
    dimensions: [{ name: dimension }],
    metrics: [{ name: measure }],
    limit,
    orderBys: [{ metric: { metricName: measure }, desc: true }],
  });
  const data = await post(
    token,
    "batchRunReports",
    {
      requests: [
        { ...base, metrics },
        {
          ...base,
          dateRanges: [{ startDate: "56daysAgo", endDate: "29daysAgo" }],
          metrics,
        },
        detail("pagePath", "screenPageViews", "20"),
        detail("sessionDefaultChannelGroup", "sessions", "20"),
        {
          ...detail("eventName", "eventCount", "3"),
          dimensionFilter: {
            andGroup: {
              expressions: [
                publicFilter(country),
                {
                  filter: {
                    fieldName: "eventName",
                    inListFilter: { values: ["page_view", ...CONTACT_EVENTS] },
                  },
                },
              ],
            },
          },
        },
      ],
    },
    fetcher,
  );
  if (!Array.isArray(data.reports) || data.reports.length !== 5)
    throw invalid();
  const reports = data.reports as Report[];
  const timeZone = reports[0].metadata?.timeZone;
  if (!timeZone) throw invalid();
  let today: string;
  try {
    today = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);
  } catch {
    throw invalid();
  }
  const midnight = new Date(`${today}T00:00:00Z`).getTime();
  if (!Number.isFinite(midnight)) throw invalid();
  const date = (ago: number) =>
    new Date(midnight - ago * 86400000).toISOString().slice(0, 10);
  return {
    country,
    timeZone,
    currentPeriod: { startDate: date(28), endDate: date(1) },
    previousPeriod: { startDate: date(56), endDate: date(29) },
    current: summary(reports[0]),
    previous: summary(reports[1]),
    pages: table(reports[2], "screenPageViews"),
    channels: table(reports[3], "sessions"),
    events: table(reports[4], "eventCount"),
    warnings: warnings(reports),
    fetchedAt: now.toISOString(),
  };
}

export async function fetchAnalyticsRealtime(
  token: string,
  country: SearchCountry,
  fetcher: typeof fetch = fetch,
): Promise<AnalyticsRealtime> {
  const base =
    country === "sau" ? { dimensionFilter: countryFilter(country) } : {};
  // Realtime has a smaller schema: it cannot apply the historical pagePath filter.
  const [totals, events] = await Promise.all([
    post(
      token,
      "runRealtimeReport",
      { ...base, metrics: [{ name: "activeUsers" }] },
      fetcher,
    ),
    post(
      token,
      "runRealtimeReport",
      {
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: {
          andGroup: {
            expressions: [
              ...(country === "sau" ? [countryFilter(country)] : []),
              {
                filter: {
                  fieldName: "eventName",
                  inListFilter: { values: ["page_view", ...CONTACT_EVENTS] },
                },
              },
            ],
          },
        },
        limit: "3",
      },
      fetcher,
    ),
  ]);
  const first = rows(totals)[0];
  return {
    country,
    activeUsers: first ? metric(totals, first, "activeUsers") : null,
    events: table(events, "eventCount"),
    fetchedAt: new Date().toISOString(),
    warnings: warnings([totals, events]),
  };
}
