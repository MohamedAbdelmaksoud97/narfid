import { articleSession, dbFailure } from "@/lib/articles/server";
import {
  failure,
  json,
  readJson,
  validId,
  validRevision,
  verifyMutation,
} from "@/lib/articles/http";
import { ArticleError, validateFields } from "@/lib/articles/validation";

type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, context: Context) {
  try {
    verifyMutation(request);
    const { supabase } = await articleSession();
    const { id } = await context.params;
    validId(id);
    const input = await readJson(request);
    const revision = validRevision(input.revision);
    const fields = validateFields(input.fields, id);
    const { data, error } = await supabase
      .from("articles")
      .update(fields)
      .eq("id", id)
      .eq("revision", revision)
      .select("*")
      .maybeSingle();
    if (error) dbFailure(error);
    if (!data)
      throw new ArticleError(
        "المقال تغيّر في جلسة أخرى. انسخ تعديلاتك ثم أعد تحميل الصفحة.",
        409,
      );
    return json({ article: data });
  } catch (error) {
    return failure(error);
  }
}
