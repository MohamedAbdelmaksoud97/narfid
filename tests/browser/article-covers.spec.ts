import { test, expect } from "@playwright/test";
import manifest from "../../content/article-covers/manifest.json";

test("editorial photo covers load in the library and each published article", async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/articles");
  const images = new Map<string, string>();
  for (const entry of manifest) {
    const card = page.locator(
      `.article-public-card[href="/articles/${entry.slug}"]`,
    );
    const cover = card.locator("img");
    await cover.scrollIntoViewIfNeeded();
    await expect(cover).toHaveAttribute("alt", entry.alt);
    await expect(cover).toHaveAttribute(
      "src",
      /\/media\/articles\/.+\.webp\?w=640/,
    );
    await expect
      .poll(() =>
        cover.evaluate((image) => (image as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
    images.set(entry.slug, (await cover.getAttribute("src"))!.split("?")[0]);
  }
  await page.screenshot({
    path: "test-results/article-library-photos.png",
    fullPage: true,
  });
  for (const entry of manifest) {
    await page.goto(`/articles/${entry.slug}`);
    const cover = page
      .locator("main img")
      .filter({ hasNot: page.locator("a") })
      .locator("visible=true");
    const photo = page
      .getByRole("img", { name: entry.alt, exact: true })
      .first();
    await photo.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        photo.evaluate((image) => (image as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
    const response = await request.get(images.get(entry.slug)!);
    expect(response.ok(), entry.slug).toBe(true);
    expect(response.headers()["content-type"]).toContain("image/webp");
    expect((await response.body()).length).toBeLessThan(150 * 1024);
    await expect(page.locator(".article-prose")).not.toContainText(
      "لقطة توثيقية من النظام المرجعي Go Fitness",
    );
    expect(await cover.count()).toBeGreaterThan(0);
  }
  expect(errors).toEqual([]);
});
