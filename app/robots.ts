import type { MetadataRoute } from "next";
import { absoluteUrl, indexingEnabled } from "@/lib/seo";
export default function robots(): MetadataRoute.Robots {
  return indexingEnabled()
    ? {
        rules: {
          userAgent: "*",
          allow: "/",
          disallow: ["/board", "/login", "/api/"],
        },
        sitemap: absoluteUrl("/sitemap.xml"),
      }
    : { rules: { userAgent: "*", disallow: "/" } };
}
