import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const root = ".cloudflare/output/v0/workers/default/assets/_vinext/static-cache";
const manifest = await readJson("dist/server/vinext-prerender.json");
const index = await readJson(`${root}/index.json`);
const config = await readJson(".cloudflare/output/v0/config.json");
const indexable = config.buildContext.mode === "production";
const rendered = manifest.routes.filter((route) => route.status === "rendered");
assert.ok(!rendered.some((route) => /^\/board(?:\/|$)|^\/login$|^\/api\//.test(route.path ?? route.route)), "Private route was prerendered");
const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const articles = [];
for (let start = 0; ; start += 1000) {
  const { data, error } = await client.from("article_publications")
    .select("slug,title").order("slug").range(start, start + 999);
  assert.ok(!error, "Could not verify the current public article inventory");
  articles.push(...data);
  if (data.length < 1000) break;
}
const required = ["/", "/about", "/contact", "/pricing", "/technology-partnership", "/visual-identity", "/authors/nerved-team",
  ...["memberships", "bookings", "point-of-sale", "kitchen-inventory", "branches"].map((slug) => `/solutions/${slug}`),
  ...Array.from({ length: Math.max(1, Math.ceil(articles.length / 12)) }, (_, i) => `/articles/page/${i + 1}`),
  ...articles.map((article) => `/articles/${article.slug}`)];
const digest = (html) => createHash("sha256").update(html).digest("hex");
const cached = new Set(await Promise.all(Object.entries(index)
  .filter(([, entry]) => entry.kind === "html")
  .map(async ([id]) => digest(await readFile(`${root}/${id}.html`, "utf8")))));
const canonicalPaths = new Set();
for (const path of required) {
  assert.ok(rendered.some((route) => (route.path ?? route.route) === path), `Public route was not prerendered: ${path}`);
  const html = await readFile(`dist/server/prerendered-routes${path === "/" ? "/index" : path}.html`, "utf8");
  assert.ok(cached.has(digest(html)), `Public route was not packaged as an asset: ${path}`);
  const canonical = path.startsWith("/articles/page/")
    ? Number(path.split("/").at(-1)) > 1 ? `/articles?page=${path.split("/").at(-1)}` : "/articles"
    : path;
  const expected = new URL(canonical, "https://www.narfid.com").href;
  const actual = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1]?.replaceAll("&amp;", "&");
  assert.equal(actual && new URL(actual).href, expected, `Wrong canonical: ${path}`);
  canonicalPaths.add(expected);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `Missing or duplicate H1: ${path}`);
  assert.ok(/<title>[^<]+<\/title>/.test(html), `Missing title: ${path}`);
  assert.ok(/<meta name="description" content="[^"]+"/.test(html), `Missing description: ${path}`);
  const robots = html.match(/<meta name="robots" content="([^"]+)"/)?.[1];
  assert.ok(robots && (indexable ? !robots.includes("noindex") : robots.includes("noindex")), `Wrong indexing policy: ${path}`);
  if (articles.some((article) => path === `/articles/${article.slug}`)) {
    assert.ok(!html.includes("تعذر عرض محتوى المقال بصيغته الحالية."), `Article document could not render: ${path}`);
    const body = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/)?.[1];
    assert.ok(body && body.replace(/<[^>]+>/g, "").trim().length > 60, `Article body absent from HTML: ${path}`);
    const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .flatMap((match) => JSON.parse(match[1]));
    assert.equal(schemas.filter((schema) => schema["@type"] === "Article").length, 1, `Missing Article schema: ${path}`);
  }
}
console.log(`Verified ${articles.length} published articles and ${canonicalPaths.size} public canonical pages: packaged HTML, body, H1, metadata, canonical, schema and indexing policy.`);
