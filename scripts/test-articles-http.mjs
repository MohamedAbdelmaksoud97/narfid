import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { setDefaultAutoSelectFamilyAttemptTimeout } from "node:net";
import sharp from "sharp";
setDefaultAutoSelectFamilyAttemptTimeout(3000);
const base = process.env.AUTH_TEST_BASE_URL || "http://127.0.0.1:3012";
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const cookies = new Map();
async function request(path, options = {}, authenticated = true) {
  const response = await fetch(base + path, {
    ...options,
    redirect: "manual",
    headers: {
      ...(authenticated
        ? { Cookie: [...cookies].map(([k, v]) => `${k}=${v}`).join("; ") }
        : {}),
      ...options.headers,
    },
  });
  if (authenticated)
    for (const cookie of response.headers.getSetCookie()) {
      const [pair] = cookie.split(";");
      const at = pair.indexOf("=");
      cookies.set(pair.slice(0, at), pair.slice(at + 1));
    }
  return response;
}
async function mutate(path, method, data, authenticated = true) {
  return request(
    path,
    {
      method,
      headers: { Origin: base, "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
    authenticated,
  );
}
async function articleResult(response) {
  const body = await response.json();
  assert.ok(response.ok, body.error ?? `HTTP ${response.status}`);
  return body.article;
}
let id;
const paths = [];
try {
  const anonymous = await mutate(
    "/api/board/articles",
    "POST",
    { id: randomUUID() },
    false,
  );
  assert.equal(anonymous.status, 401);
  const login = await request("/login");
  const html = await login.text();
  const form = new FormData();
  for (const tag of html.matchAll(/<input\b[^>]*>/g)) {
    const attrs = Object.fromEntries(
      [...tag[0].matchAll(/([\w:$-]+)="([^"]*)"/g)].map((m) => [
        m[1],
        m[2].replaceAll("&quot;", '"').replaceAll("&amp;", "&"),
      ]),
    );
    if (attrs.type === "hidden" && attrs.name)
      form.append(attrs.name, attrs.value ?? "");
  }
  const credentials = JSON.parse(
    await readFile(".private/board-accounts.json", "utf8"),
  );
  const account = credentials.accounts.find((a) => a.status === "verified");
  form.append("email", account.email);
  form.append("password", account.password);
  const signedIn = await request("/login", {
    method: "POST",
    body: form,
    headers: { Origin: base },
  });
  assert.equal(signedIn.status, 303);
  id = randomUUID();
  let article = await articleResult(
    await mutate("/api/board/articles", "POST", { id }),
  );
  assert.equal(article.author_name.length > 0, true);
  const fields = {
    title: "اختبار تكامل المقالات",
    slug: `qa-http-${id}`,
    excerpt: "مقال اختبار مؤقت",
    content: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1, dir: "rtl" },
          content: [{ type: "text", text: "العربية والإنجليزية" }],
        },
        {
          type: "paragraph",
          attrs: { dir: "ltr" },
          content: [{ type: "text", text: "English paragraph" }],
        },
      ],
    },
    cover_image_url: null,
    cover_image_alt: "",
    category_id: null,
    tags: ["اختبار"],
    seo_title: "عنوان البحث",
    seo_description: "وصف البحث",
    direction: "rtl",
  };
  const oldRevision = article.revision;
  article = await articleResult(
    await mutate(`/api/board/articles/${id}`, "PATCH", {
      revision: oldRevision,
      fields,
    }),
  );
  assert.equal(article.revision, oldRevision + 1);
  const stale = await mutate(`/api/board/articles/${id}`, "PATCH", {
    revision: oldRevision,
    fields,
  });
  assert.equal(stale.status, 409);
  const invalid = await mutate(`/api/board/articles/${id}`, "PATCH", {
    revision: article.revision,
    fields: {
      ...fields,
      content: {
        type: "doc",
        content: [
          { type: "image", attrs: { src: "https://evil.example/image.svg" } },
        ],
      },
    },
  });
  assert.equal(invalid.status, 400);
  const csrf = await request(`/api/board/articles/${id}`, {
    method: "PATCH",
    headers: {
      Origin: "https://evil.example",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ revision: article.revision, fields }),
  });
  assert.equal(csrf.status, 403);
  const png = await sharp({
    create: { width: 32, height: 32, channels: 3, background: "#3ecf8e" },
  })
    .png()
    .toBuffer();
  const upload = new FormData();
  upload.set("file", new File([png], "test.png", { type: "image/png" }));
  const uploaded = await request(`/api/board/articles/${id}/images`, {
    method: "POST",
    body: upload,
    headers: { Origin: base },
  });
  assert.equal(uploaded.status, 201);
  const { url } = await uploaded.json();
  paths.push(url.replace("/media/articles/", ""));
  assert.equal((await request(url, {}, false)).status, 404);
  assert.equal((await request(url)).status, 200);
  const forged = new FormData();
  forged.set(
    "file",
    new File(['<svg onload="alert(1)"/>'], "test.png", { type: "image/png" }),
  );
  assert.equal(
    (
      await request(`/api/board/articles/${id}/images`, {
        method: "POST",
        body: forged,
        headers: { Origin: base },
      })
    ).status,
    400,
  );
  fields.content.content.push({
    type: "image",
    attrs: { src: url, alt: "صورة توضيحية", caption: "تعليق الصورة" },
  });
  article = await articleResult(
    await mutate(`/api/board/articles/${id}`, "PATCH", {
      revision: article.revision,
      fields,
    }),
  );
  article = await articleResult(
    await mutate(`/api/board/articles/${id}/publish`, "POST", {
      revision: article.revision,
      action: "publish",
    }),
  );
  assert.equal(article.status, "published");
  assert.equal((await request(url, {}, false)).status, 200);
  const published = await request(`/articles/${fields.slug}`, {}, false);
  assert.equal(published.status, 200);
  const publicHtml = await published.text();
  assert.ok(publicHtml.includes("<h2"));
  assert.ok(publicHtml.includes("تعليق الصورة"));
  assert.ok(publicHtml.includes("English paragraph"));
  assert.ok(publicHtml.includes("application/ld+json"));
  assert.ok(publicHtml.includes("عنوان البحث"));
  const draftImage = new FormData();
  draftImage.set("file", new File([png], "private.png", { type: "image/png" }));
  const nextImage = await request(`/api/board/articles/${id}/images`, {
    method: "POST",
    body: draftImage,
    headers: { Origin: base },
  });
  const next = await nextImage.json();
  paths.push(next.url.replace("/media/articles/", ""));
  assert.equal((await request(next.url, {}, false)).status, 404);
  fields.title = "تعديل خاص لم يُنشر";
  article = await articleResult(
    await mutate(`/api/board/articles/${id}`, "PATCH", {
      revision: article.revision,
      fields,
    }),
  );
  assert.ok(
    !(
      await (await request(`/articles/${fields.slug}`, {}, false)).text()
    ).includes(fields.title),
  );
  article = await articleResult(
    await mutate(`/api/board/articles/${id}/publish`, "POST", {
      revision: article.revision,
      action: "unpublish",
    }),
  );
  assert.equal(article.status, "draft");
  const unpublished = await request(`/articles/${fields.slug}`, {}, false);
  const missingHtml = await unpublished.text();
  // Proxy resolves existence before the PPR stream: real 404 and noindex.
  assert.equal(unpublished.status, 404);
  assert.match(missingHtml, /name="robots" content="noindex(?:, nofollow)?"/);
  assert.equal(unpublished.headers.get("x-robots-tag"), "noindex");
  assert.ok(!missingHtml.includes("English paragraph"));
  assert.equal((await request(url, {}, false)).status, 404);
  console.log(
    "PASS: actual login, create/save, concurrency conflict, CSRF, safe uploads, draft privacy, publish/SSR/SEO, stable published snapshot, new draft image privacy and unpublish",
  );
} finally {
  if (paths.length) {
    const removed = await admin.storage.from("article-media").remove(paths);
    assert.equal(removed.error, null, "Image cleanup failed");
  }
  if (id) {
    const removed = await admin.from("articles").delete().eq("id", id);
    assert.equal(removed.error, null, "Draft cleanup failed");
  }
}
