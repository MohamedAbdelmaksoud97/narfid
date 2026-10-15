import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";
import {
  socialPlatforms,
  socialPosts,
  postsFor,
  postFilename,
  trackedDestination,
} from "../lib/marketing/social";

test("four platform-specific sets have ten unique posts with complete copy", () => {
  assert.equal(socialPlatforms.length, 4);
  assert.equal(socialPosts.length, 40);
  assert.equal(new Set(socialPosts.map((post) => post.headline)).size, 40);
  assert.equal(new Set(socialPosts.map((post) => post.caption)).size, 40);
  for (const platform of socialPlatforms) {
    assert.equal(postsFor(platform.id).length, 10);
    for (const post of postsFor(platform.id)) {
      assert.ok(post.caption.length > 50);
      assert.ok(post.alt.length > 30);
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

test("all forty PNGs and lightweight previews match the export manifest", async () => {
  const dir = "content/marketing/assets";
  const manifest = JSON.parse(await readFile(`${dir}/manifest.json`, "utf8"));
  assert.equal(manifest.length, 40);
  assert.equal(
    new Set(manifest.map((entry: { sha256: string }) => entry.sha256)).size,
    40,
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
      const preview = await sharp(
        path.replace(".png", ".preview.webp"),
      ).metadata();
      assert.equal(preview.width, 480);
      const caption = await readFile(path.replace(".png", ".txt"), "utf8");
      assert.ok(caption.startsWith(post.caption));
    }
});
