import { findPlatform, postsFor } from "@/lib/marketing/social";
import { validatePublication } from "@/lib/marketing/publications";
// Reuse the board's live-membership check, bounded JSON parser and origin check.
import {
  taskSession,
  taskBody,
  taskJson,
  taskFailure,
  TaskError,
} from "@/lib/tasks-server";

const fields = "platform,post_id,published,published_at,revision,updated_at";

export async function GET(request: Request) {
  try {
    const client = await taskSession();
    const platform = findPlatform(
      new URL(request.url).searchParams.get("platform") ?? "",
    );
    if (!platform) throw new TaskError("المنصة غير موجودة.", 404);
    const { data, error } = await client
      .from("social_post_publications")
      .select(fields)
      .eq("platform", platform.id)
      .order("post_id");
    if (error || data.length !== postsFor(platform.id).length)
      throw new TaskError("تعذر تحميل سجل النشر كاملًا. أعد المحاولة.", 503);
    return taskJson({ publications: data });
  } catch (error) {
    return taskFailure(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const client = await taskSession();
    let input;
    const body = await taskBody(request);
    try {
      input = validatePublication(body);
    } catch (error) {
      throw new TaskError((error as Error).message);
    }
    const { data, error } = await client.rpc("set_social_publication", {
      p_platform: input.platform,
      p_post_id: input.post_id,
      p_published: input.published,
      p_revision: input.revision,
    });
    if (error) {
      if (error.code === "PT409")
        throw new TaskError(
          "تغيّرت حالة المنشور من حساب آخر. حُدّث السجل؛ راجع الحالة قبل المحاولة مجددًا.",
          409,
        );
      if (error.code === "42501")
        throw new TaskError("حسابك لا يملك صلاحية تغيير حالة النشر.", 403);
      if (error.code === "P0002")
        throw new TaskError("المنشور غير موجود في سجل النشر.", 404);
      throw new TaskError("تعذر حفظ حالة النشر. أعد المحاولة.", 503);
    }
    // Keep audit user identifiers inside the database.
    const { updated_by: _actor, ...publication } = data;
    void _actor;
    return taskJson({ publication });
  } catch (error) {
    return taskFailure(error);
  }
}
