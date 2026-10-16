// Refresh copy and local download bundles without rendering or touching images.
import { writeFile } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { join } from "node:path";
import { Readable } from "node:stream";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import { pipeline } from "node:stream/promises";
import { createMarketingArchive } from "../lib/marketing/archive";
import {
  postFilename,
  postText,
  socialPlatforms,
  socialPosts,
} from "../lib/marketing/social";

async function main() {
  const dir = join(process.cwd(), "content/marketing/assets");
  for (const post of socialPosts) {
    await writeFile(
      join(dir, post.platform, postFilename(post).replace(/\.png$/, ".txt")),
      postText(post),
      "utf8",
    );
  }
  for (const platform of [
    "all",
    ...socialPlatforms.map((item) => item.id),
  ] as const) {
    const stream = await createMarketingArchive(platform);
    await pipeline(
      Readable.fromWeb(stream as NodeReadableStream<Uint8Array>),
      createWriteStream(join(dir, `${platform}-posts.zip`)),
    );
  }
  console.log(
    `Updated ${socialPosts.length} captions and 5 local bundles; PNGs, previews and their manifest were not changed.`,
  );
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
