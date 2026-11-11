import { test, expect } from "@playwright/test";
import { mkdir, readFile } from "node:fs/promises";
import { videoBriefs } from "../../lib/marketing/video-briefs";
import type { VideoLibraryState } from "../../lib/marketing/video-plan";

test("fifty briefs, protected state, independent publication and production work on desktop and mobile", async ({
  page,
  context,
  request,
}) => {
  test.setTimeout(180000);
  const base = process.env.AUTH_TEST_BASE_URL || "http://127.0.0.1:3022";
  const endpoint = `${base}/api/board/marketing/videos`,
    headers = { Origin: base };
  expect((await request.get(endpoint)).status()).toBe(401);
  expect((await request.patch(endpoint, { data: {} })).status()).toBe(401);
  expect((await request.get(`${endpoint}/NV-001/asset`)).status()).toBe(401);
  const credentials = await readFile(".private/board-accounts.md", "utf8");
  const password = credentials.match(
    /chairman@nerfed\.example\s*\|\s*`([^`]+)`/,
  )?.[1];
  if (!password) throw new Error("Chairman password is missing locally.");
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${base}/login`);
  await page.getByLabel("البريد الإلكتروني").fill("chairman@nerfed.example");
  await page.getByLabel("كلمة المرور", { exact: true }).fill(password);
  await page.getByRole("button", { name: "تسجيل الدخول", exact: true }).click();
  await expect(page).toHaveURL(/\/board$/);
  await page.goto(`${base}/board/marketing`);
  await page
    .getByRole("link", { name: "افتح قسم الفيديو", exact: false })
    .click();
  await expect(page).toHaveURL(/\/board\/marketing\/videos$/);
  await expect(page.locator(".video-card:visible")).toHaveCount(50);
  const getState = async () => {
    const response = await page.request.get(endpoint);
    expect(response.status()).toBe(200);
    return (await response.json()) as VideoLibraryState;
  };
  const initial = await getState(),
    original = initial.productions.find((row) => row.video_id === "NV-001")!,
    pub = initial.publications.find(
      (row) => row.video_id === "NV-001" && row.platform === "instagram",
    )!;
  expect(initial.productions).toHaveLength(50);
  expect(initial.publications).toHaveLength(250);
  expect(initial.productions.every((row) => !("updated_by" in row))).toBe(true);
  await expect(
    page.locator('.video-card[data-video-id="NV-001"] [role="switch"]'),
  ).toBeEnabled();
  const identity = {
    kind: "publication",
    video_id: pub.video_id,
    platform: pub.platform,
    published: !pub.published,
    revision: pub.revision,
  };
  expect(
    (await page.request.patch(endpoint, { data: identity })).status(),
  ).toBe(403);
  expect(
    (
      await page.request.patch(endpoint, {
        headers,
        data: { ...identity, video_id: "NV-051" },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await page.request.patch(endpoint, {
        headers,
        data: {
          kind: "production",
          video_id: pub.video_id,
          status: "ready",
          revision: original.revision,
        },
      })
    ).status(),
  ).toBe(400);
  expect((await page.request.get(`${endpoint}/NV-001/asset`)).status()).toBe(
    404,
  );
  try {
    await page
      .getByLabel("نوع المحتوى", { exact: true })
      .selectOption("product");
    await expect(page.locator(".video-card:visible")).toHaveCount(15);
    await page.getByLabel("نوع المحتوى", { exact: true }).selectOption("all");
    await page.getByLabel("ابحث في الأفكار").fill("NV-001");
    await expect(page.locator(".video-card:visible")).toHaveCount(1);
    const toggle = page.locator(
      '.video-card[data-video-id="NV-001"] [role="switch"]',
    );
    await toggle.click();
    await expect(toggle).toHaveAttribute(
      "aria-checked",
      String(!pub.published),
    );
    await page.reload();
    await expect(toggle).toHaveAttribute(
      "aria-checked",
      String(!pub.published),
    );
    const changed = await getState();
    expect(
      changed.publications.find(
        (row) => row.video_id === pub.video_id && row.platform === "x",
      ),
    ).toEqual(
      initial.publications.find(
        (row) => row.video_id === pub.video_id && row.platform === "x",
      ),
    );
    expect(
      (
        await page.request.patch(endpoint, { headers, data: identity })
      ).status(),
    ).toBe(409);
    await page.getByLabel("ابحث في الأفكار").fill("NV-001");
    await page
      .getByRole("button", { name: "السيناريو والنصوص", exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator(".video-scenes > li")).toHaveCount(
      videoBriefs[0].scenes.length,
    );
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await dialog
      .getByRole("button", { name: "نسخ السيناريو كاملًا", exact: true })
      .click();
    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toContain(videoBriefs[0].caption);
    await dialog
      .getByLabel("حالة إنتاج NV-001", { exact: true })
      .selectOption("producing");
    await expect(
      dialog.getByText("حُفظت حالة الفيديو.", { exact: true }),
    ).toBeVisible();
    await expect
      .poll(
        async () =>
          (await getState()).productions.find(
            (row) => row.video_id === "NV-001",
          )?.status,
      )
      .toBe("producing");
    await dialog
      .getByLabel("حالة إنتاج NV-001", { exact: true })
      .selectOption("planned");
    await expect
      .poll(
        async () =>
          (await getState()).productions.find(
            (row) => row.video_id === "NV-001",
          )?.status,
      )
      .toBe("planned");
    await mkdir(".private/marketing-video-qa", { recursive: true });
    await page.screenshot({
      path: ".private/marketing-video-qa/scenario-desktop.png",
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await expect
      .poll(() =>
        dialog.evaluate(
          (element) => element.scrollWidth <= element.clientWidth + 1,
        ),
      )
      .toBe(true);
    await page.screenshot({
      path: ".private/marketing-video-qa/scenario-mobile.png",
    });
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await page.getByLabel("ابحث في الأفكار").fill("");
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      )
      .toBe(true);
    await page.screenshot({
      path: ".private/marketing-video-qa/library-mobile.png",
    });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.screenshot({
      path: ".private/marketing-video-qa/library-desktop.png",
    });
    await page.route("**/api/board/marketing/videos", (route) =>
      route.request().method() === "GET"
        ? route.fulfill({
            status: 503,
            json: { error: "اختبار تعذر تحميل السجل" },
          })
        : route.continue(),
    );
    await page
      .getByRole("button", { name: "تحديث سجل الفيديو", exact: true })
      .click();
    await expect(
      page.getByText("تعذر التحقق من الحالات", { exact: true }),
    ).toBeVisible();
    await expect(
      page.locator('.video-card[data-video-id="NV-001"] [role="switch"]'),
    ).toBeDisabled();
    await page.unroute("**/api/board/marketing/videos");
    await page
      .getByRole("button", { name: "تحديث سجل الفيديو", exact: true })
      .click();
    await expect(
      page.locator('.video-card[data-video-id="NV-001"] [role="switch"]'),
    ).toBeEnabled();
    expect(errors).toEqual([]);
  } finally {
    await page.unroute("**/api/board/marketing/videos");
    const current = await getState(),
      currentPub = current.publications.find(
        (row) => row.video_id === pub.video_id && row.platform === pub.platform,
      )!;
    if (currentPub.published !== pub.published)
      expect(
        (
          await page.request.patch(endpoint, {
            headers,
            data: {
              ...identity,
              published: pub.published,
              revision: currentPub.revision,
            },
          })
        ).status(),
      ).toBe(200);
    const production = current.productions.find(
      (row) => row.video_id === original.video_id,
    )!;
    if (production.status !== original.status)
      expect(
        (
          await page.request.patch(endpoint, {
            headers,
            data: {
              kind: "production",
              video_id: original.video_id,
              status: original.status,
              revision: production.revision,
            },
          })
        ).status(),
      ).toBe(200);
  }
});
