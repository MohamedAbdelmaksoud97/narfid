import { test, expect, type Page } from "@playwright/test";
import { readFile, mkdir } from "node:fs/promises";
import { socialCategories } from "../../lib/marketing/categories";
import { postsFor } from "../../lib/marketing/social";
import type { Publication } from "../../lib/marketing/publications";

test("category tabs and shared publication tracking survive reloads and reject stale changes", async ({
  page,
  browser,
  request,
}) => {
  test.setTimeout(180000);
  const base = process.env.AUTH_TEST_BASE_URL || "http://127.0.0.1:3015";
  const endpoint = `${base}/api/board/marketing/publications`;
  expect((await request.get(`${endpoint}?platform=snapchat`)).status()).toBe(
    401,
  );
  expect((await request.patch(endpoint, { data: {} })).status()).toBe(401);
  const credentials = JSON.parse(
    await readFile(".private/board-accounts.json", "utf8"),
  );
  const accounts = credentials.accounts.filter(
    (value: { status: string }) => value.status === "verified",
  );
  async function login(
    target: Page,
    account: { email: string; password: string },
  ) {
    await target.goto(`${base}/login`);
    await target.getByLabel("البريد الإلكتروني").fill(account.email);
    await target
      .getByLabel("كلمة المرور", { exact: true })
      .fill(account.password);
    await target
      .getByRole("button", { name: "تسجيل الدخول", exact: true })
      .click();
    await expect(target).toHaveURL(/\/board$/);
  }
  await login(page, accounts[0]);
  const initialResponse = await page.request.get(
    `${endpoint}?platform=snapchat`,
  );
  expect(initialResponse.status()).toBe(200);
  expect(initialResponse.headers()["cache-control"]).toContain("no-store");
  const initial: Publication[] = (await initialResponse.json()).publications;
  expect(initial).toHaveLength(58);
  const post = initial.find(
    (row) => Number(row.post_id) >= 31 && !row.published,
  )!;
  expect(post).toBeTruthy();
  const originalOther = (
    await (await page.request.get(`${endpoint}?platform=instagram`)).json()
  ).publications.find((row: Publication) => row.post_id === post.post_id);
  const payload = {
    platform: "snapchat",
    post_id: post.post_id,
    published: true,
    revision: post.revision,
  };
  expect((await page.request.patch(endpoint, { data: payload })).status()).toBe(
    403,
  ); // Missing origin.
  const headers = { Origin: base };
  expect(
    (
      await page.request.patch(endpoint, {
        headers,
        data: { ...payload, post_id: "99" },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await page.request.patch(endpoint, {
        headers,
        data: { ...payload, published: "true" },
      })
    ).status(),
  ).toBe(400);

  const otherContext = await browser.newContext();
  const other = await otherContext.newPage();
  try {
    await page.goto(`${base}/board/marketing/social/snapchat`);
    await expect(
      page.getByRole("button", { name: "تحديث سجل النشر", exact: true }),
    ).toBeEnabled();
    await expect(page.locator(".social-post-card:visible")).toHaveCount(58);
    for (const category of socialCategories) {
      await page.getByRole("tab", { name: new RegExp(category.name) }).click();
      const count = postsFor("snapchat").filter(
        (row) => row.category === category.id,
      ).length;
      await expect(page.locator(".social-post-card:visible")).toHaveCount(
        count,
      );
      await expect(
        page.locator(
          `.social-post-card:visible:not([data-category="${category.id}"])`,
        ),
      ).toHaveCount(0);
    }
    await page.getByRole("tab", { name: /^الكل/ }).click();
    await page.locator(".social-category-tabs").scrollIntoViewIfNeeded();
    await mkdir(".private/marketing-qa", { recursive: true });
    await page.screenshot({ path: ".private/marketing-qa/categories-desktop.png" });
    const control = page
      .locator(`.social-post-card:visible[data-post-id="${post.post_id}"]`)
      .getByRole("switch");
    await expect(control).not.toBeChecked();
    await control.click();
    await expect(control).toBeChecked();
    await expect(
      page
        .getByRole("status")
        .filter({ hasText: `تم تسجيل نشر المنشور ${post.post_id}` }),
    ).toBeVisible();
    const saved: Publication = (
      await (await page.request.get(`${endpoint}?platform=snapchat`)).json()
    ).publications.find((row: Publication) => row.post_id === post.post_id);
    expect(saved.published).toBe(true);
    expect(saved.published_at).toBeTruthy();
    expect(saved.revision).toBe(post.revision + 1);
    await page.reload();
    await expect(control).toBeChecked();
    await page.getByRole("button", { name: "لم يُنشر", exact: true }).click();
    await expect(
      page.locator(`.social-post-card:visible[data-post-id="${post.post_id}"]`),
    ).toHaveCount(0);
    await page.getByRole("button", { name: "تم نشره", exact: true }).click();
    await expect(control).toBeChecked();

    await login(other, accounts[1]);
    const shared = (
      await (await other.request.get(`${endpoint}?platform=snapchat`)).json()
    ).publications.find((row: Publication) => row.post_id === post.post_id);
    expect(shared).toEqual(saved);
    const stale = await other.request.patch(endpoint, {
      headers,
      data: { ...payload, published: false },
    });
    expect(stale.status()).toBe(409);
    const otherPlatform = (
      await (await other.request.get(`${endpoint}?platform=instagram`)).json()
    ).publications.find((row: Publication) => row.post_id === post.post_id);
    expect(otherPlatform).toEqual(originalOther);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator(".social-category-tabs").scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    await mkdir(".private/marketing-qa", { recursive: true });
    await page.screenshot({
      path: ".private/marketing-qa/categories-mobile.png",
    });
    await page.getByRole("button", { name: "كل الحالات", exact: true }).click();
    await page.route(
      "**/api/board/marketing/publications?platform=*",
      (route) =>
        route.fulfill({
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({ error: "تعذر تحميل سجل النشر." }),
        }),
    );
    await page
      .getByRole("button", { name: "تحديث سجل النشر", exact: true })
      .click();
    await expect(
      page.getByRole("alert").filter({ hasText: "تعذر التحقق من حالة النشر" }),
    ).toBeVisible();
    await expect(control).toBeDisabled();
    await page.unroute("**/api/board/marketing/publications?platform=*");
    await page
      .getByRole("button", { name: "تحديث سجل النشر", exact: true })
      .click();
    await expect(control).toBeEnabled();
    await control.click();
    await expect(control).not.toBeChecked();
  } finally {
    // Never leave a QA post marked as externally published.
    const current: Publication = (
      await (await page.request.get(`${endpoint}?platform=snapchat`)).json()
    ).publications.find((row: Publication) => row.post_id === post.post_id);
    if (current.published !== post.published) {
      const reset = await page.request.patch(endpoint, {
        headers,
        data: {
          ...payload,
          published: post.published,
          revision: current.revision,
        },
      });
      expect(reset.status()).toBe(200);
    }
    await otherContext.close();
  }
});
