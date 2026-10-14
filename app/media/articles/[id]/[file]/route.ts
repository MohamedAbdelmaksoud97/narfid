import { createClient } from "@/lib/server";
import { UUID_RE } from "@/lib/articles/types";
import sharp from "sharp";
type Context = { params: Promise<{ id: string; file: string }> };
export async function GET(request: Request, context: Context) {
  const { id, file } = await context.params;
  if (
    !UUID_RE.test(id) ||
    !/^[0-9a-f-]{36}\.(png|jpg|webp|gif)$/.test(file) ||
    !UUID_RE.test(file.split(".")[0])
  )
    return new Response(null, { status: 404 });
  const supabase = await createClient();
  // Storage RLS permits active board members or files in a published snapshot.
  const { data, error } = await supabase.storage
    .from("article-media")
    .download(`${id}/${file}`);
  if (error || !data)
    return new Response(null, {
      status: 404,
      headers: { "Cache-Control": "private, no-store" },
    });
  const types: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    webp: "image/webp",
    gif: "image/gif",
  };
  const width = new URL(request.url).searchParams.get("w");
  if (width !== null && !["320", "640", "960", "1440", "1920"].includes(width))
    return new Response(null, { status: 400, headers: { "Cache-Control": "private, no-store" } });
  let body: Blob | Uint8Array = data;
  let contentType = types[file.split(".")[1]];
  if (width && !file.endsWith(".gif")) {
    try {
      body = new Uint8Array(await sharp(await data.arrayBuffer(), { limitInputPixels: 40000000 }).rotate().resize({ width: Number(width), withoutEnlargement: true }).webp({ quality: 82 }).toBuffer());
      contentType = "image/webp";
    } catch { return new Response(null, { status: 422, headers: { "Cache-Control": "private, no-store" } }); }
  }
  return new Response(body as BodyInit, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    },
  });
}
