import test from "node:test";
import assert from "node:assert/strict";
import {
  ANALYTICS_SCOPE,
  SEARCH_SCOPE,
  authorizationUrl,
  createOAuthState,
  SearchConsoleError,
} from "../lib/search-console/core";
import { exchangeCode } from "../lib/search-console/google";
import {
  ANALYTICS_PROPERTY,
  fetchAnalyticsRealtime,
  fetchAnalyticsReport,
  verifyAnalyticsProperty,
} from "../lib/analytics/google";

const headers = (names: string[]) => names.map((name) => ({ name }));
const row = (values: string[], key?: string) => ({
  metricValues: values.map((value) => ({ value })),
  ...(key ? { dimensionValues: [{ value: key }] } : {}),
});
function reports() {
  return [
    {
      metricHeaders: headers(["activeUsers", "sessions", "screenPageViews"]),
      rows: [row(["2", "3", "5"])],
      metadata: { timeZone: "Asia/Riyadh" },
    },
    {
      metricHeaders: headers(["activeUsers", "sessions", "screenPageViews"]),
      rows: [row(["0", "0", "0"])],
    },
    {
      metricHeaders: headers(["screenPageViews"]),
      rows: [row(["5"], "/pricing")],
    },
    {
      metricHeaders: headers(["sessions"]),
      rows: [row(["3"], "Organic Search")],
    },
    {
      metricHeaders: headers(["eventCount"]),
      rows: [row(["1"], "whatsapp_click")],
      metadata: { subjectToThresholding: true },
    },
  ];
}
test("Analytics opt-in keeps GSC scope and rejects partial or omitted grants", async () => {
  const state = { ...createOAuthState("a", "b"), analytics: true };
  assert.equal(
    new URL(authorizationUrl("client", state)).searchParams.get("scope"),
    `${SEARCH_SCOPE} ${ANALYTICS_SCOPE}`,
  );
  for (const scope of [undefined, SEARCH_SCOPE, ANALYTICS_SCOPE]) {
    const mock: typeof fetch = async () =>
      Response.json({
        access_token: "access",
        refresh_token: "refresh",
        scope,
      });
    await assert.rejects(() =>
      exchangeCode(
        { clientId: "client", clientSecret: "secret" },
        "code",
        "verifier",
        mock,
        true,
      ),
    );
  }
  const mock: typeof fetch = async () =>
    Response.json({
      access_token: "access",
      refresh_token: "refresh",
      scope: `${SEARCH_SCOPE} ${ANALYTICS_SCOPE}`,
    });
  assert.equal(
    (
      await exchangeCode(
        { clientId: "client", clientSecret: "secret" },
        "code",
        "verifier",
        mock,
        true,
      )
    ).refresh_token,
    "refresh",
  );
});

test("GA4 reports preserve totals, property timezone, missing events and provider warnings", async () => {
  const mock: typeof fetch = async (url, init) => {
    assert.equal(
      String(url),
      `https://analyticsdata.googleapis.com/v1beta/properties/${ANALYTICS_PROPERTY}:batchRunReports`,
    );
    const body = JSON.parse(String(init?.body));
    assert.equal(body.requests.length, 5);
    for (const request of body.requests) {
      const filter = JSON.stringify(request.dimensionFilter);
      assert.ok(
        filter.includes("www.narfid.com") &&
          filter.includes("pagePath") &&
          filter.includes('"SA"'),
      );
    }
    return Response.json({ reports: reports() });
  };
  const data = await fetchAnalyticsReport(
    "access",
    "sau",
    new Date("2026-11-09T22:30:00Z"),
    mock,
  );
  assert.equal(data.current?.users, 2);
  assert.equal(data.previous?.views, 0);
  assert.deepEqual(data.currentPeriod, {
    startDate: "2026-10-13",
    endDate: "2026-11-09",
  });
  assert.equal(data.events.length, 1);
  assert.equal(
    data.events.some((e) => e.key === "demo_request_start"),
    false,
  );
  assert.equal(data.warnings.length, 1);
});

test("empty and malformed Analytics responses cannot manufacture measured zero", async () => {
  const empty: typeof fetch = async () =>
    Response.json({ reports: reports().map((r) => ({ ...r, rows: [] })) });
  assert.equal(
    (await fetchAnalyticsReport("access", "all", new Date(), empty)).current,
    null,
  );
  for (const malformed of [
    { reports: [] },
    {
      reports: reports().map((r) => ({ ...r, rows: [row(["NaN", "1", "1"])] })),
    },
  ]) {
    const mock: typeof fetch = async () => Response.json(malformed);
    await assert.rejects(() =>
      fetchAnalyticsReport("access", "all", new Date(), mock),
    );
  }
});

test("Realtime returns aggregate users without summing users across event names", async () => {
  const mock: typeof fetch = async (_url, init) => {
    const body = JSON.parse(String(init?.body));
    assert.equal(JSON.stringify(body).includes("pagePath"), false);
    return Response.json(
      body.dimensions
        ? {
            metricHeaders: headers(["eventCount"]),
            rows: [
              row(["2"], "whatsapp_click"),
              row(["1"], "demo_request_start"),
            ],
          }
        : { metricHeaders: headers(["activeUsers"]), rows: [row(["1"])] },
    );
  };
  const result = await fetchAnalyticsRealtime("access", "all", mock);
  assert.equal(result.activeUsers, 1);
  assert.equal(result.events.length, 2);
  const forbidden: typeof fetch = async () =>
    Response.json(
      { error: { status: "PERMISSION_DENIED", message: "sensitive" } },
      { status: 403 },
    );
  await assert.rejects(
    () => verifyAnalyticsProperty("access", forbidden),
    (e) =>
      e instanceof SearchConsoleError &&
      e.code === "google_forbidden" &&
      !e.message.includes("sensitive"),
  );
});
