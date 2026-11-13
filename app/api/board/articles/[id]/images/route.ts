import { randomUUID } from "node:crypto";
import { inspectArticleImage } from "@/lib/articles/image-processing";
import { articleSession, loadArticle } from "@/lib/articles/server";
import {
  failure,
  json,
  limitedBody,
  validId,
  verifyMutation,
} from "@/lib/articles/http";
import { ArticleError, imageFormat } from "@/lib/articles/validation";
import { MAX_IMAGE_SIZE } from "@/lib/articles/types";
type Context = { params: Promise<{ id: string }> };
export async function POST(request: Request, context: Context) {
  try {
    verifyMutation(request);
    const { supabase } = await articleSession();
    const { id } = await context.params;
    validId(id);
    if (!(await loadArticle(id, supabase)))
      throw new ArticleError("المقال غير موجود.", 404);
    const bytes = await limitedBody(request, MAX_IMAGE_SIZE + 65536);
    const form = await new Response(bytes, {
      headers: { "Content-Type": request.headers.get("content-type") ?? "" },
    }).formData();
    const file = form.get("file");
    if (!(file instanceof File) || !file.size || file.size > MAX_IMAGE_SIZE)
      throw new ArticleError("اختر صورة بحجم لا يتجاوز 5 ميجابايت.");
    const body = new Uint8Array(await file.arrayBuffer());
    const format = imageFormat(body);
    if (!format || format.type !== file.type)
      throw new ArticleError("ارفع صورة PNG أو JPG أو WebP أو GIF صالحة.");
    let width: number; let height: number;
    try {
      ({ width, height } = await inspectArticleImage(body));
    } catch {
      throw new ArticleError("ملف الصورة تالف أو أبعاده أكبر من المسموح.");
    }
    const path = `${id}/${randomUUID()}.${format.extension}`;
    const { error } = await supabase.storage
      .from("article-media")
      .upload(path, body, {
        contentType: format.type,
        upsert: false,
        cacheControl: "0",
      });
    if (error) throw new ArticleError("تعذر رفع الصورة. حاول مرة أخرى.", 503);
    return json({ url: `/media/articles/${path}`, width, height }, 201);
  } catch (error) {
    return failure(error);
  }
}
