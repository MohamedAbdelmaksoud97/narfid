import "server-only";
import { ANALYTICS_SCOPE, SearchConsoleError } from "@/lib/search-console/core";
import { accessToken, loadConnection } from "@/lib/search-console/server";
import type { SearchCountry } from "@/lib/search-console/types";
import {
  ANALYTICS_PROPERTY,
  fetchAnalyticsRealtime,
  fetchAnalyticsReport,
} from "./google";
import type {
  AnalyticsDashboard,
  AnalyticsReport,
  AnalyticsRealtime,
} from "./types";

// Aggregate reports only, bounded to the current connection generation. Best-effort
// warm-instance cache; no credentials, database schema or background polling added.
const history = new Map<string, AnalyticsReport>();
const realtime = new Map<string, AnalyticsRealtime>();
const pending = new Map<string, Promise<AnalyticsReport | AnalyticsRealtime>>();
const historyFailures = new Map<string, { retryAt: number; message: string }>();

async function context(country: SearchCountry) {
  const connection = await loadConnection();
  return {
    connection,
    key: `${connection?.generation}:${ANALYTICS_PROPERTY}:${country}`,
    connected: Boolean(
      connection?.refresh_token &&
      connection.granted_scopes.includes(ANALYTICS_SCOPE),
    ),
  };
}

async function cached<T extends AnalyticsReport | AnalyticsRealtime>(
  map: Map<string, T>,
  key: string,
  ttl: number,
  fetchReport: () => Promise<T>,
): Promise<T> {
  const old = map.get(key);
  if (old && Date.now() - Date.parse(old.fetchedAt) < ttl) return old;
  const pendingKey = `${map === history ? "history" : "realtime"}:${key}`;
  if (pending.has(pendingKey)) return pending.get(pendingKey) as Promise<T>;
  const job = fetchReport()
    .then((result) => {
      if (map.size >= 8) map.clear();
      map.set(key, result);
      return result;
    })
    .finally(() => pending.delete(pendingKey));
  pending.set(pendingKey, job);
  return job;
}

export async function loadAnalytics(
  country: SearchCountry,
  force = false,
): Promise<AnalyticsDashboard> {
  const { connection, connected, key } = await context(country);
  const dashboard: AnalyticsDashboard = {
    configured: Boolean(connection),
    connected,
    propertyId: ANALYTICS_PROPERTY,
    report: null,
    error: null,
    reconnectRequired: false,
  };
  if (!connected || !connection) return dashboard;
  dashboard.report = history.get(key) || null;
  // Both countries share the property's Core quota. Realtime has its own quota.
  const failureKey = `${connection.generation}:${ANALYTICS_PROPERTY}`;
  const recentFailure = historyFailures.get(failureKey);
  const ttl = force ? 60000 : 300000;
  try {
    dashboard.report = await cached(
      history,
      key,
      ttl,
      async () => {
        if (recentFailure && recentFailure.retryAt > Date.now()) {
          throw new SearchConsoleError(recentFailure.message, 503, "analytics_backoff");
        }
        historyFailures.delete(failureKey);
        const report = await fetchAnalyticsReport(
          await accessToken(connection),
          country,
        );
        if ((await loadConnection())?.generation !== connection.generation)
          throw new SearchConsoleError(
            "تغيّر اتصال Google. حدّث الصفحة.",
            409,
            "connection_changed",
          );
        return report;
      },
    );
  } catch (error) {
    dashboard.error =
      error instanceof SearchConsoleError
        ? error.message
        : "تعذر تحديث تقارير Analytics.";
    dashboard.reconnectRequired =
      error instanceof SearchConsoleError &&
      error.code === "reconnect_required";
    if (error instanceof SearchConsoleError &&
        (error.code === "google_unavailable" || error.code === "google_quota")) {
      dashboard.error = error.code === "google_quota"
        ? "بلغت التقارير التاريخية حد طلبات Google مؤقتًا. حاول التحديث بعد دقيقة."
        : "تعذر تحميل التقرير التاريخي من Google. حاول التحديث بعد دقيقة.";
      if (historyFailures.size >= 8) historyFailures.clear();
      historyFailures.set(failureKey, {
        retryAt: Date.now() + 60000,
        message: dashboard.error,
      });
    }
  }
  return dashboard;
}

export async function loadAnalyticsRealtime(country: SearchCountry) {
  const { connection, connected, key } = await context(country);
  if (!connected || !connection)
    throw new SearchConsoleError(
      "أضف موافقة قراءة Analytics أولًا.",
      409,
      "not_connected",
    );
  return cached(realtime, key, 30000, async () => {
    const report = await fetchAnalyticsRealtime(
      await accessToken(connection),
      country,
    );
    if ((await loadConnection())?.generation !== connection.generation)
      throw new SearchConsoleError(
        "تغيّر اتصال Google. حدّث الصفحة.",
        409,
        "connection_changed",
      );
    return report;
  });
}
