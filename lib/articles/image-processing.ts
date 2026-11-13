import sharp from "sharp";

export async function inspectArticleImage(bytes: Uint8Array) {
  const decoder = sharp(bytes, { limitInputPixels: 40000000, pages: 1 });
  const metadata = await decoder.metadata();
  if (
    !metadata.width ||
    !metadata.height ||
    metadata.width > 10000 ||
    metadata.height > 10000
  )
    throw new Error("Image dimensions");
  await decoder.stats();
  const rotated = [5, 6, 7, 8].includes(metadata.orientation ?? 1);
  return {
    width: rotated ? metadata.height : metadata.width,
    height: rotated ? metadata.width : metadata.height,
  };
}

export async function resizeArticleImage(bytes: Uint8Array, width: number) {
  return new Uint8Array(
    await sharp(bytes, { limitInputPixels: 40000000 })
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer(),
  );
}
