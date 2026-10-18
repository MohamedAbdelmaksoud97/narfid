import type { Metadata } from "next";
import { Suspense } from "react";
import { CrmProfile } from "@/components/board/crm/crm-profile";
export const metadata: Metadata = {
  title: "ملف العميل | إدارة نرفد",
  robots: { index: false, follow: false },
};
async function Workspace({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CrmProfile key={id} id={id} kind="client" />;
}
export default function Page(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p role="status">جارٍ فتح الملف…</p>}>
      <Workspace {...props} />
    </Suspense>
  );
}
