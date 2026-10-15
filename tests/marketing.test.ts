import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { unzipSync } from "fflate";
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

test("four platform-specific sets have thirty unique posts with complete copy", () => {
  assert.equal(socialPlatforms.length, 4);
  assert.equal(socialPosts.length, 120);
  assert.equal(new Set(socialPosts.map((post) => post.headline)).size, 120);
  assert.equal(new Set(socialPosts.map((post) => post.caption)).size, 120);
  for (const platform of socialPlatforms) {
    assert.equal(postsFor(platform.id).length, 30);
    assert.equal(
      postsFor(platform.id).filter((post) => post.screenshot).length,
      20,
    );
    assert.equal(
      new Set(postsFor(platform.id).map((post) => post.scene)).size,
      6,
    );
    for (const post of postsFor(platform.id)) {
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

test("download bundles stream original PNGs and captions without ZIP files on disk", async () => {
  assert.equal(marketingArchiveFiles("all").length, 240);
  const names = marketingArchiveFiles("x");
  assert.equal(names.length, 60);
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

test("all 120 PNGs and lightweight previews match the export manifest", async () => {
  const dir = "content/marketing/assets";
  const manifest = JSON.parse(await readFile(`${dir}/manifest.json`, "utf8"));
  assert.equal(manifest.length, 120);
  assert.equal(
    new Set(manifest.map((entry: { sha256: string }) => entry.sha256)).size,
    120,
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
    }
});
