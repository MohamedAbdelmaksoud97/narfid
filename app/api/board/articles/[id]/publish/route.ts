import { articleSession, dbFailure, loadArticle } from "@/lib/articles/server";
import {
  failure,
  json,
  readJson,
  validId,
  validRevision,
  verifyMutation,
} from "@/lib/articles/http";
import {
  ArticleError,
  validateFields,
  validatePublication,
} from "@/lib/articles/validation";
type Context = { params: Promise<{ id: string }> };
export async function POST(request: Request, context: Context) {
  try {
    verifyMutation(request);
    const { supabase } = await articleSession();
    const { id } = await context.params;
    validId(id);
    const input = await readJson(request);
    const revision = validRevision(input.revision);
    if (!["publish", "unpublish"].includes(String(input.action)))
      throw new ArticleError("إجراء غير صالح.");
    const article = await loadArticle(id, supabase);
    if (!article) throw new ArticleError("المقال غير موجود.", 404);
    if (article.revision !== revision)
      throw new ArticleError("المقال تغيّر. حدّث الصفحة قبل النشر.", 409);
    if (input.action === "publish")
      validatePublication(validateFields(article, id));
    const { data, error } = await supabase.rpc(
      input.action === "publish" ? "publish_article" : "unpublish_article",
      { article_id: id, expected_revision: revision },
    );
    if (error) dbFailure(error);
    return json({ article: data });
  } catch (error) {
    return failure(error);
  }
}
