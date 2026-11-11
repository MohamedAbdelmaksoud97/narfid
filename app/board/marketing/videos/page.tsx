import type { Metadata } from "next";
import { Suspense } from "react";
import { requireMarketingAccess } from "@/lib/marketing/server";
import { MarketingNavigation } from "@/components/board/marketing/marketing-shared";
import { VideoLibrary } from "@/components/board/marketing/video-library";

export const metadata: Metadata = {
  title: "خطة الفيديو | مجلس إدارة نرفد",
  robots: { index: false, follow: false },
};
async function Workspace() {
  await requireMarketingAccess();
  return (
    <main className="marketing-guide container video-page">
      <header className="video-page-header">
        <span className="section-kicker">مكتبة إنتاج الفيديو</span>
        <h1>فكرة واضحة. مشهد يخدمها.</h1>
        <p>
          خمسون فكرة جديدة لنرفد، بنصوص جاهزة لإنتاجها باستخدام Remotion. متابعة
          الإنتاج والنشر في مكان واحد.
        </p>
      </header>
      <MarketingNavigation active="videos" />
      <VideoLibrary />
    </main>
  );
}
export default function VideosPage() {
  return (
    <Suspense
      fallback={
        <main className="board-loading-page">
          <p role="status">جارٍ فتح خطة الفيديو…</p>
        </main>
      }
    >
      <Workspace />
    </Suspense>
  );
}
