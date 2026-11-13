import app from "vinext/server/fetch-handler";
export * from "vinext/server/fetch-handler";

// Generated HTML/Flight cache files are implementation details. They must only
// be read through the ASSETS binding after public routing/publication checks.
const worker = {
  fetch(request: Request, env: Cloudflare.Env, context: unknown) {
    const url = new URL(request.url);
    let pathname = url.pathname;
    try {
      for (let i = 0; i < 3; i++) {
        const decoded = decodeURIComponent(pathname);
        if (decoded === pathname) break;
        pathname = decoded;
      }
    } catch {
      return new Response(null, { status: 404 });
    }
    if (/^\/+_vinext(?:\/+|$)/.test(pathname)) {
      return new Response(null, {
        status: 404,
        headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" },
      });
    }
    // vinext namespaces cache entries reached through next.config rewrites.
    // Resolve the production archive before that pipeline so its prebuilt
    // HTML/Flight key is reused. Keep noncanonical requests untouched so their
    // redirect retains the original public URL.
    if (url.origin === "https://www.narfid.com" && url.pathname === "/articles" &&
        (request.method === "GET" || request.method === "HEAD")) {
      const value = url.searchParams.get("page");
      const number = Number(value);
      const page = Number.isSafeInteger(number) && number > 0 ? Math.min(number, 10000) : 1;
      url.pathname = `/articles/page/${page}`;
      url.searchParams.delete("page");
      request = new Request(url, request);
    }
    return app.fetch(request, env, context);
  },
};
export default worker;
