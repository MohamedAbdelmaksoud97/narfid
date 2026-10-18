import { Suspense } from "react";
import type { Metadata } from "next";
import { IdentityProjects } from "@/components/board/identity-projects";
export const metadata: Metadata = {
  title: "مشروع الهوية | إدارة نرفد",
  robots: { index: false, follow: false },
};
async function Project({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <IdentityProjects id={id} />;
}
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense
      fallback={
        <p className="board-loading" role="status">
          جارٍ فتح المشروع…
        </p>
      }
    >
      <Project params={params} />
    </Suspense>
  );
}
