import type { Metadata } from "next";

// One origin for metadata, JSON-LD and sitemaps. Local/preview builds stay noindex.
export function siteOrigin() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = new URL(raw);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  )
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be an origin without a path or credentials",
    );
  return url.origin;
}
export function indexingEnabled() {
  const url = new URL(siteOrigin());
  return (
    process.env.SITE_INDEXING_ENABLED === "true" &&
    url.protocol === "https:" &&
    !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) &&
    process.env.VERCEL_ENV !== "preview"
  );
}
export function absoluteUrl(path: string) {
  return new URL(path, siteOrigin()).href;
}
export function pageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  return {
    title: `${title} | نرفد`,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type: "website",
      locale: "ar_SA",
      images: [
        { url: "/logo.png", alt: "نرفد — السند التقني للمؤسسات الرياضية" },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/logo.png"],
    },
  };
}
export const publicAuthor = {
  slug: "nerved-team",
  name: "فريق نرفد",
  path: "/authors/nerved-team",
  bio: "فريق بناء نرفد، مزوّد تقني للمؤسسات الرياضية. نشارك خبرتنا في بناء نظام يربط الاشتراكات والحجوزات ونقاط البيع والمطبخ والمخزون والفروع، ونوضح حدود كل وظيفة قبل اقتراحها.",
};
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: "نرفد",
    alternateName: "narfid",
    url: siteOrigin(),
    logo: absoluteUrl("/logo.png"),
    description: "السند التقني للمؤسسات الرياضية",
  };
}
export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
export function structuredJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
