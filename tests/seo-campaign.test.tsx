import test from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import sharp from "sharp";
import { campaignBriefs, campaignKeywords, campaignResearch, campaignStatus, initialAssessments } from "../lib/seo-campaign";
import { assertCampaignInventory, campaignCover, campaignFields } from "../lib/articles/seo-campaign-content";
import { ArticleRenderer } from "../components/articles/article-renderer";
import { solutions } from "../lib/solutions";
import { launchArticles } from "../content/seo-articles.ar.mjs";
import bodies from "../content/seo-campaign/articles.json";

test("research retains 50 individual originals and 50 unique, mapped selections", () => {
  assertCampaignInventory();
  assert.equal(campaignResearch.originalSearches.length, 50);
  assert.equal(initialAssessments.length, 50);
  assert.equal(new Set(campaignKeywords.map((k) => k.id)).size, 50);
  assert.equal(new Set(campaignKeywords.map((k) => k.phrase)).size, 50);
  for (const k of campaignKeywords) {
    assert.ok(k.demandEvidence && k.competitionRationale && k.opportunity);
    assert.equal(k.volume, "غير متاح");
    assert.equal(k.difficulty, "غير متاح");
    assert.ok(new URL(k.reviewedSource.url).protocol.startsWith("http"));
    assert.ok(initialAssessments.some((r) => r.id === k.id && r.reviewedSource));
  }
});

test("new campaign preserves seed topics and every local destination exists", () => {
  const originals = launchArticles as { slug: string }[];
  const paths = new Set(["/", "/contact", "/pricing", ...solutions.map((s) => `/solutions/${s.slug}`), ...[...originals, ...campaignBriefs].map((a) => `/articles/${a.slug}`)]);
  for (const brief of campaignBriefs) assert.ok(!originals.some((o) => o.slug === brief.slug));
  for (const k of campaignKeywords) assert.ok(paths.has(k.target), k.target);
  for (const body of bodies) for (const [, href] of body.links) assert.ok(paths.has(href), href);
});

test("all 20 documents, covers, metadata and semantic headings pass the existing pipeline", async () => {
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  for (const brief of campaignBriefs) {
    const cover = campaignCover(brief);
    const meta = await sharp(cover.path).metadata();
    assert.equal(meta.format, "webp");
    const fields = campaignFields(brief, null, { width: meta.width!, height: meta.height! });
    const html = renderToStaticMarkup(<ArticleRenderer content={fields.content} />);
    assert.ok(html.includes("<h2"), brief.slug);
    assert.ok(!html.includes("<h1"), brief.slug);
    assert.ok(html.includes('/contact'), brief.slug);
    assert.ok(fields.editorial_notes?.includes(cover.source));
    titles.add(fields.seo_title); descriptions.add(fields.seo_description);
  }
  assert.equal(titles.size, 20); assert.equal(descriptions.size, 20);
});

test("board status follows publication snapshots, including saved edits and unpublication", () => {
  assert.equal(campaignStatus(undefined, undefined), "لم يُنشأ");
  assert.equal(campaignStatus({ revision: 4, slug: "new" }, undefined), "غير منشور");
  assert.equal(campaignStatus({ revision: 4, slug: "new" }, { revision: 3, slug: "old" }), "منشور — توجد نسخة أحدث في المحرر");
  assert.equal(campaignStatus({ revision: 3, slug: "same" }, { revision: 3, slug: "same" }), "منشور");
});
