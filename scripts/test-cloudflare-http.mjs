import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const base = process.env.AUTH_TEST_BASE_URL;
assert.ok(base, "Set AUTH_TEST_BASE_URL to the deployment under test");
const cookies = new Map();
async function request(path, options = {}) {
  const response = await fetch(base + path, {
    ...options,
    redirect: "manual",
    headers: {
      Cookie: [...cookies].map(([k, v]) => `${k}=${v}`).join("; "),
      ...options.headers,
    },
  });
  for (const cookie of response.headers.getSetCookie()) {
    const [name, ...value] = cookie.split(";", 1)[0].split("=");
    if (/max-age=0(?:;|$)/i.test(cookie)) cookies.delete(name);
    else cookies.set(name, value.join("="));
  }
  return response;
}
function form(html) {
  const body = html.match(/<form\b[^>]*>[\s\S]*?<\/form>/)?.[0];
  assert.ok(body);
  const data = new FormData();
  for (const input of body.matchAll(/<input\b[^>]*>/g)) {
    const attrs = Object.fromEntries(
      [...input[0].matchAll(/([\w:$-]+)="([^"]*)"/g)].map((m) => [
        m[1],
        m[2]
          .replace(/&quot;/g, '"')
          .replace(/&#x27;/g, "'")
          .replace(/&amp;/g, "&"),
      ]),
    );
    if (attrs.type === "hidden") data.append(attrs.name, attrs.value || "");
  }
  return data;
}
const asset = "/api/board/marketing/assets/instagram/01-brand.png";
for (const path of [
  asset,
  "/api/board/marketing/assets/business-rules.md",
  "/api/board/marketing/assets/.packs/0.bin",
]) {
  for (const method of ["GET", "HEAD"]) {
    const result = await request(path, { method });
    assert.equal(result.status, 401, `${method} ${path} must be private`);
    assert.match(result.headers.get("cache-control"), /no-store/);
  }
}
console.log("PASS: deployed static assets cannot bypass board authorization");
const sitemap = await request("/sitemap.xml");
assert.equal(sitemap.status, 200);
const xml = await sitemap.text();
const articles = [
  ...xml.matchAll(/<loc>(https:\/\/www\.narfid\.com\/articles\/[^<]+)<\/loc>/g),
];
assert.ok(articles.length > 0, "Published articles remain in sitemap");
const path = new URL(articles[0][1]).pathname;
const article = await request(path);
assert.equal(article.status, 200);
assert.ok((await article.text()).includes(`https://www.narfid.com${path}`));
assert.equal(
  (await request("/articles/this-article-does-not-exist-migration-check"))
    .status,
  404,
);
console.log("PASS: published articles render and missing articles return 404");
const accounts = JSON.parse(
  await readFile(
    new URL("../.private/board-accounts.json", import.meta.url),
    "utf8",
  ),
);
const account = accounts.accounts.find(
  (a) => a.email === "chairman@nerfed.example",
);
assert.ok(account);
const login = form(await (await request("/login")).text());
login.append("email", account.email);
login.append("password", account.password);
assert.equal(
  (
    await request("/login", {
      method: "POST",
      body: login,
      headers: { Origin: base },
    })
  ).status,
  303,
);
const image = await request(asset);
assert.equal(image.status, 200);
assert.match(image.headers.get("cache-control"), /private.*no-store/);
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
assert.equal(
  hash(Buffer.from(await image.arrayBuffer())),
  hash(await readFile("content/marketing/assets/instagram/01-brand.png")),
);
const guide = await request("/board/business-rules");
assert.equal(guide.status, 200);
assert.ok((await guide.text()).includes("قواعد"));
assert.equal(
  (await request("/api/board/marketing/assets/business-rules.md")).status,
  404,
);
assert.equal(
  (await request("/api/board/marketing/assets/.packs/0.bin")).status,
  404,
);
assert.equal((await request("/board/marketing/videos")).status, 404);
console.log(
  "PASS: chairman can read original marketing files and business rules; video section is absent",
);
if (process.env.CLOUDFLARE_TEST_ARCHIVES === "1") {
  const archive = await request("/api/board/marketing/assets/all-posts.zip");
  assert.equal(archive.status, 200);
  assert.equal(archive.headers.get("content-type"), "application/zip");
  let tail = Buffer.alloc(0),
    length = 0;
  for await (const chunk of archive.body) {
    length += chunk.byteLength;
    tail = Buffer.concat([tail, Buffer.from(chunk)]).subarray(-22);
  }
  assert.ok(length > 1000000, "Archive must contain original image data");
  assert.equal(
    tail.readUInt32LE(0),
    0x06054b50,
    "Complete ZIP central directory required",
  );
  assert.ok(tail.readUInt16LE(10) > 0);
  console.log(`PASS: complete all-posts ZIP streamed (${length} bytes)`);
}
const board = await request("/board");
const logout = form(await board.text());
assert.equal(
  (
    await request("/board", {
      method: "POST",
      body: logout,
      headers: { Origin: base },
    })
  ).status,
  303,
);
assert.equal((await request(asset)).status, 401);
console.log("PASS: protected assets become inaccessible after logout");
