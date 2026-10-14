import "server-only";
import { createClient } from "@/lib/server";
import { isBoardUser } from "@/lib/auth/board-accounts";
import type { Task } from "@/lib/tasks";

export class TaskError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

export async function taskSession() {
  const supabase = await createClient(15000);
  const { data, error } = await supabase.auth.getUser();
  if (error || !isBoardUser(data.user) || !data.user)
    throw new TaskError("سجّل دخولك بحساب مجلس الإدارة.", 401);
  const membership = await supabase
    .from("board_members")
    .select("active")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (membership.error)
    throw new TaskError("تعذر التحقق من صلاحياتك. حاول مرة أخرى.", 503);
  if (!membership.data?.active)
    throw new TaskError("حسابك لا يملك صلاحية إدارة المهام.", 403);
  return supabase;
}

export async function loadTasks(
  supabase: Awaited<ReturnType<typeof taskSession>>,
) {
  const tasks: Task[] = [];
  // The Data API caps each response; include all tasks beyond the first 1,000.
  for (let start = 0; ; start += 500) {
    const { data, error } = await supabase
      .from("board_tasks")
      .select("*")
      .order("sort_order")
      .order("created_at")
      .order("id")
      .range(start, start + 499);
    if (error) throw new TaskError("تعذر تحميل المهام. حاول مرة أخرى.", 503);
    tasks.push(...(data as Task[]));
    if (data.length < 500) return tasks;
  }
}

export function taskJson(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export function taskFailure(error: unknown) {
  if (error instanceof TaskError)
    return taskJson({ error: error.message }, error.status);
  console.error(
    "Board task request failed:",
    error instanceof Error ? error.name : "Unknown",
  );
  return taskJson({ error: "تعذر تنفيذ العملية. حاول مرة أخرى." }, 500);
}

export async function taskBody(request: Request) {
  const url = new URL(request.url);
  const host = (
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    url.host
  )
    .split(",")[0]
    .trim();
  const protocol = (
    request.headers.get("x-forwarded-proto") || url.protocol.replace(":", "")
  )
    .split(",")[0]
    .trim();
  if (request.headers.get("origin") !== `${protocol}://${host}`)
    throw new TaskError("مصدر الطلب غير صالح.", 403);
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new TaskError("نوع الطلب غير صالح.", 415);
  if (Number(request.headers.get("content-length")) > 32000)
    throw new TaskError("حجم الطلب أكبر من المسموح.", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new TaskError("الطلب فارغ.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 32000) {
        await reader.cancel();
        throw new TaskError("حجم الطلب أكبر من المسموح.", 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  try {
    const data = JSON.parse(new TextDecoder().decode(bytes));
    if (!data || typeof data !== "object" || Array.isArray(data))
      throw new Error();
    return data as Record<string, unknown>;
  } catch {
    throw new TaskError("بيانات الطلب غير صالحة.");
  }
}
