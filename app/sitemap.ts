import type { MetadataRoute } from "next";
import { publicClient } from "@/lib/articles/server";
import { absoluteUrl } from "@/lib/seo";
import { solutions } from "@/lib/solutions";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const client = await publicClient();
  const pages: MetadataRoute.Sitemap = [
    "/",
    "/articles",
    "/pricing",
    "/about",
    "/contact",
    "/technology-partnership",
    "/authors/nerved-team",
    ...solutions.map((s) => `/solutions/${s.slug}`),
  ].map((path) => ({ url: absoluteUrl(path) }));
  // Read all published snapshots in batches, not PostgREST's first 1,000 rows.
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await client
      .from("article_publications")
      .select("id,slug,updated_at,cover_image_url")
      .order("id")
      .range(offset, offset + 499);
    if (error) throw new Error("Unable to read published sitemap entries");
    for (const article of data)
      pages.push({
        url: absoluteUrl(`/articles/${encodeURIComponent(article.slug)}`),
        lastModified: article.updated_at,
        ...(article.cover_image_url
          ? { images: [absoluteUrl(article.cover_image_url)] }
          : {}),
      });
    if (data.length < 500) break;
  }
  return pages;
}
