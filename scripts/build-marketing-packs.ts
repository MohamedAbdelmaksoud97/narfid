import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { crc32 } from "node:zlib";
import type { PackedManifest } from "../lib/marketing/packed-archive";

export async function buildMarketingPacks(directory: string) {
  await mkdir(directory, { recursive: true });
  const source = "content/marketing/assets";
  const files = (await readdir(source, { recursive: true }))
    .map((name) => name.replaceAll("\\", "/"))
    .filter((name) => /\.(png|txt)$/.test(name))
    .sort();
  const manifest: PackedManifest = {};
  let number = 0,
    size = 0,
    chunks: Uint8Array[] = [];
  async function flush() {
    if (!size) return;
    await writeFile(join(directory, `${number}.bin`), Buffer.concat(chunks));
    number++;
    size = 0;
    chunks = [];
  }
  for (const name of files) {
    const bytes = await readFile(join(source, name));
    if (bytes.length > 24 * 1024 * 1024)
      throw new Error("Marketing asset exceeds pack size");
    if (size + bytes.length > 24 * 1024 * 1024) await flush();
    manifest[name] = {
      pack: number,
      offset: size,
      size: bytes.length,
      crc: crc32(bytes),
    };
    chunks.push(bytes);
    size += bytes.length;
  }
  await flush();
  if (number > 40)
    throw new Error("Marketing packs need a larger Worker subrequest budget");
  return manifest;
}
