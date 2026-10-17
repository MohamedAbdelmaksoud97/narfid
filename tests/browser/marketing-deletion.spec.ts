import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { unzipSync } from "fflate";

test("board can delete and restore posts across reloads and downloads, with revision checks", async ({
  page,
  request,
}) => {
  test.setTimeout(180000);
  const base = process.env.AUTH_TEST_BASE_URL || "http://127.0.0.1:3015";
  const endpoint = `${base}/api/board/marketing/publications`;
  expect((await request.delete(endpoint, { data: {} })).status()).toBe(401);
  expect((await request.post(endpoint, { data: {} })).status()).toBe(401);
  const credentials = JSON.parse(
    await readFile(".private/board-accounts.json", "utf8"),
  );
  const account = credentials.accounts.find(
    (row: { status: string }) => row.status === "verified",
  );
  await page.goto(`${base}/login`);
  await page.getByLabel("البريد الإلكتروني").fill(account.email);
  await page.getByLabel("كلمة المرور", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "تسجيل الدخول", exact: true }).click();
  await expect(page).toHaveURL(/\/board$/);
  const rows = (
    await (await page.request.get(`${endpoint}?platform=facebook`)).json()
  ).publications;
  const original = rows.find(
    (row: { post_id: string }) => row.post_id === "51",
  );
  expect(rows).toHaveLength(58);
  expect(original.deleted).toBe(false);
  const payload = {
    platform: "facebook",
    post_id: "51",
    revision: original.revision,
  };
  expect(
    (await page.request.delete(endpoint, { data: payload })).status(),
  ).toBe(403);
  expect(
    (
      await page.request.delete(endpoint, {
        headers: { Origin: base },
        data: { ...payload, post_id: "9999" },
      })
    ).status(),
  ).toBe(400);
  try {
    await page.goto(`${base}/board/marketing/social/facebook`);
    const library = page.locator(".social-library");
    await expect(
      library.getByRole("button", { name: "تحديث سجل النشر", exact: true }),
    ).toBeEnabled();
    await library.getByRole("tab", { name: /^تطبيق الأعضاء/ }).click();
    await expect(library.locator(".social-post-card:visible")).toHaveCount(4);
    const card = library.locator('[data-post-id="51"]:visible');
    await card
      .getByRole("button", { name: "حذف المنشور 51", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "إلغاء", exact: true })
      .click();
    await expect(card).toBeVisible();
    await card
      .getByRole("button", { name: "حذف المنشور 51", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "تأكيد الحذف", exact: true })
      .click();
    await expect(card).toHaveCount(0);
    expect(
      (
        await page.request.delete(endpoint, {
          headers: { Origin: base },
          data: payload,
        })
      ).status(),
    ).toBe(409);
    const archive = await page.request.get(
      `${base}/api/board/marketing/assets/facebook-posts.zip`,
    );
    expect(archive.status()).toBe(200);
    const files = Object.keys(unzipSync(new Uint8Array(await archive.body())));
    expect(files.some((name) => name.includes("51-member-app"))).toBe(false);
    expect(files.some((name) => name.includes("52-app-renewals"))).toBe(true);
    await page.reload();
    await expect(
      library.getByRole("button", { name: "تحديث سجل النشر", exact: true }),
    ).toBeEnabled();
    await expect(library.locator('[data-post-id="51"]:visible')).toHaveCount(0);
    await library
      .getByRole("button", { name: "المحذوفات", exact: true })
      .click();
    const deleted = library.locator('[data-post-id="51"]:visible');
    await expect(deleted).toBeVisible();
    await deleted.getByRole("button", { name: "استعادة المنشور" }).click();
    await expect(deleted).toHaveCount(0);
    await library
      .getByRole("button", { name: "كل الحالات", exact: true })
      .click();
    await library.getByRole("tab", { name: /^تطبيق الأعضاء/ }).click();
    await expect(library.locator('[data-post-id="51"]:visible')).toBeVisible();
    await page.setViewportSize({ width: 390, height: 844 });
    await library.locator(".social-category-tabs").scrollIntoViewIfNeeded();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: "test-results/marketing-services-mobile.png",
    });
  } finally {
    const current = (
      await (await page.request.get(`${endpoint}?platform=facebook`)).json()
    ).publications.find((row: { post_id: string }) => row.post_id === "51");
    if (current.deleted)
      expect(
        (
          await page.request.post(endpoint, {
            headers: { Origin: base },
            data: { ...payload, revision: current.revision },
          })
        ).status(),
      ).toBe(200);
  }
});
