import { parseCountry, SearchConsoleError } from "@/lib/search-console/core";
import {
  searchBody,
  searchFailure,
  searchJson,
  searchSession,
} from "@/lib/search-console/server";
import { loadAnalytics, loadAnalyticsRealtime } from "@/lib/analytics/server";

export async function GET(request: Request) {
  try {
    await searchSession();
    const params = new URL(request.url).searchParams;
    const country = parseCountry(params.get("country"));
    if (params.get("view") === "realtime")
      return searchJson(await loadAnalyticsRealtime(country));
    if (params.has("view"))
      throw new SearchConsoleError("نوع التقرير غير صالح.");
    return searchJson(await loadAnalytics(country));
  } catch (error) {
    return searchFailure(error);
  }
}

export async function POST(request: Request) {
  try {
    await searchSession();
    const body = await searchBody(request);
    if (body.action !== "refresh")
      throw new SearchConsoleError("الطلب غير صالح.");
    return searchJson(await loadAnalytics(parseCountry(body.country), true));
  } catch (error) {
    return searchFailure(error);
  }
}
