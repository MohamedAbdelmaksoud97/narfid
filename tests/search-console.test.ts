import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  SEARCH_CALLBACK,
  SEARCH_SCOPE,
  SEARCH_SITE,
  SearchConsoleError,
  authorizationUrl,
  createOAuthState,
  parseCountry,
  seal,
  searchPeriods,
  unseal,
  validateInspectionUrl,
  validateOAuthState,
} from "../lib/search-console/core";
import {
  exchangeCode,
  fetchSearchReport,
  inspectUrl,
  refreshAccessToken,
  verifyProperty,
} from "../lib/search-console/google";

test("OAuth secrets are encrypted, tamper-resistant and bound to their purpose", () => {
  const key = "a-private-server-key-with-at-least-32-characters";
  const original = {
    clientSecret: "private-client-secret",
    refreshToken: "private-refresh-token",
  };
  const encrypted = seal(original, key, "credentials");
  assert.ok(
    !encrypted.includes(original.clientSecret) &&
      !encrypted.includes(original.refreshToken),
  );
  assert.deepEqual(unseal(encrypted, key, "credentials"), original);
  assert.notEqual(seal(original, key, "credentials"), encrypted);
  assert.throws(() =>
    unseal(
      encrypted,
      "another-private-key-with-at-least-32-characters",
      "credentials",
    ),
  );
  assert.throws(() => unseal(encrypted, key, "state"));
  const parts = encrypted.split(".");
  parts[2] = (parts[2][0] === "A" ? "B" : "A") + parts[2].slice(1);
  assert.throws(() => unseal(parts.join("."), key, "credentials"));
});

test("OAuth state prevents cross-user, expired, superseded and forged callbacks", () => {
  const state = createOAuthState("member-a", "generation-a", 1000000);
  assert.doesNotThrow(() =>
    validateOAuthState(state, state.nonce, "member-a", "generation-a", 1000100),
  );
  for (const [nonce, member, generation, now] of [
    ["bad", "member-a", "generation-a", 1000100],
    [state.nonce, "member-b", "generation-a", 1000100],
    [state.nonce, "member-a", "generation-b", 1000100],
    [state.nonce, "member-a", "generation-a", 1600001],
    [state.nonce, "member-a", "generation-a", 999999],
  ] as const)
    assert.throws(
      () => validateOAuthState(state, nonce, member, generation, now),
      (e) => e instanceof SearchConsoleError && e.code === "invalid_state",
    );
  const url = new URL(
    authorizationUrl("client.apps.googleusercontent.com", state),
  );
  assert.equal(url.origin, "https://accounts.google.com");
  assert.equal(url.searchParams.get("scope"), SEARCH_SCOPE);
  assert.equal(url.searchParams.get("redirect_uri"), SEARCH_CALLBACK);
  assert.equal(
    url.searchParams.get("code_challenge"),
    createHash("sha256").update(state.verifier).digest("base64url"),
  );
  assert.equal(url.searchParams.get("code_challenge_method"), "S256");
  assert.equal(url.searchParams.get("access_type"), "offline");
});

test("report periods are adjacent full 28-day windows in Pacific Time", () => {
  assert.deepEqual(searchPeriods(new Date("2026-11-09T12:00:00Z")), {
    current: { startDate: "2026-10-12", endDate: "2026-11-08" },
    previous: { startDate: "2026-09-14", endDate: "2026-10-11" },
  });
  assert.deepEqual(searchPeriods(new Date("2026-11-01T06:30:00Z")).current, {
    startDate: "2026-10-03",
    endDate: "2026-10-30",
  });
});

test("inspection is limited to public production pages and supported country filters", () => {
  for (const url of [
    SEARCH_SITE,
    `${SEARCH_SITE}articles/example`,
    `${SEARCH_SITE}solutions/memberships`,
    `${SEARCH_SITE}pricing`,
  ])
    assert.equal(validateInspectionUrl(url), url);
  for (const url of [
    "https://evil.example/",
    "https://narfid.com/",
    "http://www.narfid.com/",
    `${SEARCH_SITE}board`,
    `${SEARCH_SITE}api/board/seo/google`,
    `${SEARCH_SITE}login`,
    `${SEARCH_SITE}?x=1`,
    "https://user:password@www.narfid.com/",
    "javascript:alert(1)",
  ])
    assert.throws(() => validateInspectionUrl(url));
  assert.equal(parseCountry(null), "sau");
  assert.equal(parseCountry("all"), "all");
  assert.throws(() => parseCountry("invalid"));
});

