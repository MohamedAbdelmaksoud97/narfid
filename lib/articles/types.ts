import type { JSONContent } from "@tiptap/core";

export type Category = { id: string; name: string; slug: string };
export type ArticleFields = {
  title: string;
  slug: string;
  excerpt: string;
  content: JSONContent;
  cover_image_url: string | null;
  cover_image_alt: string;
  category_id: string | null;
  tags: string[];
  seo_title: string;
  seo_description: string;
  direction: "rtl" | "ltr";
};
export type Article = ArticleFields & {
  id: string;
  author_id: string;
  author_name: string;
  status: "draft" | "published";
  revision: number;
  published_revision: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};
export type Publication = ArticleFields & {
  id: string;
  author_name: string;
  revision: number;
  published_at: string;
  updated_at: string;
};
export const EMPTY_DOCUMENT: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};
export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export function slugify(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\p{M}/gu, "")
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 150)
    .replace(/-+$/g, "");
}
export function articleFields(article: Article): ArticleFields {
  const {
    title,
    slug,
    excerpt,
    content,
    cover_image_url,
    cover_image_alt,
    category_id,
    tags,
    seo_title,
    seo_description,
    direction,
  } = article;
  return {
    title,
    slug,
    excerpt,
    content,
    cover_image_url,
    cover_image_alt,
    category_id,
    tags,
    seo_title,
    seo_description,
    direction,
  };
}
export function documentText(doc: JSONContent): string {
  return doc.text ?? (doc.content ?? []).map(documentText).join(" ");
}
export function pageNumber(value: string | string[] | undefined) {
  const number = Number(Array.isArray(value) ? value[0] : value);
  return Number.isSafeInteger(number) && number > 0
    ? Math.min(number, 10000)
    : 1;
}
export function youtubeId(src: unknown): string | null {
  if (typeof src !== "string") return null;
  try {
    const url = new URL(src);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    const host = url.hostname.toLowerCase();
    const id =
      host === "youtu.be"
        ? url.pathname.slice(1)
        : [
              "youtube.com",
              "www.youtube.com",
              "www.youtube-nocookie.com",
            ].includes(host)
          ? url.pathname === "/watch"
            ? url.searchParams.get("v")
            : url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)$/)?.[1]
          : null;
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}
