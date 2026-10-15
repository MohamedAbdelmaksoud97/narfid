import type { Metadata } from "next";
import { Suspense } from "react";
import { requireMarketingAccess } from "@/lib/marketing/server";
import {
  AllPostsDownload,
  MarketingNavigation,
  PlatformCards,
} from "@/components/board/marketing/marketing-shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "السوشيال ميديا | تسويق نرفد",
  robots: { index: false, follow: false },
};
async function Workspace() {
  await requireMarketingAccess();
  return (
    <main className="marketing-social container">
      <header className="marketing-page-heading">
        <span className="section-kicker">المحتوى الاجتماعي لنرفد</span>
        <h1>
          أربع منصات.
          <br />
          وصوت نرفد واحد.
        </h1>
        <p>
          لكل منصة دور وجمهور وإيقاع وصياغة. هنا خطة الصور والفيديو، و١٠ منشورات
          مصورة لكل منصة، مع النص والوصف البديل والوجهة المقترحة.
        </p>
        <AllPostsDownload />
      </header>
      <MarketingNavigation active="social" />
      <PlatformCards />
      <Alert>
        <AlertTitle>حزمة للمراجعة والنشر اليدوي</AlertTitle>
        <AlertDescription>
          الصور الأربعون مصممة ومصدّرة بالفعل. لم تُنشر خارجيًا، والفيديوهات
          تصورات للتصوير لاحقًا. اربط الحسابات بوسائل التواصل والدومين المعتمد،
          ثم عاين القص والنص والروابط قبل النشر.
        </AlertDescription>
      </Alert>
      <section className="marketing-chapter">
        <header>
          <h2>كيف تستخدم الحزمة؟</h2>
        </header>
        <ol className="marketing-use-steps">
          <li>
            <strong>اختر المنصة.</strong> اقرأ دليلها والجمهور والتصور الإبداعي،
            ثم راجع المنشورات العشرة وترتيبها المقترح.
          </li>
          <li>
            <strong>حمّل الصورة وانسخ النص.</strong> أضف الوصف البديل داخل
            المنصة، وأكمل الرابط بالدومين الحقيقي؛ لا يوجد دومين تجريبي مطبوع في
            الصور أو النصوص.
          </li>
          <li>
            <strong>راجع واعتمد ثم انشر يدويًا.</strong> الملفات المضغوطة تحتوي
            الصور الأصلية ونصوصها؛ المعاينات الخفيفة للوحة فقط.
          </li>
          <li>
            <strong>سجّل وتعلّم.</strong> دوّن تاريخ النشر والأسئلة والطلبات
            المؤهلة، وحوّل التحسين التالي إلى مهمة للفريق.
          </li>
        </ol>
      </section>
    </main>
  );
}
export default function SocialPage() {
  return (
    <Suspense
      fallback={
        <main className="board-loading-page">
          <p role="status">جارٍ فتح السوشيال ميديا…</p>
        </main>
      }
    >
      <Workspace />
    </Suspense>
  );
}
