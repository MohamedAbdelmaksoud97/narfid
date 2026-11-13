import { PhotonImage, SamplingFilter, resize } from "@cf-wasm/photon";
import { imageSize } from "image-size";

function dimensions(bytes: Uint8Array) {
  const metadata = imageSize(bytes);
  // Bound allocation before decoding; Workers have a 128 MiB isolate limit.
  if (
    !metadata.width ||
    !metadata.height ||
    metadata.width > 10000 ||
    metadata.height > 10000 ||
    metadata.width * metadata.height > 4000000
  )
    throw new Error("Image dimensions");
  return metadata;
}

export async function inspectArticleImage(bytes: Uint8Array) {
  const metadata = dimensions(bytes);
  const image = PhotonImage.new_from_byteslice(bytes);
  try {
    if (
      image.get_width() !== metadata.width ||
      image.get_height() !== metadata.height
    )
      throw new Error("Image dimensions mismatch");
    const rotated = [5, 6, 7, 8].includes(metadata.orientation ?? 1);
    return {
      width: rotated ? metadata.height : metadata.width,
      height: rotated ? metadata.width : metadata.height,
    };
  } finally {
    image.free();
  }
}

function orient(image: PhotonImage, orientation: number) {
  if (orientation <= 1 || orientation > 8) return image;
  const w = image.get_width(),
    h = image.get_height();
  const rotated = orientation >= 5;
  const width = rotated ? h : w,
    height = rotated ? w : h;
  const source = image.get_raw_pixels();
  const output = new Uint8Array(source.length);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const [dx, dy] =
        orientation === 2
          ? [w - 1 - x, y]
          : orientation === 3
            ? [w - 1 - x, h - 1 - y]
            : orientation === 4
              ? [x, h - 1 - y]
              : orientation === 5
                ? [y, x]
                : orientation === 6
                  ? [h - 1 - y, x]
                  : orientation === 7
                    ? [h - 1 - y, w - 1 - x]
                    : [y, w - 1 - x];
      const from = (y * w + x) * 4,
        to = (dy * width + dx) * 4;
      output.set(source.subarray(from, from + 4), to);
    }
  return new PhotonImage(output, width, height);
}

export async function resizeArticleImage(
  bytes: Uint8Array,
  requestedWidth: number,
) {
  const metadata = dimensions(bytes);
  const decoded = PhotonImage.new_from_byteslice(bytes);
  let oriented: PhotonImage | undefined, output: PhotonImage | undefined;
  try {
    oriented = orient(decoded, metadata.orientation ?? 1);
    const width = Math.min(requestedWidth, oriented.get_width());
    const height = Math.max(
      1,
      Math.round((oriented.get_height() * width) / oriented.get_width()),
    );
    output = resize(oriented, width, height, SamplingFilter.Lanczos3);
    return output.get_bytes_webp();
  } finally {
    output?.free();
    if (oriented && oriented !== decoded) oriented.free();
    decoded.free();
  }
}
