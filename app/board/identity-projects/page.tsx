import type { Metadata } from "next";
import { Suspense } from "react";
import { IdentityProjects } from "@/components/board/identity-projects";
export const metadata: Metadata = {
  title: "مشروعات الهوية | إدارة نرفد",
  robots: { index: false, follow: false },
};
async function Workspace({
  searchParams,
}: {
  searchParams: Promise<{ account_id?: string }>;
}) {
  const query = await searchParams;
  return (
    <IdentityProjects
      key={query.account_id ?? "all"}
      initialAccountId={query.account_id}
    />
  );
}
export default function Page(props: {
  searchParams: Promise<{ account_id?: string }>;
}) {
  return (
    <Suspense fallback={<p role="status">جارٍ تحميل المشروعات…</p>}>
      <Workspace {...props} />
    </Suspense>
  );
}
