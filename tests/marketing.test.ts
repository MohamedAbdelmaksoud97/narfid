import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { unzipSync } from "fflate";
import { socialCaptions } from "../lib/marketing/captions.ar";
import { socialCategories } from "../lib/marketing/categories";
import { validatePublication, validatePostChange } from "../lib/marketing/publications";
import {
  createMarketingArchive,
  marketingArchiveFiles,
} from "../lib/marketing/archive";
import {
  socialPlatforms,
  socialPosts,
  socialScenes,
  postsFor,
  postFilename,
  trackedDestination,
} from "../lib/marketing/social";

test("five platform-specific sets cover operations, member apps and access integrations", () => {
  assert.equal(socialPlatforms.length, 5);
  assert.equal(socialPosts.length, 242);
  assert.equal(new Set(socialPosts.map((post) => post.headline)).size, 242);
  assert.equal(new Set(socialPosts.map((post) => post.caption)).size, 242);
  for (const platform of socialPlatforms) {
    const posts = postsFor(platform.id);
    const expected = platform.id === "linkedin" ? 10 : 58;
    assert.deepEqual(
      posts.map((post) => post.id),
      Array.from({ length: expected }, (_, index) => String(index + 1).padStart(2, "0")),
    );
    if (platform.id !== "linkedin") {
      assert.equal(socialCaptions[platform.id].length, 50);
      for (const category of socialCategories)
        assert.ok(posts.some((post) => Number(post.id) >= 31 && post.category === category.id));
    }
    assert.equal(
      posts.filter((post) => post.screenshot).length,
      { snapchat: 40, facebook: 40, instagram: 37, x: 37, linkedin: 0 }[platform.id],
    );
    for (const category of socialCategories) {
      assert.ok(posts.some((post) => post.category === category.id));
    }
    assert.ok(new Set(posts.map((post) => post.scene)).size >= 6);
    for (const post of posts) {
      assert.ok(post.caption.length > 50);
      assert.ok(post.alt.length > 30);
      assert.ok(
        post.screenshot
          ? post.alt.includes("لقطة فعلية")
          : post.alt.includes(socialScenes[post.scene].description),
      );
      assert.equal(post.points.length, 3);
      assert.ok(
        post.destination.startsWith("/") && !post.destination.startsWith("//"),
      );
      assert.ok(trackedDestination(post).includes(`utm_source=${platform.id}`));
      assert.ok(!/localhost|nerfed\.example|https?:\/\//.test(post.caption));
      if (post.platform === "x")
        assert.ok(
          [...post.caption].length <= 280,
          `X post ${post.id} is too long`,
        );
    }
  }
});

test("refreshed posts use an image at most three times in any twenty consecutive posts", () => {
  const refreshed = socialPosts.filter(
    (post) => post.platform === "instagram" || post.platform === "x" || post.platform === "linkedin",
  );
  assert.equal(refreshed.length, 126);
  for (const [index, post] of refreshed.entries()) {
    const window = refreshed.slice(Math.max(0, index - 19), index + 1);
    const background = socialScenes[post.scene].file;
    assert.ok(
      window.filter((entry) => socialScenes[entry.scene].file === background).length <= 3,
      `${post.platform}/${post.id} repeats background ${background}`,
    );
    if (post.screenshot) {
      assert.ok(
        window.filter((entry) => entry.screenshot === post.screenshot).length <= 3,
        `${post.platform}/${post.id} repeats screenshot ${post.screenshot}`,
      );
    }
    if (post.cta === "احجز عرضًا توضيحيًا") assert.equal(post.goal, "طلب عرض");
  }
});

test("download bundles stream original PNGs and captions without ZIP files on disk", async () => {
  assert.equal(marketingArchiveFiles("all").length, 484);
  assert.equal(marketingArchiveFiles("linkedin").length, 20);
  const names = marketingArchiveFiles("x");
  assert.equal(names.length, 116);
  const filtered = marketingArchiveFiles("x", new Set(["x/51", "facebook/52"]));
  assert.equal(filtered.length, 114);
  assert.ok(!filtered.some((name) => name.includes("51-member-app")));
  const stream = await createMarketingArchive("x");
  const zip = new Uint8Array(await new Response(stream).arrayBuffer());
  const files = unzipSync(zip);
  assert.deepEqual(Object.keys(files).sort(), names.toSorted());
  for (const name of names) {
    const original = await readFile(`content/marketing/assets/${name}`);
    assert.equal(
      createHash("sha256").update(files[name]).digest("hex"),
      createHash("sha256").update(original).digest("hex"),
    );
  }
});

test("all 242 PNGs and lightweight previews match the export manifest", async () => {
  const dir = "content/marketing/assets";
  const manifest = JSON.parse(await readFile(`${dir}/manifest.json`, "utf8"));
  assert.equal(manifest.length, 242);
  assert.equal(
    new Set(manifest.map((entry: { sha256: string }) => entry.sha256)).size,
    242,
  );
  for (const platform of socialPlatforms)
    for (const post of postsFor(platform.id)) {
      const path = `${dir}/${platform.id}/${postFilename(post)}`;
      const bytes = await readFile(path);
      const image = await sharp(bytes).metadata();
      assert.equal(image.format, "png");
      assert.equal(image.width, platform.width);
      assert.equal(image.height, platform.height);
      assert.ok(bytes.length < 5 * 1024 * 1024);
      const entry = manifest.find(
        (value: { platform: string; file: string }) =>
          value.platform === platform.id && value.file === postFilename(post),
      );
      assert.equal(
        createHash("sha256").update(bytes).digest("hex"),
        entry.sha256,
      );
      assert.equal(entry.scene, post.scene);
      if (post.screenshot)
        assert.equal(entry.screenshot, `${post.screenshot}-${post.imageStyle}`);
      const preview = await sharp(
        path.replace(".png", ".preview.webp"),
      ).metadata();
      assert.equal(preview.width, 480);
      const caption = await readFile(path.replace(".png", ".txt"), "utf8");
      assert.ok(caption.startsWith(post.caption));
      assert.ok(
        caption.includes(
          socialCategories.find((category) => category.id === post.category)!
            .name,
        ),
      );
    }
});

test("publication changes require a known platform/post, a real boolean and a valid revision", () => {
  const good = {
    platform: "snapchat",
    post_id: "31",
    published: true,
    revision: 0,
  };
  assert.deepEqual(validatePublication(good), good);
  const linkedIn = { ...good, platform: "linkedin", post_id: "10" };
  assert.deepEqual(validatePublication(linkedIn), linkedIn);
  assert.throws(() => validatePublication({ ...linkedIn, post_id: "11" }));
  for (const invalid of [
    { platform: "tiktok" },
    { post_id: "59" },
    { post_id: "1" },
    { published: "true" },
    { published: null },
    { revision: -1 },
    { revision: 0.5 },
    { revision: Number.MAX_SAFE_INTEGER + 1 },
    { revision: undefined },
  ])
    assert.throws(() => validatePublication({ ...good, ...invalid }));
});

test("deletion validates stable catalogue identity and revision", () => {
  assert.deepEqual(validatePostChange({ platform: "facebook", post_id: "58", revision: 2 }), { platform: "facebook", post_id: "58", revision: 2 });
  for (const input of [{ platform: "other", post_id: "58", revision: 2 }, { platform: "facebook", post_id: "59", revision: 2 }, { platform: "facebook", post_id: "58", revision: -1 }]) assert.throws(() => validatePostChange(input));
});
