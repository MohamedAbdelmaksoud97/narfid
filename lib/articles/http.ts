import "server-only";
import { ArticleError } from "./validation";
import { UUID_RE } from "./types";
export function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
export function failure(error: unknown) {
  if (error instanceof ArticleError)
    return json({ error: error.message }, error.status);
  console.error(
    "Article request failed:",
    error instanceof Error ? error.name : "Unknown error",
  );
  return json({ error: "حدث خطأ غير متوقع. حاول مرة أخرى." }, 500);
}
export function verifyMutation(request: Request) {
  const origin = request.headers.get("origin");
  // Next's internal request URL may use the listening hostname (localhost).
  // Compare the browser Origin with the external host/protocol forwarded by Next.
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
  if (!origin || origin !== `${protocol}://${host}`)
    throw new ArticleError("مصدر الطلب غير صالح.", 403);
}
export function validId(id: string) {
  if (!UUID_RE.test(id)) throw new ArticleError("المقال غير موجود.", 404);
}
export function validRevision(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1)
    throw new ArticleError("إصدار المقال غير صالح.");
  return value;
}
export async function limitedBody(request: Request, limit: number) {
  if (Number(request.headers.get("content-length")) > limit)
    throw new ArticleError("حجم الطلب أكبر من المسموح.", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new ArticleError("الطلب فارغ.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > limit) {
        await reader.cancel();
        throw new ArticleError("حجم الطلب أكبر من المسموح.", 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.length;
  }
  return body;
}
export async function readJson(
  request: Request,
): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new ArticleError("نوع الطلب غير صالح.", 415);
  const bytes = await limitedBody(request, 1100000);
  try {
    const data = JSON.parse(new TextDecoder().decode(bytes));
    if (!data || typeof data !== "object" || Array.isArray(data))
      throw new Error();
    return data;
  } catch {
    throw new ArticleError("بيانات الطلب غير صالحة.");
  }
}