test("performance totals are queried separately from top rows and use only final Saudi data", async () => {
  const bodies: Record<string, unknown>[] = [];
  const mock: typeof fetch = async (url, init) => {
    assert.equal(
      String(url),
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SEARCH_SITE)}/searchAnalytics/query`,
    );
    assert.equal(
      new Headers(init?.headers).get("authorization"),
      "Bearer access-token",
    );
    const body = JSON.parse(String(init?.body));
    bodies.push(body);
    let rows;
    const kind = body.dimensions[0];
    if (!kind) rows = [{ clicks: 5, impressions: 100, ctr: 0.05, position: 4 }];
    else if (kind === "date")
      rows = ["2026-11-06", "2026-11-05"].map((key) => ({
        keys: [key],
        clicks: 2,
        impressions: 10,
        ctr: 0.2,
        position: 3,
      }));
    else
      rows = [
        {
          keys: [
            kind === "page"
              ? `${SEARCH_SITE}pricing`
              : kind === "device"
                ? "MOBILE"
                : "نظام إدارة نادي",
          ],
          clicks: 1,
          impressions: 20,
          ctr: 0.05,
          position: 5,
        },
      ];
    return Response.json({ rows });
  };
  const report = await fetchSearchReport(
    "access-token",
    "sau",
    new Date("2026-11-09T12:00:00Z"),
    mock,
  );
  assert.equal(bodies.length, 6);
  assert.equal(report.current?.clicks, 5);
  assert.equal(report.queries[0].clicks, 1);
  assert.deepEqual(
    report.trend.map((row) => row.key),
    ["2026-11-05", "2026-11-06"],
  );
  assert.equal(report.lastDataDate, "2026-11-06");
  for (const body of bodies) {
    assert.equal(body.dataState, "final");
    assert.equal(body.type, "web");
    assert.deepEqual(body.dimensionFilterGroups, [
      {
        groupType: "and",
        filters: [
          { dimension: "country", operator: "equals", expression: "SAU" },
        ],
      },
    ]);
  }
});

test("missing Google data stays unknown while measured zero clicks remain zero", async () => {
  const empty: typeof fetch = async (_url, init) => {
    assert.equal(
      JSON.parse(String(init?.body)).dimensionFilterGroups,
      undefined,
    );
    return Response.json({});
  };
  const report = await fetchSearchReport(
    "access",
    "all",
    new Date("2026-11-09T12:00:00Z"),
    empty,
  );
  assert.equal(report.current, null);
  assert.equal(report.previous, null);
  assert.equal(report.lastDataDate, null);
  const zero: typeof fetch = async () =>
    Response.json({
      rows: [{ clicks: 0, impressions: 20, ctr: 0, position: 8 }],
    });
  assert.equal(
    (await fetchSearchReport("access", "all", new Date(), zero)).current
      ?.clicks,
    0,
  );
});

test("OAuth failures do not expose provider error details or secrets", async () => {
  const invalid: typeof fetch = async () =>
    Response.json(
      {
        error: "invalid_grant",
        error_description: "sensitive diagnostic detail",
      },
      { status: 400 },
    );
  await assert.rejects(
    () =>
      refreshAccessToken(
        { clientId: "client", clientSecret: "secret" },
        "refresh",
        invalid,
      ),
    (e) =>
      e instanceof SearchConsoleError &&
      e.code === "reconnect_required" &&
      !e.message.includes("sensitive"),
  );
  const missingRefresh: typeof fetch = async () =>
    Response.json({ access_token: "access", scope: SEARCH_SCOPE });
  await assert.rejects(() =>
    exchangeCode(
      { clientId: "client", clientSecret: "secret" },
      "code",
      "verifier",
      missingRefresh,
    ),
  );
  const accepted: typeof fetch = async (_url, init) => {
    const body = new URLSearchParams(String(init?.body));
    assert.equal(body.get("code_verifier"), "verifier");
    assert.equal(body.get("redirect_uri"), SEARCH_CALLBACK);
    return Response.json({
      access_token: "access",
      refresh_token: "refresh",
      scope: SEARCH_SCOPE,
    });
  };
  assert.equal(
    (
      await exchangeCode(
        { clientId: "client", clientSecret: "secret" },
        "code",
        "verifier",
        accepted,
      )
    ).refresh_token,
    "refresh",
  );
});

test("the selected Google account must have full access and inspection stays read-only", async () => {
  const owner: typeof fetch = async () =>
    Response.json({ permissionLevel: "siteOwner" });
  await verifyProperty("access", owner);
  const restricted: typeof fetch = async () =>
    Response.json({ permissionLevel: "siteRestrictedUser" });
  await assert.rejects(() => verifyProperty("access", restricted));
  const inspection: typeof fetch = async (url, init) => {
    assert.equal(
      String(url),
      "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
    );
    assert.deepEqual(JSON.parse(String(init?.body)), {
      inspectionUrl: SEARCH_SITE,
      siteUrl: SEARCH_SITE,
      languageCode: "ar",
    });
    return Response.json({
      inspectionResult: {
        inspectionResultLink: "https://evil.example/",
        indexStatusResult: {
          verdict: "PASS",
          coverageState: "مفهرس",
          googleCanonical: SEARCH_SITE,
        },
      },
    });
  };
  const result = await inspectUrl("access", SEARCH_SITE, inspection);
  assert.equal(result.verdict, "PASS");
  assert.equal(result.inspectionLink, null);
  assert.equal(result.googleCanonical, SEARCH_SITE);
});
