import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { getBoardAccount, isBoardUser } from "@/lib/auth/board-accounts";

export async function getBoardAccess() {
  const supabase = await createClient(15000);
  // A live Auth lookup checks current administrator-managed membership.
  // Do not authorize from unverified cookies, user_metadata or cached JWT roles.
  const { data, error } = await supabase.auth.getUser();
  if (error || !isBoardUser(data.user))
    return { status: "unauthorized" as const };

  const account = getBoardAccount(data.user?.email);
  if (!account || !data.user) return { status: "unauthorized" as const };
  const { data: membership, error: membershipError } = await supabase
    .from("board_members")
    .select("active")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (membershipError) return { status: "unavailable" as const };
  if (!membership?.active) return { status: "forbidden" as const };
  return {
    status: "allowed" as const,
    member: { id: data.user.id, email: account.email, name: account.name },
  };
}

export async function getBoardMember() {
  const access = await getBoardAccess();
  if (access.status === "unavailable")
    throw new Error("تعذر التحقق من صلاحيات لوحة الإدارة. حاول مرة أخرى.");
  return access.status === "allowed" ? access.member : null;
}

export async function requireBoardMember() {
  const member = await getBoardMember();
  if (!member) redirect("/login");
  return member;
}
