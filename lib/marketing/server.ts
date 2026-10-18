import "server-only";
import { redirect } from "next/navigation";
import { getBoardAccess } from "@/lib/auth/session";

export async function marketingAccess() {
  return (await getBoardAccess()).status;
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
