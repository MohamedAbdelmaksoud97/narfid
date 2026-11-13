import { env } from "cloudflare:workers";
import manifest from "virtual:narfid-marketing-packs";
import { marketingArchiveFiles } from "./archive";
import { createPackedArchive } from "./packed-archive";
import type { PlatformId } from "./social";
export { marketingArchiveFiles } from "./archive";

export async function createMarketingArchive(
  platform: PlatformId | "all",
  excluded = new Set<string>(),
) {
  return createPackedArchive(
    marketingArchiveFiles(platform, excluded),
    manifest,
    async (pack) => {
      const response = await env.ASSETS.fetch(
        `https://assets.local/api/board/marketing/assets/.packs/${pack}.bin`,
      );
      if (!response.ok) throw new Error("Missing marketing pack");
      return new Uint8Array(await response.arrayBuffer());
    },
  );
}
