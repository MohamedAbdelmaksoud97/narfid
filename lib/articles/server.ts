import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { isBoardUser, getBoardAccount } from "@/lib/auth/board-accounts";
import { ArticleError } from "./validation";
import type { Article, Category, Publication } from "./types";

export async function articleSession() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !isBoardUser(data.user) || !data.user)
    throw new ArticleError("سجّل دخولك بحساب مجلس الإدارة.", 401);
  const { data: membership, error: dbError } = await supabase
    .from("board_members")
    .select("active")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (dbError)
    throw new ArticleError("تعذر الاتصال بمساحة المقالات. حاول مرة أخرى.", 503);
  if (!membership?.active)
    throw new ArticleError("حسابك لا يملك صلاحية تحرير المقالات.", 403);
  return {
    supabase,
    member: { id: data.user.id, name: getBoardAccount(data.user.email)!.name },
  };
}
export async function requireArticleSession() {
  try {
    return await articleSession();
  } catch (error) {
    if (error instanceof ArticleError && error.status === 401)
      redirect("/login");
    throw error;
  }
}
export async function categories(
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  const { data, error } = await supabase
    .from("article_categories")
    .select("*")
    .order("name");
  if (error) throw new ArticleError("تعذر تحميل التصنيفات.", 503);
  return data as Category[];
}
export async function loadArticle(
  id: string,
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new ArticleError("تعذر تحميل المقال.", 503);
  return data as Article | null;
}
// Public reads always use the publishable key and published snapshots only.
export async function publicClient() {
  await connection();
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
      },
    },
  );
}
export async function getPublication(slug: string) {
  const supabase = await publicClient();
  const { data, error } = await supabase
    .from("article_publications")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new ArticleError("تعذر تحميل المقال.", 503);
  return data as Publication | null;
}
export function dbFailure(error: { code?: string } | null) {
  if (error?.code === "23505")
    throw new ArticleError("رابط المقال مستخدم بالفعل. اختر رابطًا آخر.", 409);
  if (error?.code === "23503")
    throw new ArticleError("التصنيف المختار غير موجود. حدّث الصفحة.");
  if (error?.code === "23514")
    throw new ArticleError("حجم أو بيانات المقال تتجاوز الحدود المسموحة.");
  if (error?.code === "P0001")
    throw new ArticleError(
      "المقال تغيّر في جلسة أخرى. انسخ تعديلاتك ثم أعد تحميل الصفحة.",
      409,
    );
  throw new ArticleError(
    "تعذر حفظ المقال. تعديلاتك ما زالت هنا؛ أعد المحاولة.",
    503,
  );
}
