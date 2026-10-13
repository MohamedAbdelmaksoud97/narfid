import { test, expect } from "@playwright/test";
import { readFile, mkdir } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

test("board layout persists across pages, supports mobile and protects unsaved work", async ({
  page,
}) => {
  let id: string | undefined;
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  try {
    const credentials = JSON.parse(
      await readFile(".private/board-accounts.json", "utf8"),
    );
    const account = credentials.accounts.find(
      (value: { status: string }) => value.status === "verified",
    );
    await page.goto("/login");
    await page.getByLabel("البريد الإلكتروني").fill(account.email);
    await page
      .getByLabel("كلمة المرور", { exact: true })
      .fill(account.password);
    await page
      .getByRole("button", { name: "تسجيل الدخول", exact: true })
      .click();
    await expect(page).toHaveURL(/\/board$/);
    const shell = page.locator(".board-shell");
    const navigation = page.getByRole("navigation", {
      name: "أقسام لوحة الإدارة",
      exact: true,
    });
    const header = page.getByRole("banner", { name: "شريط لوحة الإدارة" });
    const toggle = page.getByRole("button", {
      name: "إظهار أو إخفاء القائمة",
      exact: true,
    });
    await expect(navigation).toBeVisible();
    await expect(header).toBeVisible();
    await shell.evaluate((element) =>
      element.setAttribute("data-qa-persisted", "yes"),
    );
    await mkdir(".private/board-layout-qa", { recursive: true });
    await page.screenshot({
      path: ".private/board-layout-qa/overview.png",
      fullPage: true,
    });
    await navigation
      .getByRole("link", { name: "هوية نرفد", exact: true })
      .click();
    await expect(page).toHaveURL(/\/board\/brand$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "تقنية تسند الطموح",
    );
    await expect(shell).toHaveAttribute("data-qa-persisted", "yes");
    await expect(navigation.locator('[aria-current="page"]')).toHaveAttribute(
      "href",
      "/board/brand",
    );
    await page
      .locator("#personas")
      .evaluate((element) =>
        element.scrollIntoView({ behavior: "instant", block: "start" }),
      );
    await expect(header).toBeInViewport();
    expect((await header.boundingBox())!.y).toBe(0);
    await expect(
      page.locator('.brand-guide-index [aria-current="location"]'),
    ).toHaveAttribute("href", "#personas");
    await toggle.click();
    await expect(
      page.locator('[data-slot="sidebar"][data-state]'),
    ).toHaveAttribute("data-state", "collapsed");
    await navigation
      .getByRole("link", { name: "المقالات", exact: true })
      .click();
    await expect(page).toHaveURL(/\/board\/articles$/);
    await expect(
      page.getByRole("heading", { name: "المقالات", exact: true }),
    ).toBeVisible();
    await expect(shell).toHaveAttribute("data-qa-persisted", "yes");
    await expect(
      page.locator('[data-slot="sidebar"][data-state]'),
    ).toHaveAttribute("data-state", "collapsed");
    await page.reload();
    await expect(
      page.locator('[data-slot="sidebar"][data-state]'),
    ).toHaveAttribute("data-state", "collapsed");
    await shell.evaluate((element) =>
      element.setAttribute("data-qa-persisted", "yes"),
    );
    await page
      .getByRole("button", { name: "مقال جديد", exact: true })
      .first()
      .click();
    await expect(page).toHaveURL(/\/articles\/[\w-]+\/edit$/);
    id = page.url().match(/articles\/([\w-]+)\/edit/)![1];
    await expect(
      page.getByRole("heading", { name: "محرر المقالات", exact: true }),
    ).toBeVisible();
    await expect(header).toContainText("محرر المقالات");
    await expect(shell).toHaveAttribute("data-qa-persisted", "yes");
    await expect(navigation.locator('[aria-current="page"]')).toHaveAttribute(
      "href",
      "/board/articles",
    );
    await page
      .getByLabel("عنوان المقال", { exact: true })
      .fill("اختبار الإطار المشترك");
    const warning = page.waitForEvent("dialog", { timeout: 5000 });
    const logoutClick = page
      .getByRole("button", { name: "تسجيل الخروج", exact: true })
      .click();
    const dialog = await warning;
    expect(dialog.message()).toContain("تعديلات لم تُحفظ");
    await dialog.dismiss();
    await logoutClick;
    await expect(page).toHaveURL(new RegExp(`/articles/${id}/edit$`));
    await expect(page.getByLabel("عنوان المقال", { exact: true })).toHaveValue(
      "اختبار الإطار المشترك",
    );
    await expect(
      page.getByRole("status").filter({ hasText: "كل التعديلات محفوظة" }),
    ).toBeVisible();
    const editor = page.getByRole("textbox", { name: "محتوى المقال" });
    await editor.click();
    await page.keyboard.press("Control+b");
    await page.keyboard.insertText("تنسيق غامق");
    await page.keyboard.press("Control+b");
    await expect(editor.locator("strong")).toHaveText("تنسيق غامق");
    await expect(
      page.locator('[data-slot="sidebar"][data-state]'),
    ).toHaveAttribute("data-state", "collapsed");
    await expect(
      page.getByRole("status").filter({ hasText: "كل التعديلات محفوظة" }),
    ).toBeVisible();
    await toggle.click();
    await expect(
      page.locator('[data-slot="sidebar"][data-state]'),
    ).toHaveAttribute("data-state", "expanded");
    await page.screenshot({
      path: ".private/board-layout-qa/editor.png",
      fullPage: true,
    });
    for (const width of [1024, 768, 390]) {
      await page.setViewportSize({ width, height: 844 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await expect(header).toBeVisible();
    }
    await toggle.click();
    const menu = page.getByRole("dialog", {
      name: "أقسام لوحة الإدارة",
      exact: true,
    });
    await expect(menu).toBeVisible();
    await page.screenshot({ path: ".private/board-layout-qa/mobile-menu.png" });
    await menu.getByRole("link", { name: "هوية نرفد", exact: true }).click();
    await expect(page).toHaveURL(/\/board\/brand$/);
    await expect(menu).toBeHidden();
    await expect(header).toBeVisible();
    await expect(shell).toHaveAttribute("data-qa-persisted", "yes");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await toggle.click();
    await expect(menu).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await page.screenshot({ path: ".private/board-layout-qa/mobile.png" });
    await page
      .getByRole("button", { name: "تسجيل الخروج", exact: true })
      .click();
    await expect(page).toHaveURL(/\/login$/);
    // Next Activity may retain the inactive layout DOM; it must be inaccessible.
    await expect(shell).toBeHidden();
    const denied = await page.request.get("/board/articles", {
      maxRedirects: 0,
    });
    expect(denied.status()).toBe(307);
    expect(denied.headers().location).toContain("/login");
    await page.goBack();
    await expect(page).toHaveURL(/\/login$/);
    await expect(shell).toBeHidden();
    expect(errors).toEqual([]);
  } finally {
    if (id) {
      const deleted = await admin.from("articles").delete().eq("id", id);
      expect(deleted.error).toBeNull();
    }
  }
});
