import Link from "next/link";
import { Suspense } from "react";
import { PublicPage } from "@/components/public/public-page";
import { RelatedArticles } from "@/components/articles/related-articles";
import {
  pageMetadata,
  publicAuthor,
  absoluteUrl,
  structuredJson,
} from "@/lib/seo";
export const metadata = pageMetadata(
  publicAuthor.name,
  publicAuthor.bio,
  publicAuthor.path,
);
export default function Page() {
  return (
    <PublicPage
      title={publicAuthor.name}
      description={publicAuthor.bio}
      path={publicAuthor.path}
      kicker="كاتب مقالات نرفد"
    >
      <div className="public-feature-sections">
        <section>
          <h2>خبرة مرتبطة بالتشغيل</h2>
          <p>
            تأتي أمثلتنا من بناء منصة إدارة المؤسسات الرياضية وفحص وظائفها
            الفعلية. نركز على أسئلة المالك ومدير العمليات والمسؤول المالي، ونشرح
            أين تساعد الوظيفة وأين يحتاج العميل إلى تقييم أو تكامل منفصل.
          </p>
        </section>
        <section>
          <h2>معايير النشر والمراجعة</h2>
          <p>
            نحدد سؤال القارئ قبل الكتابة، ونستخدم أمثلة توضيحية ولقطات خالية من
            بيانات الأعضاء، ونربط الموضوع بالحل المناسب. نراجع الوصف والروابط
            وحدود الوظائف، ونحدد موعدًا للمراجعة. لا نقدّم نتائج عملاء أو
            اعتمادًا أو أرقام سوق بالتخمين.
          </p>
        </section>
        <section>
          <h2>توضيح أو تصحيح</h2>
          <p>
            لو احتاجت معلومة إلى توضيح أو وجدت رابطًا لا يعمل،{" "}
            <Link href="/contact">تواصل مع نرفد</Link> وحدد المقال والجزء
            المقصود. <Link href="/about">تعرّف إلى الشركة ورسالتها.</Link>
          </p>
        </section>
      </div>
      <Suspense fallback={null}>
        <RelatedArticles />
      </Suspense>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: structuredJson({
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": absoluteUrl(publicAuthor.path),
            name: publicAuthor.name,
            url: absoluteUrl(publicAuthor.path),
            description: publicAuthor.bio,
          }),
        }}
      />
    </PublicPage>
  );
}
