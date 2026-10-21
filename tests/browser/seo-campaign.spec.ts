import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import { campaignBriefs } from "../../lib/seo-campaign";
import { solutionOperatingGuides } from "../../lib/solutions";

test("campaign publications render with metadata, private editorial fields and sitemap coverage", async ({ page, request }) => {
  test.setTimeout(300000);
  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { auth: { persistSession: false } });
  const { data, error } = await anon.from("article_publications").select("id,slug,title,cover_image_url").in("id", campaignBriefs.map((b) => b.id));
  expect(error).toBeNull(); expect(data).toHaveLength(20);
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const xml = await sitemap.text();
  expect(xml).not.toContain("/board");
  for (const article of data!) {
    const response = await page.goto(`/articles/${article.slug}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveText(article.title);
    await expect(page.locator(".article-public-cover")).toHaveAttribute("alt", /\S+/);
    await expect.poll(() => page.locator(".article-public-cover").evaluate((el) => (el as HTMLImageElement).naturalWidth > 0)).toBe(true);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", campaignBriefs.find((b) => b.id === article.id)!.excerpt);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(new URL(canonical!).pathname).toBe(`/articles/${article.slug}`);
    const schemas = (await page.locator('script[type="application/ld+json"]').allTextContents()).flatMap((s) => JSON.parse(s));
    expect(schemas.some((s) => s["@type"] === "Article" && s.headline === article.title && s.author.name === "فريق نرفد")).toBe(true);
    expect(xml).toContain(`/articles/${article.slug}`);
    const html = await page.content();
    expect(html).not.toContain("مصادر تحليل نية البحث");
    expect(html).not.toContain("editorial_notes");
    for (const link of await page.locator('.article-toc a').all()) {
      const hash = await link.getAttribute("href");
      expect(await page.locator(`[id=${JSON.stringify(hash!.slice(1))}]`).count()).toBe(1);
    }
  }
  const { data: privateRows, error: privateError } = await anon.from("articles").select("id").limit(1);
  expect(Boolean(privateError) || privateRows?.length === 0).toBe(true);
  for (const slug of ["womens-club-operations-system", "gym-daily-sales-collections-report", "club-meal-production-planning"]) {
    await page.goto(`/articles/${slug}`);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
      await page.screenshot({ path: `test-results/seo-${slug}-${width}.png`, fullPage: true });
    }
  }
});

test("SEO board stays private and renders the research register and real campaign state on mobile", async ({ page, request }) => {
  const blocked = await request.get("/board/seo", { maxRedirects: 0 });
  expect([302, 303, 307, 308]).toContain(blocked.status());
  const credentials = JSON.parse(await readFile(".private/board-accounts.json", "utf8"));
  const account = credentials.accounts.find((a: { status: string }) => a.status === "verified");
  await page.goto("/login");
  await page.getByLabel("البريد الإلكتروني").fill(account.email);
  await page.getByLabel("كلمة المرور", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "تسجيل الدخول", exact: true }).click();
  await expect(page).toHaveURL(/\/board$/);
  await page.goto("/board/seo");
  await expect(page.locator(".seo-keyword")).toHaveCount(50);
  await expect(page.locator('.seo-campaign-list [data-slot="card"]')).toHaveCount(20);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.locator(".seo-campaign-list")).toContainText("المنشور حاليًا: 20");
  await expect(page.locator("#seo-topics")).not.toContainText("هذه بذور بحث");
  await expect(page.locator("#seo-calendar")).not.toContainText("ثمانية مقالات أُضيفت بالفعل");
  await page.locator(".seo-keyword > summary").first().click();
  await page.locator(".seo-research-trail > summary").first().click();
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.locator("#seo-topics").scrollIntoViewIfNeeded();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await page.screenshot({ path: `test-results/seo-board-${width}.png` });
  }
});

test("solution guides link only to published content and existing drafts remain unavailable", async ({ page, request }) => {
  const baseline = JSON.parse(await readFile(".private/seo-campaign/baseline.json", "utf8")) as { id: string; status: string; slug: string }[];
  const xml = await (await request.get("/sitemap.xml")).text();
  for (const draft of baseline.filter((a) => a.status === "draft" && a.slug)) {
    expect((await request.get(`/articles/${encodeURIComponent(draft.slug)}`)).status()).toBe(404);
    expect(xml).not.toContain(`/articles/${encodeURIComponent(draft.slug)}`);
  }
  for (const [slug, guide] of Object.entries(solutionOperatingGuides)) {
    await page.goto(`/solutions/${slug}`);
    await expect(page.getByRole("heading", { name: guide.question })).toBeVisible();
    for (const article of guide.articles) expect(await page.locator(`a[href="/articles/${article}"]`).count()).toBeGreaterThan(0);
  }
  await page.setViewportSize({ width: 390, height: 900 });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.screenshot({ path: "test-results/seo-solution-mobile.png", fullPage: true });
});
