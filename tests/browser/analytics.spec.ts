import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import type { AnalyticsDashboard } from "../../lib/analytics/types";

async function login(page: Page) {
  const file = JSON.parse(
    await readFile(".private/board-accounts.json", "utf8"),
  );
  const a = file.accounts.find(
    (x: { email: string }) => x.email === "chairman@nerfed.example",
  );
  await page.goto("/login");
  await page.getByLabel("البريد الإلكتروني").fill(a.email);
  await page.getByLabel("كلمة المرور", { exact: true }).fill(a.password);
  await page.getByRole("button", { name: "تسجيل الدخول", exact: true }).click();
  await expect(page).toHaveURL(/\/board$/);
}

test("Analytics endpoints require live membership, CSRF and explicit combined consent", async ({
  page,
  request,
}) => {
  expect((await request.get("/api/board/seo/analytics")).status()).toBe(401);
  expect(
    (await request.get("/api/board/seo/analytics?view=realtime")).status(),
  ).toBe(401);
  await login(page);
  expect(
    (
      await page.request.get("/api/board/seo/analytics?country=invalid")
    ).status(),
  ).toBe(400);
  const denied = await page.request.post("/api/board/seo/analytics", {
    data: { action: "refresh" },
    headers: { Origin: "https://other.example" },
  });
  expect(denied.status()).toBe(403);
  const status = await page.request.get("/api/board/seo/analytics");
  expect(status.ok()).toBe(true);
  expect(status.headers()["x-robots-tag"]).toContain("noindex");
  expect(status.headers()["cache-control"]).toContain("no-store");
  const json = await status.json();
  expect(json.propertyId).toBe("563435056");
  expect(json).not.toHaveProperty("refresh_token");
  const start = await page.request.post("/api/board/seo/google/connect", {
    data: { analytics: true },
    headers: { Origin: new URL(page.url()).origin },
  });
  expect(start.ok()).toBe(true);
  const url = new URL((await start.json()).url);
  expect(url.searchParams.get("scope")?.split(" ")).toEqual([
    "https://www.googleapis.com/auth/webmasters.readonly",
    "https://www.googleapis.com/auth/analytics.readonly",
  ]);
  // Deliberately reject a forged callback: it must not replace the working GSC token.
  const callback = await page.request.get(
    "/api/board/seo/google/callback?state=forged&code=forged",
    { maxRedirects: 0 },
  );
  expect(callback.headers().location).toContain("invalid_state");
  const after = await (
    await page.request.get("/api/board/seo/analytics")
  ).json();
  expect(after.connected).toBe(json.connected);
});

test("Analytics UI separates missing data, measured zero, realtime and country/history on mobile", async ({
  page,
}) => {
  await login(page);
  let empty = false;
  await page.route("**/api/board/seo/analytics**", async (route) => {
    const url = new URL(route.request().url());
    if (url.searchParams.get("view") === "realtime")
      return route.fulfill({
        json: {
          activeUsers: 1,
          country: "all",
          events: [{ key: "whatsapp_click", value: 1 }],
          fetchedAt: "2026-11-10T01:00:00Z",
          warnings: [],
        },
      });
    const country = url.searchParams.get("country") || "all";
    const data: AnalyticsDashboard = {
      configured: true,
      connected: true,
      propertyId: "563435056",
      error: null,
      reconnectRequired: false,
      report: {
        country: country === "sau" ? "sau" : "all",
        currentPeriod: { startDate: "2026-10-13", endDate: "2026-11-09" },
        previousPeriod: { startDate: "2026-09-15", endDate: "2026-10-12" },
        timeZone: "Asia/Riyadh",
        current: empty ? null : { users: 0, sessions: 0, views: 0 },
        previous: null,
        pages: [],
        channels: [],
        events: [],
        warnings: [],
        fetchedAt: "2026-11-10T01:00:00Z",
      },
    };
    await route.fulfill({ json: data });
  });
  await page.goto("/board/seo?tab=analytics");
  const panel = page.locator("#seo-analytics");
  await expect(panel).toContainText("Analytics مرتبط");
  const users = panel
    .locator('[data-slot="card"]')
    .filter({ has: page.getByText("المستخدمون النشطون", { exact: true }) });
  await expect(users.locator('[data-slot="card-title"]')).toHaveText("٠");
  await expect(
    panel.getByText("غير مرصود في الاستجابة", { exact: true }),
  ).toHaveCount(2);
  await panel
    .getByRole("button", { name: "فحص أحداث آخر 30 دقيقة", exact: true })
    .click();
  await expect(
    panel.getByText("غير مرصود في الاستجابة", { exact: true }),
  ).toHaveCount(3);
  await panel.getByRole("button", { name: "السعودية", exact: true }).click();
  await expect(
    panel.getByText("غير مرصود في الاستجابة", { exact: true }),
  ).toHaveCount(2);
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        ),
      )
      .toBe(true);
    await panel.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/analytics-${width}.png` });
  }
  empty = true;
  await panel
    .getByRole("button", { name: "تحديث Analytics", exact: true })
    .click();
  await expect(users.locator('[data-slot="card-title"]')).toHaveText("—");
  await page.getByRole("tab", { name: "الدليل والخطة", exact: true }).click();
  await expect(panel).toBeHidden();
  await page.goBack();
  await expect(panel).toBeVisible();
});
