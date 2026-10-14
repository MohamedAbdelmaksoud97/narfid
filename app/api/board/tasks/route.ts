import { validateTaskAction } from "@/lib/tasks";
import {
  loadTasks,
  taskBody,
  TaskError,
  taskFailure,
  taskJson,
  taskSession,
} from "@/lib/tasks-server";

export async function GET() {
  try {
    return taskJson({ tasks: await loadTasks(await taskSession()) });
  } catch (error) {
    return taskFailure(error);
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await taskSession();
    const body = await taskBody(request);
    if (
      typeof body.action !== "string" ||
      !body.payload ||
      typeof body.payload !== "object" ||
      Array.isArray(body.payload)
    )
      throw new TaskError("بيانات العملية غير صالحة.");
    let payload;
    try {
      payload = validateTaskAction(
        body.action,
        body.payload as Record<string, unknown>,
      );
    } catch (error) {
      throw new TaskError((error as Error).message);
    }
    const { error } = await supabase.rpc("mutate_board_task", {
      action: body.action,
      payload,
    });
    if (error) {
      if (
        error.code === "PT409" ||
        error.code === "40001" ||
        error.code === "23505"
      )
        throw new TaskError(
          "تغيّرت المهمة من حساب آخر. حدّث القائمة ثم أعد المحاولة.",
          409,
        );
      if (error.code === "P0002")
        throw new TaskError("المهمة حُذفت بالفعل. حدّث القائمة.", 404);
      if (error.code === "42501")
        throw new TaskError("حسابك لا يملك صلاحية تعديل المهام.", 403);
      if (error.code === "22023")
        throw new TaskError("بيانات المهمة أو مهمتها الرئيسية غير صالحة.");
      throw new TaskError("تعذر حفظ المهمة. حاول مرة أخرى.", 503);
    }
    return taskJson({ ok: true, tasks: await loadTasks(supabase) });
  } catch (error) {
    return taskFailure(error);
  }
}
