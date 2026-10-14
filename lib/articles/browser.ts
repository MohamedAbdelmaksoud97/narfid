import { MAX_IMAGE_SIZE } from "./types";
export class ArticleRequestError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function articleRequest<T>(
  url: string,
  options: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: "same-origin",
    cache: "no-store",
  });
  let body;
  try {
    body = await response.json();
  } catch {
    throw new Error("تعذر قراءة الرد. تحقق من الاتصال ثم أعد المحاولة.");
  }
  if (!response.ok)
    throw new ArticleRequestError(
      body.error ?? "تعذر إكمال الطلب.",
      response.status,
    );
  return body as T;
}
export async function uploadArticleImage(
  id: string,
  file: File,
  signal?: AbortSignal,
) {
  return (await uploadArticleImageResult(id, file, signal)).url;
}
export async function uploadArticleImageResult(
  id: string,
  file: File,
  signal?: AbortSignal,
) {
  if (
    !["image/png", "image/jpeg", "image/webp", "image/gif"].includes(
      file.type,
    ) ||
    !file.size ||
    file.size > MAX_IMAGE_SIZE
  )
    throw new Error(
      "ارفع صورة PNG أو JPG أو WebP أو GIF، بحد أقصى 5 ميجابايت.",
    );
  const form = new FormData();
  form.set("file", file);
  return articleRequest<{ url: string; width: number; height: number }>(
    `/api/board/articles/${id}/images`,
    { method: "POST", body: form, signal },
  );
}
