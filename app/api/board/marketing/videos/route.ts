import {
  taskSession,
  taskBody,
  taskJson,
  taskFailure,
  TaskError,
} from "@/lib/tasks-server";
import { validateVideoChange } from "@/lib/marketing/video-validation";
import { videoBriefs } from "@/lib/marketing/video-briefs";
import { videoPlatforms } from "@/lib/marketing/video-plan";

const productionFields =
  "video_id,status,attempt_id,output_path,output_metadata,notes,revision,updated_at";
const publicationFields = "video_id,platform,published,published_at,revision";
export async function GET() {
  try {
    const client = await taskSession();
    const [productions, publications] = await Promise.all([
      client
        .from("marketing_video_productions")
        .select(productionFields)
        .order("video_id"),
      client
        .from("marketing_video_publications")
        .select(publicationFields)
        .order("video_id")
        .order("platform"),
    ]);
    if (
      productions.error ||
      publications.error ||
      productions.data.length !== videoBriefs.length ||
      publications.data.length !== videoBriefs.length * videoPlatforms.length
    )
      throw new TaskError("تعذر تحميل سجل الفيديو كاملًا. أعد المحاولة.", 503);
    return taskJson({
      productions: productions.data,
      publications: publications.data,
    });
  } catch (error) {
    return taskFailure(error);
  }
}
export async function PATCH(request: Request) {
  try {
    const client = await taskSession();
    const body = await taskBody(request);
    let change;
    try {
      change = validateVideoChange(body);
    } catch (error) {
      throw new TaskError((error as Error).message);
    }
    const result =
      change.kind === "publication"
        ? await client.rpc("set_marketing_video_publication", {
            p_video_id: change.video_id,
            p_platform: change.platform,
            p_published: change.published,
            p_revision: change.revision,
          })
        : await client.rpc("set_marketing_video_production", {
            p_video_id: change.video_id,
            p_status: change.status,
            p_revision: change.revision,
          });
    if (result.error) {
      const code = result.error.code;
      if (code === "PT409")
        throw new TaskError(
          "تغيّر السجل من جلسة أخرى. حُدّثت البيانات؛ راجعها قبل المحاولة مجددًا.",
          409,
        );
      if (code === "42501")
        throw new TaskError("ليس لديك صلاحية تعديل سجل الفيديو.", 403);
      if (code === "P0002")
        throw new TaskError("الفيديو غير موجود في السجل.", 404);
      throw new TaskError("تعذر حفظ حالة الفيديو. أعد المحاولة.", 503);
    }
    const { updated_by: _actor, ...row } = result.data;
    void _actor;
    return taskJson({ kind: change.kind, row });
  } catch (error) {
    return taskFailure(error);
  }
}
