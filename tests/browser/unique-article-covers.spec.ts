import { test, expect } from "@playwright/test";
import manifest from "../../content/article-covers/unique/manifest.json";

test("published articles show their distinct reviewed covers on desktop and mobile", async ({page,request}) => {
  test.setTimeout(600000);
  const urls = new Set<string>();
  for (const entry of manifest) {
    const response = await page.goto(`/articles/${entry.slug}`);
    expect(response?.status(),entry.slug).toBe(200);
    await expect(page.locator("h1")).toHaveText(entry.title);
    const cover = page.locator(".article-public-cover, .article-prose img").first();
    await expect(cover).toHaveAttribute("alt",entry.alt);
    await expect.poll(()=>cover.evaluate(el=>(el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth>0)).toBe(true);
    const src = await cover.getAttribute("src");
    expect(src).toBeTruthy();
    expect(urls.has(src!),entry.slug).toBe(false);
    urls.add(src!);
    const og = await page.locator('meta[property="og:image"]').first().getAttribute("content");
    expect(new URL(og!).pathname).toContain(`/media/articles/${entry.id}/`);
    const schemas = (await page.locator('script[type="application/ld+json"]').allTextContents()).flatMap(x=>JSON.parse(x));
    expect(schemas.some(x=>x["@type"] === "Article" && JSON.stringify(x.image).includes(`/media/articles/${entry.id}/`))).toBe(true);
    expect((await request.get(new URL(og!).pathname)).status()).toBe(200);
  }
  for (const width of [1440,390,320]) {
    await page.setViewportSize({width,height:900});
    for (const slug of ["academy-software-demo-checklist","gym-inquiry-call-checklist","padel-court-occupancy-report","club-meal-production-planning","gym-stock-count-reorder"]) {
      await page.goto(`/articles/${slug}`);
      await expect.poll(()=>page.locator(".article-public-cover").evaluate(el=>(el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth>0)).toBe(true);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
      await page.screenshot({path:`.private/unique-article-covers/screens/unique-cover-${slug}-${width}.png`,fullPage:false});
    }
  }
});

test("article library cards use the reviewed covers across all pages", async ({page}) => {
  test.setTimeout(180000);
  const seen = new Set<string>();
  for (let number=1;number<=Math.ceil(manifest.length/12);number++) {
    await page.goto(`/articles?page=${number}`);
    const cards = page.locator(".article-public-card");
    await expect(cards.first()).toBeVisible();
    for (const card of await cards.all()) {
      const href = await card.getAttribute("href");
      const entry = manifest.find(x=>href===`/articles/${x.slug}`);
      expect(entry,href!).toBeTruthy();
      expect(seen.has(entry!.slug)).toBe(false);
      seen.add(entry!.slug);
      const image = card.locator("img");
      await image.scrollIntoViewIfNeeded();
      await expect(image).toHaveAttribute("alt",entry!.alt);
      await expect(image).toHaveAttribute("src",new RegExp(`/media/articles/${entry!.id}/`));
      await expect.poll(()=>image.evaluate(el=>(el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth>0)).toBe(true);
    }
  }
  expect(seen.size).toBe(manifest.length);
  for (const width of [1440,390]) {
    await page.setViewportSize({width,height:1000});
    await page.goto("/articles");
    await expect(page.locator(".article-public-card").first()).toBeVisible();
    for (const image of await page.locator(".article-public-card img").all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(()=>image.evaluate(el=>(el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth>0)).toBe(true);
    }
    await page.evaluate(()=>window.scrollTo(0,0));
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
    await page.screenshot({path:`.private/unique-article-covers/screens/unique-cover-library-${width}.png`,fullPage:true});
  }
});
