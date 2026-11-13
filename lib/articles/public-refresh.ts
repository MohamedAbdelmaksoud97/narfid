import "server-only";

export type PublicRefresh = { status: "queued" | "failed"; buildId?: string };

export async function refreshPublicSite(): Promise<PublicRefresh> {
  const hook = process.env.NARFID_PUBLIC_REBUILD_HOOK;
  if (!hook) return { status: "failed" };
  try {
    const url = new URL(hook);
    if (url.origin !== "https://api.cloudflare.com" ||
        !/^\/client\/v4\/workers\/builds\/deploy_hooks\/[0-9a-f-]+$/.test(url.pathname) ||
        url.search || url.hash || url.username || url.password) return { status: "failed" };
    const response = await fetch(url, {
      method: "POST",
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    const body = await response.json();
    if (!response.ok || body.success !== true || typeof body.result?.build_uuid !== "string")
      return { status: "failed" };
    return { status: "queued", buildId: body.result.build_uuid };
  } catch {
    // Never log the hook URL: its identifier is a deployment credential.
    return { status: "failed" };
  }
}
