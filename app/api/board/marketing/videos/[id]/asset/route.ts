import { taskSession, taskFailure, TaskError } from "@/lib/tasks-server";
import { findVideo } from "@/lib/marketing/video-briefs";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const client = await taskSession();
    const { id } = await context.params;
    if (!findVideo(id)) throw new TaskError("الفيديو غير موجود.", 404);
    const { data, error } = await client
      .from("marketing_video_productions")
      .select("output_path")
      .eq("video_id", id)
      .single();
    if (error) throw new TaskError("تعذر تحميل ملف الفيديو.", 503);
    if (!data.output_path)
      throw new TaskError("لم يُرفق ملف إنتاج لهذا الفيديو بعد.", 404);
    const download = new URL(request.url).searchParams.get("download") === "1";
    const signed = await client.storage
      .from("marketing-videos")
      .createSignedUrl(
        data.output_path,
        120,
        download ? { download: `${id}.mp4` } : undefined,
      );
    if (signed.error) throw new TaskError("تعذر فتح ملف الفيديو.", 503);
    return new Response(null, {
      status: 302,
      headers: {
        Location: signed.data.signedUrl,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return taskFailure(error);
  }
}
