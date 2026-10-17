import { expect, test } from "@playwright/test";

test("member app preview changes screens and requests the technology partnership", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/");
  await page.locator(".desktop-nav").getByRole("link", { name: "تطبيق الأعضاء" }).click();
  const section = page.locator("#member-app");
  await expect(section.getByRole("heading", { level: 2 })).toBeVisible();
  const screens = [
    ["حجز الملاعب", "موعدك مع لعبتك."],
    ["الشكاوى والاقتراحات", "رأيك يوصل لفريقنا."],
    ["تنبيهات الاشتراك", "موعد التجديد ما يفوتك."],
    ["الاشتراكات والتجديد", "خطوتك الجاية، أقرب."],
  ];
  for (const [tab, heading] of screens) {
    await section.getByRole("tab", { name: tab }).click();
    await expect(section.getByRole("tab", { name: tab })).toHaveAttribute("aria-selected", "true");
    await expect(section.getByRole("tabpanel")).toHaveCount(1);
    await expect(section.getByRole("tabpanel").getByRole("heading", { name: heading })).toBeVisible();
  }
  await section.getByRole("tab", { name: "الاشتراكات والتجديد" }).focus();
  await page.keyboard.press("ArrowLeft");
  await expect(section.getByRole("tab", { name: "حجز الملاعب" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(section.getByRole("tab", { name: "حجز الملاعب" })).toHaveAttribute("aria-selected", "true");
  await section.screenshot({ path: "test-results/member-app-desktop.png" });
  await section.getByRole("button", { name: "ناقش تطبيق مؤسستك" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("#demo-plan")).toHaveValue("شراكة تقنية");
  expect(errors).toEqual([]);
});

test("member app remains usable on narrow screens with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/#member-app");
    const section = page.locator("#member-app");
    await section.getByRole("tab", { name: "تنبيهات الاشتراك" }).click();
    await expect(section.getByRole("tabpanel").getByText("باقي ٧ أيام")).toBeVisible();
    const dimensions = await section.evaluate((element) => {
      const device = element.querySelector(".member-app-device")!;
      const phone = device.getBoundingClientRect();
      return { width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth, left: phone.left, right: phone.right, transform: getComputedStyle(device).transform };
    });
    expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width);
    expect(dimensions.left).toBeGreaterThanOrEqual(0);
    expect(dimensions.right).toBeLessThanOrEqual(width);
    expect(dimensions.transform).toBe("none");
    await section.screenshot({ path: `test-results/member-app-${width}.png` });
  }
});

test("motion responds to reduced-motion changes and tablet navigation stays accessible", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto("/#member-app");
  const device = page.locator(".member-app-device");
  await device.scrollIntoViewIfNeeded();
  // Allow the finite entrance animation and its lazy import to finish.
  await page.waitForTimeout(1800);
  await page.locator(".member-app-stage").hover({ position: { x: 30, y: 150 } });
  await expect.poll(() => device.evaluate((element) => element.style.transform)).not.toBe("");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => device.evaluate((element) => getComputedStyle(element).transform)).toBe("none");
  for (const width of [960, 720]) {
    await page.setViewportSize({ width, height: 900 });
    await page.getByRole("button", { name: "افتح القائمة" }).click();
    const link = page.getByRole("navigation", { name: "قائمة الجوال" }).getByRole("link", { name: "تطبيق الأعضاء" });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page.getByRole("button", { name: "افتح القائمة" })).toHaveAttribute("aria-expanded", "false");
    const bounds = await page.locator(".header-actions").boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
  }
});
