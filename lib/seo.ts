import type { Metadata } from "next";

const productionSiteOrigin = "https://www.narfid.com";

// One origin for metadata, JSON-LD and sitemaps. Local/preview builds stay noindex.
export function siteOrigin() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production"
      ? productionSiteOrigin
      : "http://localhost:3000");
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
  // The launched Vercel production site is public; explicit false still wins.
  const enabled =
    process.env.SITE_INDEXING_ENABLED ??
    String(
      process.env.VERCEL_ENV === "production" &&
        url.origin === productionSiteOrigin,
    );
  return (
    enabled === "true" &&
    url.protocol === "https:" &&
    !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) &&
    process.env.NODE_ENV !== "development" &&
    !["preview", "development"].includes(process.env.VERCEL_ENV || "")
  );
}
export function absoluteUrl(path: string) {
  return new URL(path, siteOrigin()).href;
}
export function canonicalRedirectUrl(request: { nextUrl: URL; headers: Headers }) {
  // Build-only local prerender requests retain production metadata but do not
  // redirect to the previous deployment. This flag is not a Worker binding.
  if (process.env.NARFID_PRERENDER_PUBLIC === "true") return null;
  if (!indexingEnabled()) return null;
  const target = new URL(siteOrigin());
  // Behind the hosting proxy, nextUrl can contain the internal server origin.
  const host = request.headers.get("host") || request.nextUrl.host;
  const protocol =
    request.headers.get("x-forwarded-proto")?.split(",")[0].trim() ||
    request.nextUrl.protocol.slice(0, -1);
  if (host === target.host && `${protocol}:` === target.protocol) return null;
  target.pathname = request.nextUrl.pathname;
  target.search = request.nextUrl.search;
  return target;
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
