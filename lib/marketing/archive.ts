import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { Readable } from "node:stream";
import { Zip, ZipPassThrough } from "fflate";
import {
  postFilename,
  postsFor,
  socialPlatforms,
  type PlatformId,
} from "./social";

export function marketingArchiveFiles(platform: PlatformId | "all") {
  return socialPlatforms
    .filter((item) => platform === "all" || item.id === platform)
    .flatMap((item) =>
      postsFor(item.id).flatMap((post) => {
        const image = `${item.id}/${postFilename(post)}`;
        return [image, image.replace(/\.png$/, ".txt")];
      }),
    );
}

async function* archiveChunks(root: string, files: string[]) {
  const pending: Uint8Array[] = [];
  const zip = new Zip((error, bytes) => {
    if (error) throw error;
    pending.push(bytes);
  });
  try {
    // PNGs are already compressed. Store them verbatim; read only one file at
    // a time and yield before proceeding so a slow download applies backpressure.
    for (const name of files) {
      const bytes = await readFile(join(root, name));
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
export async function createMarketingArchive(platform: PlatformId | "all") {
  const root = join(process.cwd(), "content/marketing/assets");
  const files = marketingArchiveFiles(platform);
  // Fail before sending a successful response if an export is incomplete.
  await Promise.all(
    files.map(async (name) => {
      if (!(await stat(join(root, name))).isFile())
        throw new Error("Missing marketing asset");
    }),
  );
  const source = Readable.from(archiveChunks(root, files), {
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
