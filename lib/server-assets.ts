import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";

// The Vite build substitutes the Workers implementation of this module.
export async function readServerAsset(name: string) {
  return readFile(join(process.cwd(), name));
}

export async function serverAssetExists(name: string) {
  return (await stat(join(process.cwd(), name))).isFile();
}
