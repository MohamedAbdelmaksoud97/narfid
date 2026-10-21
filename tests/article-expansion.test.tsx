import test from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import sharp from "sharp";
import registry from "../.agents/skills/narfid-seo/references/keyword-opportunities.json";
import { expansionArticles, expansionCover, expansionFields, expansionId, expansionCategorySlug, assertExpansionInventory } from "../lib/articles/article-expansion-content";
import { campaignBriefs, campaignKeywords } from "../lib/seo-campaign";
import { launchArticles } from "../content/seo-articles.ar.mjs";
import { ArticleRenderer } from "../components/articles/article-renderer";
import { solutions } from "../lib/solutions";
import { documentText, UUID_RE } from "../lib/articles/types";
import type { JSONContent } from "@tiptap/core";

test("30 distinct new briefs retain research evidence and do not claim unknown metrics", () => {
  assertExpansionInventory();
  const oldSlugs = new Set([...campaignBriefs, ...launchArticles].map((a) => a.slug));
  const oldKeywords = new Set(campaignKeywords.map((k) => k.phrase));
  const ids = registry.researchSessions.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(new Set(registry.opportunities.map((o) => o.id)).size, registry.opportunities.length);
  for (const article of expansionArticles) {
    assert.ok(!oldSlugs.has(article.slug));
    assert.ok(UUID_RE.test(expansionId(article)));
    const opportunity = registry.opportunities.find((o) => o.target === `/articles/${article.slug}`)!;
    assert.ok(opportunity);
    assert.ok(!oldKeywords.has(opportunity.phrase));
    assert.equal(opportunity.volume, null);
    assert.equal(opportunity.difficulty, null);
    for (const id of opportunity.researchIds) {
      const research = registry.researchSessions.find((s) => s.id === id)!;
      assert.ok(research?.queries.length);
      assert.equal(research.googleSaudiVerified, false);
      assert.ok(research.pageChecks.some((p) => p.status === "opened"));
    }
  }
  assert.equal(new Set(expansionArticles.map((a) => a.categoryKey)).size, 7);
  assert.equal(expansionArticles.filter((a) => expansionCategorySlug(a) === "technology").length, 4);
});

test("all articles validate with owned covers and render real Tiptap headings and links", async () => {
  const destinations = new Set([...expansionArticles, ...campaignBriefs, ...launchArticles].map((a) => `/articles/${a.slug}`));
  solutions.forEach((s) => destinations.add(`/solutions/${s.slug}`));
  for (const article of expansionArticles) {
    const cover = expansionCover(article);
    const image = await sharp(cover.path).metadata();
    assert.equal(image.format, "webp");
    assert.ok(image.width && image.height);
    const fields = expansionFields(article, null, { width: image.width!, height: image.height! });
    assert.ok(fields.cover_image_url?.startsWith(`/media/articles/${expansionId(article)}/`));
    assert.ok(fields.cover_image_alt);
    assert.equal(fields.public_author_slug, "nerved-team");
    const html = renderToStaticMarkup(<ArticleRenderer content={fields.content} />);
    assert.equal((html.match(/<h2\b/g) ?? []).length, article.sections.length);
    assert.equal((html.match(/<h1\b/g) ?? []).length, 0);
    assert.ok(!html.includes("opportunity-20261021"));
    assert.ok(!html.includes("editorial_notes"));
    assert.ok(!documentText(fields.content).includes("](/"));
    let links = 0;
    function check(node: JSONContent) {
      for (const mark of node.marks ?? []) {
        if (mark.type !== "link") continue;
        assert.ok(destinations.has(mark.attrs?.href), `${article.slug}: ${mark.attrs?.href}`);
        links++;
      }
      node.content?.forEach(check);
    }
    check(fields.content);
    assert.ok(links > 0);
  }
});
