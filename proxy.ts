import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { updateSession } from "@/lib/proxy";
import { indexingEnabled, siteOrigin } from "@/lib/seo";

export async function proxy(request: NextRequest) {
  if (indexingEnabled() && request.nextUrl.origin !== siteOrigin())
    return NextResponse.redirect(
      new URL(request.nextUrl.pathname + request.nextUrl.search, siteOrigin()),
      308,
    );
  const path = request.nextUrl.pathname;
  const articlePath = path.match(/^\/articles\/([^/]+)\/?$/);
  if (articlePath) {
    const headers = {
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    };
    let slug: string;
    try {
      slug = decodeURIComponent(articlePath[1]);
    } catch {
      return new NextResponse(null, { status: 404, headers });
    }
    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
        global: {
          fetch: (url, init) => fetch(url, { ...init, cache: "no-store" }),
        },
      },
    );
    const { data, error } = await client
      .rpc("resolve_article_slug", { requested_slug: slug })
      .abortSignal(AbortSignal.timeout(8000));
    if (error)
      return new NextResponse("تعذر تحميل المقال مؤقتًا. حاول مرة أخرى.", {
        status: 503,
        headers: {
          ...headers,
          "Content-Type": "text/plain; charset=utf-8",
          "Retry-After": "120",
        },
      });
    if (!data)
      return NextResponse.rewrite(
        new URL("/article-unavailable", request.url),
        { status: 404, headers },
      );
    if (data !== slug) {
      const target = request.nextUrl.clone();
      target.pathname = `/articles/${encodeURIComponent(data)}`;
      return NextResponse.redirect(target, {
        status: 308,
        headers: { "Cache-Control": "private, no-store" },
      });
    }
    return NextResponse.next({
      headers: { "Cache-Control": "private, no-store" },
    });
  }
  if (
    path === "/login" ||
    path.startsWith("/board") ||
    path.startsWith("/api/board/") ||
    path.startsWith("/media/articles/")
  ) {
    const response = await updateSession(request);
    if (!path.startsWith("/media/articles/"))
      response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/board/:path*",
    "/api/board/:path*",
    "/media/articles/:path*",
    "/articles/:path*",
    "/solutions/:path*",
    "/pricing",
    "/about",
    "/contact",
    "/technology-partnership",
    "/authors/:path*",
    "/robots.txt",
    "/sitemap.xml",
  ],
};
