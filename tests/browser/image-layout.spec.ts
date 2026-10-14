import { test, expect } from "@playwright/test";
import { readFile, mkdir } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

test.use({ actionTimeout: 15000 });

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  {
    auth: { persistSession: false, autoRefreshToken: false },
  },
);

test("image alignment, text wrapping and empty Arabic paragraphs persist in preview and publication", async ({
  page,
  browser,
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
    await page
      .getByRole("link", { name: "إدارة المقالات", exact: true })
      .click();
    await page
      .getByRole("button", { name: "مقال جديد", exact: true })
      .first()
      .click();
    await expect(page).toHaveURL(/\/articles\/[\w-]+\/edit$/);
    id = page.url().match(/articles\/([\w-]+)\/edit/)![1];
    const slug = `qa-layout-${id}`;
    await page
      .getByLabel("عنوان المقال", { exact: true })
      .fill("اختبار محاذاة الصورة والنص");
    await page
      .getByLabel("الملخص", { exact: true })
      .fill("اختبار مؤقت للصورة والمحاذاة والاتجاه.");
    await page.getByLabel("رابط المقال", { exact: true }).fill(slug);
    const editor = page.getByRole("textbox", { name: "محتوى المقال" });
    await expect(editor).toBeVisible();
    const empty = editor.locator("p.is-empty").last();
    await expect(empty).toHaveCSS("direction", "rtl");
    await editor.fill("مقدمة عربية قبل الصورة.");
    await page.keyboard.press("End");
    await page.keyboard.press("Enter");
    await expect(empty).toHaveAttribute("data-placeholder", "اكتب هنا…");
    await expect(empty).toHaveCSS("direction", "rtl");
    expect(
      await empty.evaluate(
        (element) => getComputedStyle(element, "::before").direction,
      ),
    ).toBe("rtl");
    await page
      .getByRole("button", { name: "English · LTR", exact: true })
      .click();
    await expect(empty).toHaveCSS("direction", "ltr");
    await page
      .getByRole("button", { name: "العربية · RTL", exact: true })
      .click();
    await expect(empty).toHaveCSS("direction", "rtl");
    await empty.click();
    // A following heading must stay intact, with an editable paragraph beside
    // the image rather than a cursor in a heading that clears the image float.
    await page.keyboard.insertText("عنوان تالٍ محفوظ");
    await page.keyboard.press("Control+Alt+2");
    await expect(editor.locator("h2")).toHaveText("عنوان تالٍ محفوظ");
    await page.keyboard.press("Home");
    const png = await sharp({
      create: { width: 1600, height: 1000, channels: 3, background: "#3ecf8e" },
    })
      .png()
      .toBuffer();
    await page.getByRole("button", { name: "إدراج صورة", exact: true }).click();
    await page.getByLabel("الصورة", { exact: true }).setInputFiles({
      name: "layout.png",
      mimeType: "image/png",
      buffer: png,
    });
    await page
      .getByLabel("الوصف البديل", { exact: true })
      .fill("صورة اختبار المحاذاة");
    await page.getByLabel("تعليق أسفل الصورة (اختياري)").fill("تعليق الصورة");
    await page.getByRole("button", { name: "حفظ وإدراج", exact: true }).click();
    const image = editor.locator("img");
    const container = editor.locator(
      '[data-resize-container][data-node="image"]',
    );
    await expect(image).toBeVisible();
    await expect(
      page.getByRole("group", { name: "خصائص الصورة", exact: true }),
    ).toBeVisible();
    const alignment = page.getByRole("group", {
      name: "محاذاة الصورة",
      exact: true,
    });
    for (const [value, label] of [
      ["left", "يسار"],
      ["right", "يمين"],
      ["center", "وسط"],
    ]) {
      await image.click();
      await alignment.getByRole("button", { name: label, exact: true }).click();
      await expect(image).toHaveAttribute("data-align", value);
      await expect(
        alignment.getByRole("button", { name: label, exact: true }),
      ).toHaveAttribute("aria-pressed", "true");
      await expect
        .poll(async () => {
          const box = await image.boundingBox();
          const outer = await container.boundingBox();
          if (!box || !outer) return 999;
          return Math.abs(
            value === "left"
              ? box.x - outer.x
              : value === "right"
                ? box.x + box.width - outer.x - outer.width
                : box.x + box.width / 2 - outer.x - outer.width / 2,
          );
        })
        .toBeLessThan(2);
    }
    expect(
      await container.evaluate(
        (element) => getComputedStyle(element).backgroundColor,
      ),
    ).toBe("rgba(0, 0, 0, 0)");
    await page
      .getByRole("button", { name: "اكتب يسار الصورة", exact: true })
      .click();
    await expect(image).toHaveAttribute("data-align", "right");
    await expect(image).toHaveAttribute("data-layout", "wrap");
    await expect(container).toHaveCSS("float", "right");
    await expect(editor.locator("h2")).toHaveText("عنوان تالٍ محفوظ");
    const emptyBeside = editor.locator(
      '[data-resize-container][data-node="image"] + p.is-empty',
    );
    const emptyBox = (await emptyBeside.boundingBox())!;
    const imageBeforeTyping = (await image.boundingBox())!;
    expect(emptyBox.x + emptyBox.width).toBeLessThan(imageBeforeTyping.x);
    expect(emptyBox.y).toBeLessThan(
      imageBeforeTyping.y + imageBeforeTyping.height,
    );
    await mkdir(".private/article-qa", { recursive: true });
    await editor.screenshot({
      path: ".private/article-qa/image-wrap-empty-right.png",
    });
    const copy =
      "نص عربي بجانب الصورة يشرح تفاصيل عمل المؤسسة الرياضية وكيف تساعد نرفد فريقها. ".repeat(
        5,
      );
    await page.keyboard.insertText(copy);
    const beside = editor.locator("p").filter({ hasText: "نص عربي بجانب الصورة" });
    await expect(beside).toContainText("نص عربي بجانب الصورة");
    const firstTextRect = () => beside.evaluate((element) => {
      const selection = document.createRange();
      selection.setStart(element.firstChild!, 0);
      selection.setEnd(element.firstChild!, 5);
      const box = selection.getBoundingClientRect();
      return { x: box.x, right: box.right, y: box.y, bottom: box.bottom };
    });
    const leftText = await firstTextRect();
    const rightImage = (await image.boundingBox())!;
    expect(leftText.right).toBeLessThan(rightImage.x);
    expect(leftText.y).toBeLessThan(rightImage.y + rightImage.height);
    expect(leftText.bottom).toBeGreaterThan(rightImage.y);

    // Switching sides reuses the adjacent paragraph and keeps its content.
    await image.click();
    await expect(
      page.getByRole("group", { name: "خصائص الصورة", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "اكتب يمين الصورة", exact: true })
      .click();
    await expect(image).toHaveAttribute("data-align", "left");
    await expect(container).toHaveCSS("float", "left");
    await expect(beside).toHaveCount(1);
    await expect(beside).toHaveText(copy.trim());
    await page.keyboard.press("End");
    await page.keyboard.insertText(" إضافة بعد تغيير الجهة.");
    await expect(beside).toContainText("إضافة بعد تغيير الجهة.");
    const range = await firstTextRect();
    const box = (await image.boundingBox())!;
    expect(range.x).toBeGreaterThan(box.x + box.width);
    expect(range.y).toBeLessThan(box.y + box.height);
    expect(range.bottom).toBeGreaterThan(box.y);
    await expect
      .poll(async () => {
        const { data } = await admin
          .from("articles")
          .select("content")
          .eq("id", id!)
          .single();
        return (
          JSON.stringify(data?.content).includes('"layout":"wrap"') &&
          JSON.stringify(data?.content).includes("نص عربي بجانب الصورة")
        );
      })
      .toBe(true);
    await page.reload();
    await expect(image).toHaveAttribute("data-layout", "wrap");
    await expect(image).toHaveAttribute("data-align", "left");
    await expect(container).toHaveCSS("float", "left");
    await mkdir(".private/article-qa", { recursive: true });
    await editor.screenshot({
      path: ".private/article-qa/image-wrap-editor.png",
    });
    await page.getByRole("button", { name: "معاينة", exact: true }).click();
    await expect(page.getByRole("dialog").locator("figure")).toHaveCSS(
      "float",
      "left",
    );
    await expect(page.getByRole("dialog")).toContainText("تعليق الصورة");
    await page.getByRole("button", { name: "إغلاق", exact: true }).click();
    await page.getByRole("button", { name: "نشر المقال", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "نشر التحديث", exact: true }),
    ).toBeVisible();
    const publicContext = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    });
    try {
      const publicPage = await publicContext.newPage();
      await publicPage.goto(`/articles/${slug}`);
      const figure = publicPage.locator(".article-figure");
      await expect(
        publicPage.getByRole("heading", {
          name: "اختبار محاذاة الصورة والنص",
          exact: true,
        }),
      ).toBeVisible();
      await expect(figure).toBeVisible();
      await expect(figure).toHaveAttribute("data-layout", "wrap");
      await expect(figure).toHaveCSS("float", "left");
      await expect(publicPage.locator(".article-prose")).toContainText(
        "نص عربي بجانب الصورة",
      );
      await publicPage.waitForFunction(() => {
        const image = document.querySelector(
          ".article-figure img",
        ) as HTMLImageElement | null;
        return image?.complete && image.naturalWidth > 0;
      });
      await publicPage.screenshot({
        path: ".private/article-qa/image-wrap-public.png",
        fullPage: true,
      });
      await publicPage.setViewportSize({ width: 390, height: 844 });
      await expect(figure).toHaveCSS("float", "none");
      expect(
        await publicPage.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    } finally {
      await publicContext.close();
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(container).toHaveCSS("float", "none");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
  } finally {
    if (id) {
      const { data } = await admin.storage.from("article-media").list(id);
      if (data?.length) {
        const removed = await admin.storage
          .from("article-media")
          .remove(data.map((file) => `${id}/${file.name}`));
        expect(removed.error).toBeNull();
      }
      const deleted = await admin.from("articles").delete().eq("id", id);
      expect(deleted.error).toBeNull();
    }
  }
});
