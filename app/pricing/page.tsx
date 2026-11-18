import Link from "next/link";
import { PricingComparison } from "@/components/pricing-comparison";
import { pageMetadata } from "@/lib/seo";
import { PublicPage, ContactCta } from "@/components/public/public-page";
const description =
  "قارن باقات نرفد: أساس ونمو واحتراف وتوسّع، حسب الأعضاء والمستخدمين والمميزات، بأسعار شهرية معلنة ودفع سنوي.";
export const metadata = pageMetadata(
  "باقات إدارة المؤسسات الرياضية السنوية",
  description,
  "/pricing",
);
export default function PricingPage() {
  return (
    <PublicPage
      title="اشتراك سنوي يناسب تشغيل مؤسستك."
      description={description}
      path="/pricing"
      kicker="باقات نرفد"
    >
      <p className="public-lead">
        اختر الباقة حسب عدد الأعضاء والمستخدمين والمميزات. الأسعار بالريال السعودي؛ القيمة
        الشهرية للمقارنة، والتعاقد والفوترة سنويًا. تُحدد
        الضرائب والتهيئة ونقل البيانات والدعم وأي نطاق إضافي في عرض السعر
        النهائي.
      </p>
      <PricingComparison contactLinks />
      <section className="public-plan-note">
        <h2>شراكة تقنية حسب الاحتياج</h2>
        <p>
          لثلاثة فروع فأكثر أو احتياجات تقنية
          خاصة، نحدد نطاق المنصة والفروع
          والتهيئة والدعم بعرض سعر مخصص. يمكن أن يقتصر الاتفاق على اشتراك
          المنصة للفروع؛ التطبيق الخاص والتكاملات والتطوير تُسعّر بشكل مستقل
          عند الحاجة.{" "}
          <Link href="/technology-partnership">
            تعرّف إلى خطوات الشراكة التقنية.
          </Link>
        </p>
      </section>
      <section className="public-checklist">
        <h2>هوية بصرية بعرض مستقل</h2>
        <p>
          يمكنك طلب تأسيس هوية المؤسسة أو تطويرها أو تجهيز تطبيقاتها الرقمية.
          الخدمة اختيارية وتُسعّر حسب النطاق والتسليمات، منفصلة عن الاشتراك
          السنوي.{" "}
          <Link href="/visual-identity">استكشف خدمة الهوية البصرية.</Link>
        </p>
      </section>
      <section className="public-checklist">
        <h2>قبل اختيار الباقة</h2>
        <ul>
          <li>راجع عدد الفروع والخدمات التي يعمل بها فريقك اليوم.</li>
          <li>حدّد بياناتك الحالية وطريقة نقلها والتحقق منها.</li>
          <li>ناقش التهيئة والتدريب والدعم وأي تكاملات مطلوبة.</li>
          <li>اطلب نطاقًا مكتوبًا يوضح السعر والمدة وما يشمله الاتفاق.</li>
        </ul>
        <p>
          للمقارنة بين المزوّدين، احسب تكلفة السنة الأولى ثم تكلفة التجديد
          لنفس عدد الفروع والخدمات. راجع{" "}
          <Link href="/articles/annual-club-software-cost">
            دليل مقارنة التكلفة السنوية لبرنامج إدارة النادي
          </Link>
          .
        </p>
      </section>
      <ContactCta />
    </PublicPage>
  );
}
