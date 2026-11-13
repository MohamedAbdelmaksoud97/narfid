import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import {
  inspectArticleImage,
  resizeArticleImage,
} from "../lib/articles/image-processing.wasm";

test("Workers image decoder accepts supported images and rejects truncated pixels", async () => {
  for (const format of ["png", "jpeg", "webp", "gif"] as const) {
    const bytes = await sharp({
      create: { width: 40, height: 24, channels: 4, background: "#33cc99" },
    })
      .toFormat(format)
      .toBuffer();
    assert.deepEqual(await inspectArticleImage(bytes), {
      width: 40,
      height: 24,
    });
  }
  const bytes = await sharp({
    create: { width: 40, height: 24, channels: 4, background: "#33cc99" },
  })
    .png()
    .toBuffer();
  await assert.rejects(inspectArticleImage(bytes.subarray(0, 40)));
});

test("Workers image variants respect EXIF orientation and never enlarge images", async () => {
  for (let orientation = 1; orientation <= 8; orientation++) {
    const bytes = await sharp({
      create: { width: 40, height: 24, channels: 3, background: "#33cc99" },
    })
      .withMetadata({ orientation })
      .jpeg()
      .toBuffer();
    const expected =
      orientation >= 5 ? { width: 24, height: 40 } : { width: 40, height: 24 };
    assert.deepEqual(await inspectArticleImage(bytes), expected);
    const output = await resizeArticleImage(bytes, 320);
    const metadata = await sharp(output).metadata();
    assert.equal(metadata.format, "webp");
    assert.equal(metadata.width, expected.width);
    assert.equal(metadata.height, expected.height);
  }
});

test("Workers decoder rejects images above its allocation bound before decoding", async () => {
  const bytes = await sharp({
    create: { width: 2001, height: 2000, channels: 3, background: "#ffffff" },
  })
    .png()
    .toBuffer();
  await assert.rejects(inspectArticleImage(bytes), /Image dimensions/);
  await assert.rejects(resizeArticleImage(bytes, 320), /Image dimensions/);
});
