import { expect, test } from "@playwright/test";

test("the landing page shows the latest published articles with working covers and links", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/articles");
  await expect(page.locator(".article-public-card").first()).toBeVisible();
  const published = await page.locator(".article-public-card").evaluateAll((cards) =>
    cards.slice(0, 3).map((card) => ({ title: card.querySelector("h2")!.textContent, href: card.getAttribute("href") })),
  );

  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto("/");
  const section = page.locator("#insights");
  const cards = section.locator("article");
  await expect(cards).toHaveCount(published.length);
  await section.scrollIntoViewIfNeeded();
  for (let index = 0; index < published.length; index++) {
    await expect(cards.nth(index).getByRole("heading", { level: 3 })).toHaveText(published[index].title!);
    await expect(cards.nth(index).getByRole("link")).toHaveAttribute("href", published[index].href!);
  }
  for (const image of await section.locator("img").all()) {
    await expect.poll(() => image.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0)).toBe(true);
  }
  await expect(section.getByRole("link", { name: "جميع المقالات" })).toHaveAttribute("href", "/articles");
  await section.screenshot({ path: "test-results/landing-articles-desktop.png" });

  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await section.scrollIntoViewIfNeeded();
    const sizes = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
    expect(sizes.scrollWidth).toBeLessThanOrEqual(sizes.width);
    await expect(cards.first()).toBeVisible();
    await section.screenshot({ path: `test-results/landing-articles-${width}.png` });
  }

  await cards.first().getByRole("link").click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(published[0].title!);
  expect(errors).toEqual([]);
});
