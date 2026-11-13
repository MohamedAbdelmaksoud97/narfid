import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { resizeArticleImage } from "../lib/articles/image-processing";
import type { JSONContent } from "@tiptap/core";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const sources = new Set<string>();
const media = /^\/media\/articles\/([0-9a-f-]{36}\/([0-9a-f-]{36})\.(?:png|jpg|webp|gif))$/;
function add(value: unknown) {
  if (typeof value === "string" && media.test(value) && !value.endsWith(".gif")) sources.add(value);
}
function visit(node: JSONContent) {
  if (node.type === "image") add(node.attrs?.src);
  node.content?.forEach(visit);
}
for (let start = 0; ; start += 500) {
  const { data, error } = await client.from("article_publications")
    .select("cover_image_url,content").order("id").range(start, start + 499);
  if (error) throw new Error("Cannot prepare published article images");
  for (const article of data) {
    add(article.cover_image_url);
    visit(article.content);
  }
  if (data.length < 500) break;
}
const widths = [320, 640, 960, 1440, 1920];
for (const source of sources) {
  const path = source.match(media)![1];
  const { data, error } = await client.storage.from("article-media").download(path);
  if (error || !data) throw new Error(`Cannot read published image ${source}: ${error?.message ?? "empty response"}`);
  const bytes = new Uint8Array(await data.arrayBuffer());
  for (const width of widths) {
    const output = `.cloudflare/output/v0/workers/default/assets/_vinext/article-media/${path}/w${width}.webp`;
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, await resizeArticleImage(bytes, width));
  }
}
console.log(`Prepared ${sources.size * widths.length} responsive variants for ${sources.size} published images; no draft images included.`);
