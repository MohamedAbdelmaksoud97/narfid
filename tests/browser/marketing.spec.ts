import { test, expect } from "@playwright/test";
import { mkdir, readFile } from "node:fs/promises";
import sharp from "sharp";
import {
  socialPlatforms,
  postsFor,
  postAsset,
} from "../../lib/marketing/social";

test("marketing strategy, platform guides, forty protected images and downloads work", async ({
  page,
  context,
  request,
}) => {
  test.setTimeout(180000);
  const base = process.env.AUTH_TEST_BASE_URL || "http://127.0.0.1:3012";
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const path of [
    "/board/marketing",
    "/board/marketing/social",
    "/board/marketing/social/snapchat",
  ]) {
    const response = await request.get(`${base}${path}`);
    expect(response.url()).toContain("/login");
  }
  for (const path of [
    postAsset(postsFor("snapchat")[0]),
    "/api/board/marketing/assets/all-posts.zip",
  ]) {
    const response = await request.get(`${base}${path}`);
    expect(response.status()).toBe(401);
    expect(response.headers()["cache-control"]).toContain("no-store");
  }
  const credentials = JSON.parse(
    await readFile(".private/board-accounts.json", "utf8"),
  );
  const account = credentials.accounts.find(
    (value: { status: string }) => value.status === "verified",
  );
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(`${base}/login`);
  await page.getByLabel("البريد الإلكتروني").fill(account.email);
  await page.getByLabel("كلمة المرور", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "تسجيل الدخول", exact: true }).click();
  await expect(page).toHaveURL(/\/board$/);
  const nav = page.getByRole("navigation", {
    name: "أقسام لوحة الإدارة",
    exact: true,
  });
  await nav.getByRole("link", { name: "التسويق", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "نرفد أقرب",
  );
  await expect(page.locator(".marketing-chapter")).toHaveCount(12);
  await page
    .locator("#measurement")
    .evaluate((element) =>
      element.scrollIntoView({ block: "start", behavior: "instant" }),
    );
  await expect(
    page.locator('.marketing-guide-index [aria-current="location"]'),
  ).toHaveAttribute("href", "#measurement");
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await mkdir(".private/marketing-qa", { recursive: true });
  await page.screenshot({
    path: ".private/marketing-qa/strategy-desktop.png",
    fullPage: false,
  });
  await page
    .getByRole("navigation", { name: "أقسام التسويق", exact: true })
    .getByRole("link", { name: "السوشيال ميديا", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "أربع منصات",
  );
  await expect(
    page.locator(
      ".marketing-social:visible .marketing-platform-grid > [data-slot=card]",
    ),
  ).toHaveCount(4);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  for (const platform of socialPlatforms) {
    await page.goto(`${base}/board/marketing/social/${platform.id}`);
    await expect(
      page.getByRole("heading", { name: platform.name, exact: true, level: 1 }),
    ).toBeVisible();
    await expect(page.locator(".social-post-card")).toHaveCount(10);
    await page
      .getByRole("button", { name: "التصور الكامل للفيديو", exact: true })
      .click();
    await expect(
      page.getByText(platform.videoDirection, { exact: false }),
    ).toBeVisible();
    await page.locator("#posts").scrollIntoViewIfNeeded();
    const first = postsFor(platform.id)[0];
    await page
      .getByRole("button", {
        name: `معاينة المنشور ${first.id}: ${first.headline.replaceAll("\n", " ")}`,
        exact: true,
      })
      .click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { level: 2 })).toBeInViewport();
    await expect(dialog.getByRole("img")).toBeVisible();
    await expect.poll(() => dialog.getByRole("img").evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
    await dialog
      .getByRole("button", { name: "نسخ النص المرافق", exact: true })
      .click();
    await expect
      .poll(async () =>
        (await page.evaluate(() => navigator.clipboard.readText())).replaceAll(
          "\r\n",
          "\n",
        ),
      )
      .toBe(first.caption);
    await dialog
      .getByRole("button", { name: "نسخ الوصف البديل", exact: true })
      .click();
    await expect
      .poll(async () =>
        (await page.evaluate(() => navigator.clipboard.readText())).replaceAll(
          "\r\n",
          "\n",
        ),
      )
      .toBe(first.alt);
    const downloadPromise = page.waitForEvent("download");
    await dialog
      .getByRole("link", { name: "تحميل الصورة", exact: true })
      .click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe(
      `narfid-${platform.id}-${first.id}-${first.theme}.png`,
    );
    expect(await download.failure()).toBeNull();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    const archive = await page.request.get(
      `${base}/api/board/marketing/assets/${platform.id}-posts.zip`,
    );
    expect(archive.status()).toBe(200);
    expect(archive.headers()["content-type"]).toBe("application/zip");
    for (const post of postsFor(platform.id)) {
      const response = await page.request.get(`${base}${postAsset(post)}`);
      expect(response.status()).toBe(200);
      expect(response.headers()["cache-control"]).toContain("no-store");
      expect(response.headers()["x-robots-tag"]).toContain("noindex");
      const png = await sharp(await response.body()).metadata();
      expect([png.width, png.height]).toEqual([
        platform.width,
        platform.height,
      ]);
    }
  }
  await page.goto(`${base}/board/marketing/social/instagram`);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true);
  await page.screenshot({
    path: ".private/marketing-qa/platform-mobile.png",
    fullPage: false,
  });
  await page.locator(".social-post-thumbnail").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect.poll(() => page.getByRole("dialog").getByRole("img").evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
  await expect(
    page.getByRole("dialog").getByRole("heading", { level: 2 }),
  ).toBeInViewport();
  await expect
    .poll(() =>
      page
        .getByRole("dialog")
        .evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
    )
    .toBe(true);
  await page.screenshot({
    path: ".private/marketing-qa/preview-mobile.png",
    fullPage: false,
  });
  await page.keyboard.press("Escape");
  const traversal = await page.request.get(
    `${base}/api/board/marketing/assets/instagram/not-allowed.png`,
  );
  expect(traversal.status()).toBe(404);
  const all = await page.request.get(
    `${base}/api/board/marketing/assets/all-posts.zip`,
  );
  expect(all.status()).toBe(200);
  expect(errors).toEqual([]);
});
