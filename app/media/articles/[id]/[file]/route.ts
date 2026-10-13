import { createClient } from "@/lib/server";
import { UUID_RE } from "@/lib/articles/types";
type Context = { params: Promise<{ id: string; file: string }> };
export async function GET(_request: Request, context: Context) {
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
  return new Response(data, {
    headers: {
      "Content-Type": types[file.split(".")[1]],
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    },
  });
}
