import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { getBoardAccount, isBoardUser } from "@/lib/auth/board-accounts";

export async function getBoardMember() {
  const supabase = await createClient();
  // A live Auth lookup checks current administrator-managed membership.
  // Do not authorize from unverified cookies, user_metadata or cached JWT roles.
  const { data, error } = await supabase.auth.getUser();
  if (error || !isBoardUser(data.user)) return null;

  const account = getBoardAccount(data.user?.email);
  if (!account || !data.user) return null;
  return { id: data.user.id, email: account.email, name: account.name };
}

export async function requireBoardMember() {
  const member = await getBoardMember();
  if (!member) redirect("/login");
  return member;
}
