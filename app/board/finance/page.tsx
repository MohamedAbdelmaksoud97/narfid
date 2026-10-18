import type { Metadata } from "next";
import { Suspense } from "react";
import { FinanceDashboard } from "@/components/board/finance-dashboard";

export const metadata: Metadata = {
  title: "المالية | إدارة نرفد",
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <Suspense
      fallback={
        <p className="board-loading" role="status">
          جارٍ فتح المالية…
        </p>
      }
    >
      <FinanceDashboard />
    </Suspense>
  );
}
