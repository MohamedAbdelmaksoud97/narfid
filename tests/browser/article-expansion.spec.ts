import { test, expect } from "@playwright/test";
import { expansionArticles } from "../../lib/articles/article-expansion-content";

test("30 expansion publications render complete metadata, images and working internal links", async ({ page, request }) => {
  test.setTimeout(300000);
  const xml = await (await request.get("/sitemap.xml")).text();
  expect(xml).not.toContain("/board/");
  const checked = new Set<string>();
  for (const article of expansionArticles) {
    const response = await page.goto(`/articles/${article.slug}`);
    expect(response?.status(), article.slug).toBe(200);
    await expect(page.locator("h1")).toHaveText(article.title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", article.excerpt);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(new URL(canonical!).pathname).toBe(`/articles/${article.slug}`);
    const schemas = (await page.locator('script[type="application/ld+json"]').allTextContents()).flatMap((s) => JSON.parse(s));
    expect(schemas.some((s) => s["@type"] === "Article" && s.headline === article.title && s.author.name === "فريق نرفد")).toBe(true);
    await expect(page.locator(".article-public-cover")).toHaveAttribute("alt", /\S+/);
    await expect.poll(() => page.locator(".article-public-cover").evaluate((el) => (el as HTMLImageElement).naturalWidth > 0)).toBe(true);
    expect(xml).toContain(`/articles/${article.slug}`);
    const html = await page.content();
    expect(html).not.toContain("opportunity-20261021");
    expect(html).not.toContain("editorial_notes");
    for (const section of article.sections) await expect(page.getByRole("heading", { name: section.title, exact: true })).toBeVisible();
    for (const toc of await page.locator(".article-toc a").all()) {
      const hash = await toc.getAttribute("href");
      expect(await page.locator(`[id=${JSON.stringify(hash!.slice(1))}]`).count()).toBe(1);
    }
    const hrefs = await page.locator(".article-prose a[href^='/']").evaluateAll((nodes) => nodes.map((n) => n.getAttribute("href")!));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      if (checked.has(href)) continue;
      expect((await request.get(href)).status(), href).toBe(200);
      checked.add(href);
    }
  }
  for (const slug of [expansionArticles[0].slug, expansionArticles[10].slug, expansionArticles[22].slug, expansionArticles[29].slug]) {
    await page.goto(`/articles/${slug}`);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await expect.poll(() => page.locator(".article-public-cover").evaluate((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0)).toBe(true);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
      await page.screenshot({ path: `test-results/expansion-${slug}-${width}.png`, fullPage: true });
    }
  }
});
