import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import type {
  SearchDashboard,
  SearchReport,
} from "../../lib/search-console/types";

async function login(page: Page) {
  const file = JSON.parse(
    await readFile(".private/board-accounts.json", "utf8"),
  );
  const account = file.accounts.find(
    (a: { status: string }) => a.status === "verified",
  );
  await page.goto("/login");
  await page.getByLabel("البريد الإلكتروني").fill(account.email);
  await page.getByLabel("كلمة المرور", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "تسجيل الدخول", exact: true }).click();
  await expect(page).toHaveURL(/\/board$/);
  return account;
}

test("Google endpoints authorize live board members, protect secrets and reject forged OAuth callbacks", async ({
  page,
  request,
}) => {
  const endpoint = "/api/board/seo/google";
  expect((await request.get(endpoint)).status()).toBe(401);
  expect(
    (await request.post(`${endpoint}/connect`, { data: {} })).status(),
  ).toBe(401);
  const account = await login(page);
  const status = await page.request.get(endpoint);
  expect(status.ok()).toBe(true);
  expect(status.headers()["cache-control"]).toContain("no-store");
  expect(status.headers()["x-robots-tag"]).toContain("noindex");
  const data = await status.json();
  expect(data.configured).toBe(true);
  const oauth = JSON.parse(
    await readFile(".private/google-search-console-oauth.json", "utf8"),
  ).web;
  expect((await status.text()).includes(oauth.client_secret)).toBe(false);
  const base = new URL(page.url()).origin;
  expect(
    (
      await page.request.post(endpoint, {
        data: { action: "disconnect" },
        headers: { Origin: "https://other.example" },
      })
    ).status(),
  ).toBe(403);
  expect((await page.request.get(`${endpoint}?country=invalid`)).status()).toBe(
    400,
  );
  expect(
    (
      await page.request.post(endpoint, {
        data: { action: "inspect", url: "https://evil.example/" },
        headers: { Origin: base },
      })
    ).status(),
  ).toBe(400);
  const anon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  for (const table of ["seo_google_connections", "seo_google_reports"]) {
    const result = await anon.from(table).select("site_url");
    expect(Boolean(result.error) || result.data?.length === 0).toBe(true);
  }
  await anon.auth.signInWithPassword({
    email: account.email,
    password: account.password,
  });
  for (const table of ["seo_google_connections", "seo_google_reports"]) {
    const result = await anon.from(table).select("site_url");
    expect(Boolean(result.error) || result.data?.length === 0).toBe(true);
  }
  // A start only creates a local state cookie; it does not navigate to Google or authorize access.
  const connect = await page.request.post(`${endpoint}/connect`, {
    data: {},
    headers: { Origin: base },
  });
  expect(connect.ok()).toBe(true);
  const authUrl = new URL((await connect.json()).url);
  expect(authUrl.origin).toBe("https://accounts.google.com");
  expect(authUrl.searchParams.get("scope")).toBe(
    "https://www.googleapis.com/auth/webmasters.readonly",
  );
  expect(authUrl.searchParams.get("redirect_uri")).toBe(
    "https://www.narfid.com/api/board/seo/google/callback",
  );
  expect(
    (connect.headers()["set-cookie"] || "").includes(oauth.client_secret),
  ).toBe(false);
  expect(connect.headers()["set-cookie"]).toContain("HttpOnly");
  const forged = await page.request.get(
    `${endpoint}/callback?code=not-real&state=invalid`,
    { maxRedirects: 0 },
  );
  expect(forged.status()).toBe(303);
  expect(new URL(forged.headers().location).searchParams.get("google")).toBe(
    "invalid_state",
  );
  const second = await page.request.post(`${endpoint}/connect`, {
    data: {},
    headers: { Origin: base },
  });
  const nonce = new URL((await second.json()).url).searchParams.get("state");
  const denied = await page.request.get(
    `${endpoint}/callback?error=access_denied&state=${nonce}`,
    { maxRedirects: 0 },
  );
  expect(denied.status()).toBe(303);
  expect(new URL(denied.headers().location).searchParams.get("google")).toBe(
    "google_denied",
  );
  const after = await (await page.request.get(endpoint)).json();
  expect(after.connected).toBe(data.connected);
  await page.goto("/board/seo");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.locator("#seo-google")).toContainText(
    "تقارير Google Search Console",
  );
  expect((await page.content()).includes(oauth.client_secret)).toBe(false);
});

