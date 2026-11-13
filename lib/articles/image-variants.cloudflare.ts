import { env } from "cloudflare:workers";

export const prebuiltArticleImagesOnly = true;
export async function prebuiltArticleImage(id: string, file: string, width: number) {
  const response = await env.ASSETS.fetch(`https://assets.local/_vinext/article-media/${id}/${file}/w${width}.webp`);
  if (response.ok) return response;
  await response.body?.cancel();
  return null;
}
