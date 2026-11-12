import type { Metadata } from "next";
import { Suspense } from "react";
import { requireMarketingAccess } from "@/lib/marketing/server";
import { socialPosts } from "@/lib/marketing/social";
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
        <h1>مكتبة منشورات نرفد</h1>
        <p>
          {socialPosts.length.toLocaleString("ar-SA")} منشورًا مصورًا مع النص
          والوصف البديل والوجهة المقترحة، ودليل محتوى مستقل لكل منصة.
        </p>
        <AllPostsDownload />
      </header>
      <MarketingNavigation active="social" />
      <PlatformCards />
      <Alert>
        <AlertTitle>حزمة للمراجعة والنشر اليدوي</AlertTitle>
        <AlertDescription>
          تتضمن المكتبة تصاميم مصورة ولقطات من واجهات النظام ببيانات عرض
          تجريبية. راجع سجل النشر، وعاين قص الصورة والنص والرابط داخل المنصة قبل
          النشر.
        </AlertDescription>
      </Alert>
      <section className="marketing-chapter">
        <header>
          <h2>كيف تستخدم الحزمة؟</h2>
        </header>
        <ol className="marketing-use-steps">
          <li>
            <strong>اختر المنصة.</strong> اقرأ دليلها والجمهور والتصور الإبداعي،
            ثم اختر من التصنيفات وراجع حالة نشر المنشور وترتيبه المقترح.
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
            <strong>سجّل وتعلّم.</strong> فعّل زر «تم نشره» على بطاقة المنشور بعد
            نشره؛ تُحفظ الحالة وتاريخ تسجيلها لباقي أعضاء الإدارة. راجع الأسئلة
            والطلبات المؤهلة وحوّل التحسين التالي إلى مهمة للفريق.
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
