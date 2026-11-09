import test from "node:test";
import assert from "node:assert/strict";
import robots from "../app/robots";
import { absoluteUrl, canonicalRedirectUrl, indexingEnabled, organizationSchema, siteOrigin } from "../lib/seo";

function withEnv(values: Record<string, string | undefined>, run: () => void) {
  const keys = ["NODE_ENV", "VERCEL_ENV", "NEXT_PUBLIC_SITE_URL", "SITE_INDEXING_ENABLED"];
  const before = keys.map((key) => process.env[key]);
  try {
    for (const key of keys) {
      if (values[key] === undefined) delete process.env[key];
      else process.env[key] = values[key];
    }
    run();
  } finally {
    keys.forEach((key, i) => {
      if (before[i] === undefined) delete process.env[key];
      else process.env[key] = before[i];
    });
  }
}

test("the launched Vercel production site uses the public domain and permits discovery", () => {
  withEnv({ NODE_ENV: "production", VERCEL_ENV: "production" }, () => {
    assert.equal(siteOrigin(), "https://www.narfid.com");
    assert.equal(absoluteUrl("/logo.png"), "https://www.narfid.com/logo.png");
    assert.equal(absoluteUrl("/articles/example"), "https://www.narfid.com/articles/example");
    assert.equal(organizationSchema().url, "https://www.narfid.com");
    assert.equal(indexingEnabled(), true);
    assert.deepEqual(robots(), {
      rules: { userAgent: "*", allow: "/", disallow: ["/board", "/login", "/api/"] },
      sitemap: "https://www.narfid.com/sitemap.xml",
    });
  });
});

test("development, previews and local production builds stay excluded from indexing", () => {
  for (const values of [
    { NODE_ENV: "development" },
    { NODE_ENV: "production" },
    { NODE_ENV: "production", VERCEL_ENV: "preview", SITE_INDEXING_ENABLED: "true" },
    { NODE_ENV: "development", VERCEL_ENV: "production", SITE_INDEXING_ENABLED: "true" },
    { VERCEL_ENV: "development", NEXT_PUBLIC_SITE_URL: "https://www.narfid.com", SITE_INDEXING_ENABLED: "true" },
  ]) {
    withEnv(values, () => {
      assert.equal(indexingEnabled(), false, JSON.stringify(values));
      assert.deepEqual(robots(), { rules: { userAgent: "*", disallow: "/" } });
    });
  }
  withEnv({ NODE_ENV: "development" }, () => {
    assert.equal(siteOrigin(), "http://localhost:3000");
  });
});

test("an explicit indexing opt-out wins on the public production site", () => {
  withEnv({ NODE_ENV: "production", VERCEL_ENV: "production", SITE_INDEXING_ENABLED: "false" }, () => {
    assert.equal(indexingEnabled(), false);
    assert.equal(siteOrigin(), "https://www.narfid.com");
    assert.deepEqual(robots(), { rules: { userAgent: "*", disallow: "/" } });
  });
});

test("custom deployments retain origin overrides and require an indexing opt-in", () => {
  withEnv({ NODE_ENV: "production", VERCEL_ENV: "production", NEXT_PUBLIC_SITE_URL: "https://custom.example/" }, () => {
    assert.equal(siteOrigin(), "https://custom.example");
    assert.equal(indexingEnabled(), false);
    process.env.SITE_INDEXING_ENABLED = "true";
    assert.equal(indexingEnabled(), true);
  });
  for (const origin of ["http://www.narfid.com", "https://localhost", "https://127.0.0.1", "https://[::1]"]) {
    withEnv({ NODE_ENV: "production", VERCEL_ENV: "production", NEXT_PUBLIC_SITE_URL: origin, SITE_INDEXING_ENABLED: "true" }, () => {
      assert.equal(indexingEnabled(), false, origin);
    });
  }
});

test("canonical redirects use the public host behind HTTPS termination without looping", () => {
  withEnv({ NODE_ENV: "production", VERCEL_ENV: "production" }, () => {
    const nextUrl = new URL("http://127.0.0.1:3014/articles/example?page=2");
    assert.equal(canonicalRedirectUrl({ nextUrl, headers: new Headers({ host: "www.narfid.com", "x-forwarded-proto": "https" }) }), null);
    for (const headers of [
      new Headers({ host: "narfid.com", "x-forwarded-proto": "https" }),
      new Headers({ host: "www.narfid.com", "x-forwarded-proto": "http" }),
      new Headers(),
    ]) {
      const target = canonicalRedirectUrl({ nextUrl, headers });
      assert.equal(target?.href, "https://www.narfid.com/articles/example?page=2");
      assert.equal(canonicalRedirectUrl({ nextUrl: target!, headers: new Headers({ host: "www.narfid.com", "x-forwarded-proto": "https" }) }), null);
    }
    // A path beginning with two slashes must never become a different host.
    const target = canonicalRedirectUrl({ nextUrl: new URL("https://other.example//external.example/path"), headers: new Headers() });
    assert.equal(target?.origin, "https://www.narfid.com");
  });
  withEnv({ NODE_ENV: "production", VERCEL_ENV: "preview" }, () => {
    assert.equal(canonicalRedirectUrl({ nextUrl: new URL("https://preview.example/"), headers: new Headers() }), null);
  });
});