function fixture(country: "sau" | "all", empty = false): SearchDashboard {
  const metric = {
    clicks: country === "sau" ? 0 : 7,
    impressions: 20,
    ctr: country === "sau" ? 0 : 0.35,
    position: 8,
  };
  const row = {
    ...metric,
    key: "نظام إدارة المؤسسات الرياضية وحجوزات الملاعب",
  };
  const report: SearchReport = {
    country,
    currentPeriod: { startDate: "2026-10-12", endDate: "2026-11-08" },
    previousPeriod: { startDate: "2026-09-14", endDate: "2026-10-11" },
    current: empty ? null : metric,
    previous: null,
    queries: empty ? [] : [row],
    pages: empty
      ? []
      : [
          {
            ...metric,
            key: "https://www.narfid.com/articles/club-employee-access-offboarding",
          },
        ],
    devices: empty ? [] : [{ ...metric, key: "MOBILE" }],
    trend: empty ? [] : [{ ...metric, key: "2026-11-06" }],
    fetchedAt: "2026-11-09T12:00:00Z",
    lastDataDate: empty ? null : "2026-11-06",
  };
  return {
    configured: true,
    connected: true,
    siteUrl: "https://www.narfid.com/",
    connectedAt: "2026-11-09T11:00:00Z",
    report,
    error: null,
    reconnectRequired: false,
  };
}

test("Google report UI handles measured zero, country filters, inspection and mobile layouts", async ({
  page,
}) => {
  await login(page);
  let empty = false;
  await page.route("**/api/board/seo/google**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (request.method() === "POST") {
      const body = request.postDataJSON();
      if (body.action === "inspect")
        return route.fulfill({
          json: {
            inspection: {
              url: body.url,
              verdict: "PASS",
              coverage: "تمت فهرسة الصفحة",
              indexingState: "INDEXING_ALLOWED",
              robotsState: "ALLOWED",
              lastCrawlTime: "2026-11-08T10:00:00Z",
              googleCanonical: body.url,
              userCanonical: body.url,
              inspectionLink: null,
              inspectedAt: "2026-11-09T12:00:00Z",
            },
          },
        });
      return route.fulfill({ json: fixture(body.country || "sau", empty) });
    }
    return route.fulfill({
      json: fixture(
        url.searchParams.get("country") === "all" ? "all" : "sau",
        empty,
      ),
    });
  });
  await page.goto("/board/seo");
  const panel = page.locator("#seo-google");
  await expect(panel).toContainText("حساب مرتبط");
  const clicks = panel
    .locator('[data-slot="card"]')
    .filter({ has: page.getByText("النقرات من البحث", { exact: true }) });
  await expect(clicks.locator('[data-slot="card-title"]')).toHaveText("٠");
  await panel.getByRole("button", { name: "كل البلدان", exact: true }).click();
  await expect(clicks.locator('[data-slot="card-title"]')).toHaveText("٧");
  await panel.getByRole("tab", { name: "الصفحات", exact: true }).click();
  await expect(
    panel.getByRole("link", {
      name: "articles/club-employee-access-offboarding",
    }),
  ).toBeVisible();
  await panel.getByRole("button", { name: "فحص الرابط", exact: true }).click();
  await expect(panel).toContainText("تمت فهرسة الصفحة");
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await panel.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        ),
      )
      .toBe(true);
    await page.screenshot({ path: `test-results/google-report-${width}.png` });
  }
  empty = true;
  await panel
    .getByRole("button", { name: "تحديث التقرير", exact: true })
    .click();
  await expect(panel).toContainText("ننتظر بيانات البحث من Google");
  await expect(clicks.locator('[data-slot="card-title"]')).toHaveText("—");
  // Unrecognized callback parameters must never become React elements or messages.
  await page.goto("/board/seo?google=__proto__");
  await expect(panel).toContainText("تقارير Google Search Console");
});
