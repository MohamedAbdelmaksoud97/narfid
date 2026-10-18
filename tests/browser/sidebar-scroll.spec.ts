import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

test.use({ launchOptions: { ignoreDefaultArgs: ["--hide-scrollbars"] } });

test("board sidebar exposes vertical scrolling and keeps separators inside its width on desktop and mobile", async ({
  page,
}) => {
  const credentials = JSON.parse(
    await readFile(".private/board-accounts.json", "utf8"),
  );
  const member = credentials.accounts.find(
    (row: { status: string }) => row.status === "verified",
  );
  await page.goto("/login");
  await page.getByLabel("البريد الإلكتروني").fill(member.email);
  await page.getByLabel("كلمة المرور", { exact: true }).fill(member.password);
  await page.getByRole("button", { name: "تسجيل الدخول", exact: true }).click();
  await expect(page).toHaveURL(/\/board$/);
  await page.goto("/board/marketing/social");
  for (const viewport of [
    { width: 1366, height: 768 },
    { width: 1024, height: 600 },
  ]) {
    await page.setViewportSize(viewport);
    const sidebar = page.locator('[data-slot="sidebar-container"]');
    const scroll = sidebar.locator(".board-sidebar-scroll");
    await expect(scroll).toBeVisible();
    const sizes = await scroll.evaluate((element) => ({
      client: element.clientHeight,
      scroll: element.scrollHeight,
      scrollbar: getComputedStyle(element).scrollbarWidth,
      overflow: getComputedStyle(element).overflowY,
      thumb: getComputedStyle(element, "::-webkit-scrollbar").display,
      horizontal: element.scrollWidth <= element.clientWidth,
    }));
    expect(sizes.scroll).toBeGreaterThan(sizes.client);
    expect(sizes.scrollbar).not.toBe("none");
    expect(sizes.overflow).toBe("scroll");
    expect(sizes.thumb).not.toBe("none");
    expect(sizes.horizontal).toBe(true);
    const before = await sidebar.locator(".board-sidebar-header").boundingBox();
    await scroll.hover();
    await page.mouse.wheel(0, 1000);
    await expect
      .poll(() => scroll.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);
    await expect(
      sidebar.getByRole("link", { name: "تحسين البحث", exact: true }),
    ).toBeInViewport();
    expect(
      (await sidebar.locator(".board-sidebar-header").boundingBox())!.y,
    ).toBe(before!.y);
    for (const separator of await sidebar
      .locator(".board-sidebar-separator")
      .all()) {
      const parent = await sidebar.boundingBox(),
        line = await separator.boundingBox();
      expect(line!.x).toBeGreaterThanOrEqual(parent!.x);
      expect(line!.x + line!.width).toBeLessThanOrEqual(
        parent!.x + parent!.width,
      );
    }
    await page.screenshot({
      path: `test-results/sidebar-scroll-${viewport.width}.png`,
    });
  }
  await page.setViewportSize({ width: 390, height: 640 });
  await page
    .getByRole("button", { name: "إظهار أو إخفاء القائمة", exact: true })
    .click();
  const menu = page.getByRole("dialog", {
    name: "أقسام لوحة الإدارة",
    exact: true,
  });
  await expect(menu).toBeVisible();
  const scroll = menu.locator(".board-sidebar-scroll");
  await scroll.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect(
    menu.getByRole("link", { name: "تحسين البحث", exact: true }),
  ).toBeInViewport();
  const line = await menu
      .locator(".board-sidebar-separator")
      .first()
      .boundingBox(),
    bounds = await menu.boundingBox();
  expect(line!.x).toBeGreaterThanOrEqual(bounds!.x);
  expect(line!.x + line!.width).toBeLessThanOrEqual(bounds!.x + bounds!.width);
  await page.screenshot({ path: "test-results/sidebar-scroll-mobile.png" });
});
