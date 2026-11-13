import type { Metadata } from "next";
import { readServerAsset } from "@/lib/server-assets";
import { Suspense } from "react";
import { requireBoardMember } from "@/lib/auth/session";
import { BusinessRulesGuide } from "@/components/board/business-rules-guide";

export const metadata: Metadata = {
  title: "قواعد نظام نرفد | لوحة الإدارة",
  description: "دليل تفاعلي شامل لشرح قواعد تشغيل نظام نرفد بلغة واضحة.",
  robots: { index: false, follow: false },
};

async function BusinessRulesPage() {
  await requireBoardMember();
  const sourceText = (await readServerAsset("BUSINESS_LOGIC.md")).toString("utf8");
  return <BusinessRulesGuide sourceText={sourceText} />;
}

export default function Page() {
  return (
    <Suspense fallback={<p className="board-loading" role="status">جارٍ فتح قواعد نظام نرفد…</p>}>
      <BusinessRulesPage />
    </Suspense>
  );
}
