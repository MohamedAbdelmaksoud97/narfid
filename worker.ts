import app from "vinext/server/fetch-handler";
export * from "vinext/server/fetch-handler";

// Generated HTML/Flight cache files are implementation details. They must only
// be read through the ASSETS binding after public routing/publication checks.
const worker = {
  fetch(request: Request, env: Cloudflare.Env, context: unknown) {
    let pathname = new URL(request.url).pathname;
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
    return app.fetch(request, env, context);
  },
};
export default worker;
