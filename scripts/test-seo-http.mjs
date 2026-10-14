import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { setDefaultAutoSelectFamilyAttemptTimeout } from "node:net";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import { launchArticles } from "../content/seo-articles.ar.mjs";
import { validateFields } from "../lib/articles/validation.ts";
setDefaultAutoSelectFamilyAttemptTimeout(3000);
const base = process.env.AUTH_TEST_BASE_URL || "http://127.0.0.1:3012";
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const board = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  options,
);
const anon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  options,
);
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  options,
);
const get = (path) => fetch(base + path, { redirect: "manual" });
const id = randomUUID(),
  otherId = randomUUID(),
  oldSlug = `seo-qa-${id}`,
  middleSlug = `${oldSlug}-renamed`,
  finalSlug = `${oldSlug}-final`;
let imagePath;
const pagingIds = [];
try {
  const credentials = JSON.parse(
    await readFile(".private/board-accounts.json", "utf8"),
  );
  const account = credentials.accounts.find((a) => a.status === "verified");
  const { data: auth, error: authError } = await board.auth.signInWithPassword({
    email: account.email,
    password: account.password,
  });
  assert.equal(authError, null);
  const { data: publicRows, error } = await anon
    .from("article_publications")
    .select("id,slug,title,content,cover_image_url,related_solution");
  assert.equal(error, null);
  for (const entry of launchArticles)
    assert.ok(
      publicRows.some((row) => row.slug === entry.slug),
      `Missing launch article: ${entry.slug}`,
    );
  const sitemapResponse = await get("/sitemap.xml");
  assert.equal(sitemapResponse.status, 200);
  const sitemap = await sitemapResponse.text();
  assert.ok(!sitemap.includes("/board") && !sitemap.includes("/login"));
  for (const entry of launchArticles)
    assert.ok(sitemap.includes(`/articles/${entry.slug}`));
  const robots = await (await get("/robots.txt")).text();
  assert.match(robots, /Disallow: \//);
  const paths = [
    "/",
    "/pricing",
    "/about",
    "/contact",
    "/technology-partnership",
    "/authors/nerved-team",
    ...[
      "memberships",
      "bookings",
      "point-of-sale",
      "kitchen-inventory",
      "branches",
    ].map((s) => `/solutions/${s}`),
    ...launchArticles.map((a) => `/articles/${a.slug}`),
  ];
  for (const path of paths) {
    const response = await get(path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.equal((html.match(/<h1\b/g) || []).length, 1, `One H1: ${path}`);
    assert.match(html, /rel="canonical"/, `Canonical: ${path}`);
    assert.match(html, /name="description"/, `Description: ${path}`);
    assert.match(html, /application\/ld\+json/, `Structured data: ${path}`);
    for (const match of html.matchAll(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
    ))
      assert.doesNotThrow(() => JSON.parse(match[1]));
    if (path.startsWith("/articles/")) {
      assert.ok(html.includes("محتويات المقال"));
      assert.ok(html.includes("فريق نرفد"));
      assert.ok(!html.includes("مصدر الوظائف: تدقيق"));
    }
  }
  for (let i = 0; i < 5; i++) {
    const pageId = randomUUID();
    pagingIds.push(pageId);
    const created = await board
      .from("articles")
      .insert({
        id: pageId,
        slug: `seo-pagination-${pageId}`,
        title: "اختبار ترقيم مؤقت",
        excerpt: "يحذف بعد التحقق",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "محتوى اختبار" }],
            },
          ],
        },
        author_id: auth.user.id,
      })
      .select("revision")
      .single();
    assert.equal(created.error, null);
    const pub = await board.rpc("publish_article", {
      article_id: pageId,
      expected_revision: created.data.revision,
    });
    assert.equal(pub.error, null);
  }
  const p2 = await (await get("/articles?page=2")).text();
  assert.match(p2, /rel="canonical" href="[^"]*\/articles\?page=2"/);
  assert.ok(p2.includes("صفحة 2"));
  const first = publicRows.find((r) => r.slug === launchArticles[0].slug);
  const original = await get(first.cover_image_url);
  const variant = await get(first.cover_image_url + "?w=320");
  assert.equal(variant.status, 200);
  assert.equal(variant.headers.get("content-type"), "image/webp");
  assert.match(variant.headers.get("cache-control"), /no-store/);
  const fullBytes = new Uint8Array(await original.arrayBuffer()),
    smallBytes = new Uint8Array(await variant.arrayBuffer());
  assert.equal((await sharp(smallBytes).metadata()).width, 320);
  console.log(
    `Image sample: ${fullBytes.length} bytes original; ${smallBytes.length} bytes at 320px`,
  );

  let fields = validateFields(
    {
      title: "مقال اختبار روابط",
      slug: oldSlug,
      excerpt: "اختبار مؤقت يُحذف بعد التحقق",
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "نص منشور للتحقق" }],
          },
        ],
      },
      cover_image_url: null,
      cover_image_alt: "",
      category_id: null,
      tags: [],
      seo_title: "",
      seo_description: "",
      direction: "rtl",
      editorial_notes: "PRIVATE_SEO_NOTES",
      review_due_at: "2027-01-14",
      related_solution: "memberships",
    },
    id,
  );
  let result = await board
    .from("articles")
    .insert({ id, ...fields, author_id: auth.user.id })
    .select("*")
    .single();
  assert.equal(result.error, null);
  let article = result.data;
  async function save(patch) {
    result = await board
      .from("articles")
      .update(patch)
      .eq("id", id)
      .eq("revision", article.revision)
      .select("*")
      .single();
    assert.equal(result.error, null);
    article = result.data;
  }
  async function publish() {
    result = await board.rpc("publish_article", {
      article_id: id,
      expected_revision: article.revision,
    });
    assert.equal(result.error, null);
    article = result.data;
  }
  await publish();
  const { data: before } = await anon
    .from("article_publications")
    .select("updated_at")
    .eq("id", id)
    .single();
  await save({ editorial_notes: "PRIVATE_CHANGED_ONLY" });
  await publish();
  const { data: after } = await anon
    .from("article_publications")
    .select("*")
    .eq("id", id)
    .single();
  assert.equal(
    after.updated_at,
    before.updated_at,
    "Internal edits must not fake content freshness",
  );
  assert.ok(!("editorial_notes" in after));
  assert.ok(!("review_due_at" in after));
  await save({ slug: middleSlug });
  await publish();
  await save({ slug: finalSlug });
  await publish();
  for (const slug of [oldSlug, middleSlug]) {
    const redirect = await get(`/articles/${slug}`);
    assert.equal(redirect.status, 308);
    assert.ok(
      redirect.headers.get("location").endsWith(`/articles/${finalSlug}`),
    );
  }
  const collision = await board
    .from("articles")
    .insert({ id: otherId, slug: oldSlug, author_id: auth.user.id });
  assert.equal(collision.error?.code, "23505");
  const fixtureSitemap = await (await get("/sitemap.xml")).text();
  assert.ok(fixtureSitemap.includes(finalSlug));
  for (const slug of [oldSlug, middleSlug]) assert.ok(!fixtureSitemap.includes(`/articles/${slug}</loc>`));
  imagePath = `${id}/${randomUUID()}.png`;
  const png = await sharp({
    create: { width: 32, height: 24, channels: 3, background: "#3ecf8e" },
  })
    .png()
    .toBuffer();
  const uploaded = await board.storage
    .from("article-media")
    .upload(imagePath, png, { contentType: "image/png" });
  assert.equal(uploaded.error, null);
  const media = `/media/articles/${imagePath}`;
  assert.equal(
    (await get(media + "?w=320")).status,
    404,
    "Unpublished variant stays private",
  );
  await save({
    cover_image_url: media,
    cover_image_alt: "صورة اختبار",
    cover_image_width: 32,
    cover_image_height: 24,
  });
  await publish();
  assert.equal((await get(media + "?w=320")).status, 200);
  result = await board.rpc("unpublish_article", {
    article_id: id,
    expected_revision: article.revision,
  });
  assert.equal(result.error, null);
  for (const slug of [oldSlug, middleSlug, finalSlug]) {
    const missing = await get(`/articles/${slug}`);
    assert.equal(missing.status, 404);
    assert.equal(missing.headers.get("x-robots-tag"), "noindex");
    assert.ok(!(await missing.text()).includes("نص منشور للتحقق"));
  }
  assert.equal((await get(media + "?w=320")).status, 404);
  const hiddenRegistry = await anon
    .from("article_slug_registry")
    .select("*")
    .eq("article_id", id);
  assert.equal(hiddenRegistry.error, null);
  assert.equal(hiddenRegistry.data.length, 0);
  console.log(
    "PASS: 8 launch articles, public SSR/metadata/JSON-LD, sitemap, staging robots, responsive images, private briefs, stable modification dates, one-hop 308 aliases, slug reservation, real 404 and unpublish privacy",
  );
} finally {
  if (imagePath) {
    const cleanup = await admin.storage
      .from("article-media")
      .remove([imagePath]);
    assert.equal(cleanup.error, null);
  }
  const cleanup = await admin
    .from("articles")
    .delete()
    .in("id", [id, otherId, ...pagingIds]);
  assert.equal(cleanup.error, null);
  await board.auth.signOut({ scope: "local" });
}
