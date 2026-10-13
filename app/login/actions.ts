"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { getBoardAccount, isBoardUser } from "@/lib/auth/board-accounts";
import type { LoginState } from "@/lib/auth/types";

const invalidCredentials =
  "الإيميل أو كلمة المرور غير صحيحين. راجع البيانات وحاول مرة أخرى.";

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!getBoardAccount(email) || !password || password.length > 256) {
    return { error: invalidCredentials, email: email.slice(0, 254) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.user) {
    if (error?.status === 429) {
      return {
        error: "محاولات الدخول كثيرة. انتظر قليلًا، ثم حاول مرة أخرى.",
        email,
      };
    }
    if (
      error &&
      (error.status === 0 ||
        (typeof error.status === "number" && error.status >= 500))
    ) {
      return {
        error: "تعذّر الاتصال بخدمة تسجيل الدخول. حاول مرة أخرى بعد قليل.",
        email,
      };
    }
    return { error: invalidCredentials, email };
  }

  if (!isBoardUser(data.user)) {
    await supabase.auth.signOut({ scope: "local" });
    return { error: invalidCredentials, email };
  }

  revalidatePath("/", "layout");
  redirect("/board");
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) throw new Error("تعذّر تسجيل الخروج. حاول مرة أخرى.");
  revalidatePath("/", "layout");
  redirect("/login");
}
