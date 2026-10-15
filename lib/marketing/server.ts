import "server-only";
import { redirect } from "next/navigation";
import { getBoardMember } from "@/lib/auth/session";
import { createClient } from "@/lib/server";

export async function marketingAccess() {
  const member = await getBoardMember();
  if (!member) return "unauthorized" as const;
  const supabase = await createClient(10000);
  const membership = await supabase
    .from("board_members")
    .select("active")
    .eq("user_id", member.id)
    .maybeSingle();
  if (membership.error) return "unavailable" as const;
  return membership.data?.active
    ? ("allowed" as const)
    : ("forbidden" as const);
}
export async function requireMarketingAccess() {
  const access = await marketingAccess();
  if (access === "unauthorized") redirect("/login");
  if (access !== "allowed")
    throw new Error(
      access === "forbidden"
        ? "حسابك لا يملك صلاحية الوصول إلى التسويق."
        : "تعذر التحقق من صلاحيات التسويق. حاول مرة أخرى.",
    );
}
