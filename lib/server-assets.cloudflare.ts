import { env } from "cloudflare:workers";

function assetUrl(name: string) {
  const relative =
    name === "BUSINESS_LOGIC.md"
      ? "business-rules.md"
      : name.replace(/^content\/marketing\/assets\//, "");
  if (relative === name || relative.split("/").some((part) => part === ".."))
    throw new Error("Unsupported server asset");
  return `https://assets.local/api/board/marketing/assets/${relative}`;
}

export async function readServerAsset(name: string) {
  const response = await env.ASSETS.fetch(assetUrl(name));
  if (!response.ok) throw new Error("Missing server asset");
  return Buffer.from(await response.arrayBuffer());
}

export async function serverAssetExists(name: string) {
  const response = await env.ASSETS.fetch(assetUrl(name), { method: "HEAD" });
  return response.ok;
}
