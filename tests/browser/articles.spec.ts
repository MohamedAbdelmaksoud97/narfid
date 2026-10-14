import { test, expect } from "@playwright/test";
import { readFile, mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const admin = createClient(url, process.env.SUPABASE_SECRET_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const anon = createClient(
  url,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

test("real board author: autosave, media privacy, RTL/LTR, formatting, publish and unpublish", async ({
  page,
  context,
  browser,
}) => {
  const png = await sharp({
    create: { width: 480, height: 270, channels: 3, background: "#3ecf8e" },
  })
    .png()
    .toBuffer();
  const credentials = JSON.parse(
    await readFile(".private/board-accounts.json", "utf8"),
  );
  const account = credentials.accounts.find(
    (a: { status: string }) => a.status === "verified",
  );
  const issues: string[] = [];
  page.on("pageerror", (e) => issues.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") issues.push(m.text());
  });
  let id: string | undefined;
  let extraId: string | undefined;
  try {
    const unauthorized = await context.request.post("/api/board/articles", {
      data: { id: randomUUID() },
      headers: {
        Origin: process.env.AUTH_TEST_BASE_URL || "http://127.0.0.1:3012",
      },
    });
    expect(unauthorized.status()).toBe(401);
    await page.goto("/login");
    await page.getByLabel("البريد الإلكتروني").fill(account.email);
    await page
      .getByLabel("كلمة المرور", { exact: true })
      .fill(account.password);
    await page
      .getByRole("button", { name: "تسجيل الدخول", exact: true })
      .click();
    await expect(page).toHaveURL(/\/board$/);
    await page.getByRole("link", { name: "إدارة المقالات" }).click();
    await page
      .getByRole("button", { name: "مقال جديد", exact: true })
      .first()
      .click();
    await expect(page).toHaveURL(/\/board\/articles\/[\w-]+\/edit/);
    id = page.url().match(/articles\/([\w-]+)\/edit/)![1];
    const title = `اختبار النشر ${id.slice(0, 8)}`;
    const slug = `qa-${id}`;
    await page.getByLabel("عنوان المقال", { exact: true }).fill(title);
    await page
      .getByLabel("الملخص", { exact: true })
      .fill("اختبار تكامل مؤقت يتم حذفه تلقائيًا.");
    await page.getByLabel("رابط المقال", { exact: true }).fill(slug);
    const editor = page.getByRole("textbox", { name: "محتوى المقال" });
    await expect(editor).toBeVisible();
    await editor.fill(
      "نرفد يدعم المؤسسات الرياضية. English content works here.",
    );
    await expect
      .poll(async () => {
        const { data } = await admin
          .from("articles")
          .select("title,content")
          .eq("id", id!)
          .single();
        return (
          data?.title === title &&
          JSON.stringify(data.content).includes("English content")
        );
      })
      .toBe(true);
    await expect(
      page.getByRole("status").filter({ hasText: "كل التعديلات محفوظة" }),
    ).toBeVisible();
    await page
      .getByLabel("عنوان المقال", { exact: true })
      .fill(title + " رجوع");
    const historyWarning = page.waitForEvent("dialog", { timeout: 5000 });
    await expect(
      page.getByRole("status").filter({ hasText: "تعديلات لم تُحفظ" }),
    ).toBeVisible();
    await page.evaluate(() => window.history.back());
    const backDialog = await historyWarning;
    expect(backDialog.message()).toContain("تعديلات");
    await backDialog.dismiss();
    await expect(page).toHaveURL(new RegExp(`/articles/${id}/edit`));
    await expect(page.getByLabel("عنوان المقال", { exact: true })).toHaveValue(
      title + " رجوع",
    );
    await page.getByLabel("عنوان المقال", { exact: true }).fill(title);
    await page.reload();
    await expect(editor).toContainText("المؤسسات الرياضية");
    await expect(page.getByLabel("عنوان المقال", { exact: true })).toHaveValue(
      title,
    );
    await page
      .getByLabel("عنوان المقال", { exact: true })
      .fill(title + " تغيير");
    const leave = page.waitForEvent("dialog");
    const clickBack = page
      .getByRole("link", { name: "العودة إلى المقالات", exact: true })
      .click();
    const warning = await leave;
    expect(warning.message()).toContain("تعديلات");
    await warning.dismiss();
    await clickBack;
    await expect(page).toHaveURL(new RegExp(`/articles/${id}/edit`));
    await page.getByLabel("عنوان المقال", { exact: true }).fill(title);
    await page
      .getByRole("button", { name: "بحث واستبدال", exact: true })
      .click();
    await page
      .getByRole("textbox", { name: "Search", exact: true })
      .fill("English");
    await page
      .getByRole("textbox", { name: "Replace", exact: true })
      .fill("Bilingual");
    await page
      .getByRole("button", { name: "Replace all results", exact: true })
      .click();
    await expect(editor).toContainText("Bilingual content");
    await page.getByRole("button", { name: "Close", exact: true }).click();
    await editor.click();
    await page.keyboard.press("Control+End");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Control+b");
    await page.keyboard.type("Bold text");
    await page.keyboard.press("Control+b");
    await expect(editor.locator("strong")).toContainText("Bold text");
    await page.getByRole("button", { name: "إدراج جدول", exact: true }).click();
    await expect(editor.locator("table")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "صف بعده", exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "صف بعده", exact: true }).click();
    await expect(editor.locator("tr")).toHaveCount(4);
    await page.getByRole("button", { name: "إدراج صورة", exact: true }).click();
    await page
      .getByLabel("الصورة", { exact: true })
      .setInputFiles({ name: "qa.png", mimeType: "image/png", buffer: png });
    await page.getByLabel("الوصف البديل", { exact: true }).fill("صورة اختبار");
    await page.getByLabel("تعليق أسفل الصورة (اختياري)").fill("تعليق الاختبار");
    await page.getByRole("button", { name: "حفظ وإدراج", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(editor.locator("img")).toBeVisible();
    const media = await editor.locator("img").getAttribute("src");
    expect(media).toContain(`/media/articles/${id}/`);
    const publicRequest = await browser.newContext();
    try {
      expect((await publicRequest.request.get(media!)).status()).toBe(404);
      const hidden = await anon.from("articles").select("id").eq("id", id!);
      expect(hidden.error).toBeTruthy();
      await page.getByLabel("رفع صورة", { exact: true }).setInputFiles({
        name: "cover.png",
        mimeType: "image/png",
        buffer: png,
      });
      await expect(page.getByLabel("الوصف البديل للغلاف")).toBeVisible();
      await page.getByLabel("الوصف البديل للغلاف").fill("غلاف الاختبار");
      await page
        .getByRole("button", { name: "English · LTR", exact: true })
        .click();
      await expect(page.locator(".simple-editor-wrapper")).toHaveAttribute(
        "dir",
        "ltr",
      );
      await page
        .getByRole("button", { name: "العربية · RTL", exact: true })
        .click();
      await expect(page.locator(".simple-editor-wrapper")).toHaveAttribute(
        "dir",
        "rtl",
      );
      await page.getByRole("button", { name: "معاينة", exact: true }).click();
      await expect(page.getByRole("dialog")).toContainText(title);
      await page.getByRole("button", { name: "إغلاق", exact: true }).click();
      await page.setViewportSize({ width: 390, height: 844 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      await mkdir(".private/article-qa", { recursive: true });
      await page.screenshot({
        path: ".private/article-qa/editor-mobile.png",
        fullPage: true,
      });
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.screenshot({
        path: ".private/article-qa/editor-desktop.png",
        fullPage: true,
      });
      await page
        .getByRole("button", { name: "نشر المقال", exact: true })
        .click();
      await expect(
        page.getByRole("button", { name: "نشر التحديث", exact: true }),
      ).toBeVisible();
      const published = await publicRequest.request.get(`/articles/${slug}`);
      expect(published.status()).toBe(200);
      const html = await published.text();
      expect(html).toContain(title);
      expect(html).toContain("تعليق الاختبار");
      expect(html).toContain("application/ld+json");
      expect(html).toContain("og:type");
      expect((await publicRequest.request.get(media!)).status()).toBe(200);
      await editor.click();
      await page.keyboard.press("Control+End");
      await page.keyboard.press("Enter");
      await page.keyboard.type("Private unpublished revision");
      await expect
        .poll(async () => {
          const { data } = await admin
            .from("articles")
            .select("content")
            .eq("id", id!)
            .single();
          return JSON.stringify(data?.content).includes(
            "Private unpublished revision",
          );
        })
        .toBe(true);
      expect(
        await (await publicRequest.request.get(`/articles/${slug}`)).text(),
      ).not.toContain("Private unpublished revision");
      await page
        .getByRole("button", { name: "نشر التحديث", exact: true })
        .click();
      await expect
        .poll(
          async () =>
            await (await publicRequest.request.get(`/articles/${slug}`)).text(),
        )
        .toContain("Private unpublished revision");
      await page
        .getByRole("button", { name: "إلغاء النشر", exact: true })
        .click();
      await expect(
        page.getByRole("button", { name: "نشر المقال", exact: true }),
      ).toBeVisible();
      const missing = await publicRequest.request.get(`/articles/${slug}`);
      expect(missing.status()).toBe(404);
      const missingHtml = await missing.text();
      expect(missingHtml).toMatch(/name="robots" content="noindex(?:, nofollow)?"/);
      expect(missingHtml).not.toContain("Private unpublished revision");
      expect((await publicRequest.request.get(media!)).status()).toBe(404);
    } finally {
      await publicRequest.close();
    }
    await page
      .getByRole("link", { name: "العودة إلى المقالات", exact: true })
      .click();
    await expect(page).toHaveURL(/\/board\/articles$/);
    await expect(
      page.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
    const another = page
      .getByRole("button", { name: "مقال جديد", exact: true })
      .first();
    await expect(another).toBeEnabled();
    await another.click();
    await expect(page).toHaveURL(/\/board\/articles\/[\w-]+\/edit/);
    extraId = page.url().match(/articles\/([\w-]+)\/edit/)![1];
    expect(extraId).not.toBe(id);
    await expect(
      page
        .locator(".article-workspace:visible")
        .getByRole("textbox", { name: "عنوان المقال", exact: true }),
    ).toHaveValue("");
    expect(issues).toEqual([]);
  } finally {
    if (test.info().status !== "passed" && issues.length)
      console.log("Browser errors:", issues);
    for (const cleanupId of [id, extraId].filter(
      (value): value is string => !!value,
    )) {
      const { data } = await admin.storage
        .from("article-media")
        .list(cleanupId);
      if (data?.length)
        await admin.storage
          .from("article-media")
          .remove(data.map((f) => `${cleanupId}/${f.name}`));
      const { error } = await admin
        .from("articles")
        .delete()
        .eq("id", cleanupId);
      if (error) throw new Error("QA draft cleanup failed");
    }
  }
});

test("RLS denies authenticated outsiders, forged metadata and direct Storage writes", async () => {
  const png = await sharp({
    create: { width: 8, height: 8, channels: 3, background: "#3ecf8e" },
  })
    .png()
    .toBuffer();
  const email = `qa-${randomUUID()}@nerfed.example`;
  const password = randomUUID() + "!Aa9";
  let userId: string | undefined;
  const outsider = createClient(
    url,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  try {
    const created = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { narfid_board_member: true },
    });
    if (created.error) throw new Error("Unable to create isolated QA user");
    userId = created.data.user!.id;
    const signedIn = await outsider.auth.signInWithPassword({
      email,
      password,
    });
    expect(signedIn.error).toBeNull();
    const reading = await outsider.from("articles").select("id");
    expect(reading.data).toEqual([]);
    const inserting = await outsider
      .from("articles")
      .insert({ slug: `qa-${randomUUID()}`, author_id: userId });
    expect(inserting.error?.code).toBe("42501");
    const membership = await outsider
      .from("board_members")
      .insert({ user_id: userId, active: true });
    expect(membership.error).toBeTruthy();
    const publication = await outsider
      .from("article_publications")
      .insert({ id: randomUUID() });
    expect(publication.error).toBeTruthy();
    const storage = await outsider.storage
      .from("article-media")
      .upload(`${randomUUID()}/${randomUUID()}.png`, png, {
        contentType: "image/png",
      });
    expect(storage.error).toBeTruthy();
    const rpc = await outsider.rpc("publish_article", {
      article_id: randomUUID(),
      expected_revision: 1,
    });
    expect(rpc.error).toBeTruthy();
    const anonymousWrite = await anon
      .from("articles")
      .insert({ slug: "unauthorized" });
    expect(anonymousWrite.error).toBeTruthy();
  } finally {
    await outsider.auth.signOut({ scope: "local" });
    if (userId) {
      const deleted = await admin.auth.admin.deleteUser(userId);
      if (deleted.error) throw new Error("QA user cleanup failed");
    }
  }
});
