import { readServerAsset, serverAssetExists } from "@/lib/server-assets";
import { Readable } from "node:stream";
import { Zip, ZipPassThrough } from "fflate";
import {
  postFilename,
  postsFor,
  socialPlatforms,
  type PlatformId,
} from "./social";

export function marketingArchiveFiles(
  platform: PlatformId | "all",
  excluded = new Set<string>(),
) {
  return socialPlatforms
    .filter((item) => platform === "all" || item.id === platform)
    .flatMap((item) =>
      postsFor(item.id)
        .filter((post) => !excluded.has(`${item.id}/${post.id}`))
        .flatMap((post) => {
          const image = `${item.id}/${postFilename(post)}`;
          return [image, image.replace(/\.png$/, ".txt")];
        }),
    );
}

async function* archiveChunks(files: string[]) {
  const pending: Uint8Array[] = [];
  const zip = new Zip((error, bytes) => {
    if (error) throw error;
    pending.push(bytes);
  });
  try {
    // PNGs are already compressed. Store them verbatim; read only one file at
    // a time and yield before proceeding so a slow download applies backpressure.
    for (const name of files) {
      const bytes = await readServerAsset(`content/marketing/assets/${name}`);
      const entry = new ZipPassThrough(name);
      zip.add(entry);
      entry.push(bytes, true);
      while (pending.length) yield pending.shift()!;
    }
    zip.end();
    while (pending.length) yield pending.shift()!;
  } finally {
    zip.terminate();
  }
}

/** Called only after board authorization; filenames come from the content allowlist. */
export async function createMarketingArchive(
  platform: PlatformId | "all",
  excluded = new Set<string>(),
) {
  const files = marketingArchiveFiles(platform, excluded);
  // Fail before sending a successful response if an export is incomplete.
  // Bound concurrent binding requests as well as open file descriptors.
  for (let index = 0; index < files.length; index += 4) {
    await Promise.all(files.slice(index, index + 4).map(async (name) => {
      if (!(await serverAssetExists(`content/marketing/assets/${name}`)))
        throw new Error(`Missing marketing asset: ${name}`);
    }));
  }
  const source = Readable.from(archiveChunks(files), {
    objectMode: false,
    highWaterMark: 64 * 1024,
  });
  return Readable.toWeb(source, {
    strategy: {
      highWaterMark: 64 * 1024,
      size: (chunk: Uint8Array) => chunk.byteLength,
    },
  }) as ReadableStream<Uint8Array>;
}
