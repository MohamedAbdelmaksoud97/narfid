import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { marketingAccess } from "@/lib/marketing/server";
import { createMarketingArchive } from "@/lib/marketing/archive";
import { createClient } from "@/lib/server";
import {
  findPlatform,
  postFilename,
  postsFor,
  socialPlatforms,
} from "@/lib/marketing/social";

const headers = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
};
export async function GET(
  request: Request,
  { params }: { params: Promise<{ asset: string[] }> },
) {
  const access = await marketingAccess();
  if (access !== "allowed")
    return Response.json(
      {
        error:
          access === "unauthorized"
            ? "سجّل دخولك بحساب مجلس الإدارة."
            : access === "forbidden"
              ? "ليس لديك صلاحية الوصول."
              : "تعذر التحقق من الصلاحيات.",
      },
      {
        status:
          access === "unauthorized" ? 401 : access === "forbidden" ? 403 : 503,
        headers,
      },
    );
  const { asset } = await params;
  let valid = false;
  if (asset.length === 1)
    valid = [
      "all-posts.zip",
      ...socialPlatforms.map((platform) => `${platform.id}-posts.zip`),
    ].includes(asset[0]);
  if (asset.length === 2) {
    const platform = findPlatform(asset[0]);
    valid = Boolean(
      platform &&
      postsFor(platform.id).some((post) =>
        [
          postFilename(post),
          postFilename(post).replace(".png", ".preview.webp"),
          postFilename(post).replace(".png", ".txt"),
        ].includes(asset[1]),
      ),
    );
  }
  if (!valid) return new Response(null, { status: 404, headers });
  try {
    const archivePlatform =
      asset.length === 1 && asset[0].endsWith("-posts.zip")
        ? asset[0] === "all-posts.zip"
          ? "all"
          : findPlatform(asset[0].replace(/-posts\.zip$/, ""))?.id
        : undefined;
    if (archivePlatform) {
      const client = await createClient();
      const { data, error } = await client
        .from("social_post_publications")
        .select("platform,post_id")
        .eq("deleted", true);
      if (error) throw new Error("Cannot check deleted posts");
      const excluded = new Set(
        data.map((row) => `${row.platform}/${row.post_id}`),
      );
      return new Response(
        await createMarketingArchive(archivePlatform, excluded),
        {
          headers: {
            ...headers,
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="narfid-${asset[0]}"`,
          },
        },
      );
    }
    const data = await readFile(
      join(process.cwd(), "content/marketing/assets", ...asset),
    );
    const name = asset.at(-1)!;
    const type = name.endsWith(".zip")
      ? "application/zip"
      : name.endsWith(".webp")
        ? "image/webp"
        : name.endsWith(".txt")
          ? "text/plain; charset=utf-8"
          : "image/png";
    const download =
      name.endsWith(".zip") ||
      name.endsWith(".txt") ||
      new URL(request.url).searchParams.get("download") === "1";
    return new Response(data, {
      headers: {
        ...headers,
        "Content-Type": type,
        "Content-Length": String(data.length),
        ...(download
          ? {
              "Content-Disposition": `attachment; filename="narfid-${asset.length === 2 ? `${asset[0]}-` : ""}${name}"`,
            }
          : {}),
      },
    });
  } catch {
    return Response.json(
      { error: "تعذر تحميل الملف. حاول مرة أخرى." },
      { status: 503, headers },
    );
  }
}
