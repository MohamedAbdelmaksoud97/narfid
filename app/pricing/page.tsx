import Link from "next/link";
import { plans } from "@/lib/landing-content";
import { pageMetadata } from "@/lib/seo";
import { PublicPage, ContactCta } from "@/components/public/public-page";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
const description =
  "قارن باقات نرفد السنوية لإدارة المؤسسات الرياضية، من العضويات إلى المطبخ والمخزون والحجوزات والفروع، مع نطاق واضح قبل الاتفاق.";
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
        ابدأ بالخدمات التي تستخدمها فعليًا. الأسعار بالريال السعودي؛ القيمة
        الشهرية للمقارنة، والتعاقد والفوترة سنويًا. تُحدد
        الضرائب والتهيئة ونقل البيانات والدعم وأي نطاق إضافي في عرض السعر
        النهائي.
      </p>
      <p>
        نقاط البيع وورديات الصندوق والفواتير والتحصيل والمرتجعات ضمن كل الباقات
        للخدمات المتاحة فيها. أساس وتشغيل ومتكاملة لفرع واحد، وتوسّع لفرعين.
      </p>
      <div className="public-pricing-grid">
        {plans.map((p) => (
          <Card key={p.name}>
            <CardHeader>
              <CardDescription>
                {p.description} · {p.branches}
              </CardDescription>
              <CardTitle>{p.name}</CardTitle>
              {p.recommended && (
                <Badge variant="secondary">مقترحة للتشغيل المتكامل</Badge>
              )}
            </CardHeader>
            <CardContent>
              <p className="public-price">
                {new Intl.NumberFormat("ar-SA").format(p.annual)}{" "}
                <span>ر.س / سنة</span>
              </p>
              <p className="text-muted-foreground">
                ما يعادل {p.monthly} ر.س شهريًا، بفوترة سنوية.
              </p>
              <h3>{p.intro}</h3>
              <ul>
                {p.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Link
                href="/contact"
                data-analytics="demo_request_start"
                className={buttonVariants({ variant: "outline" })}
              >
                {p.cta}
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
      <section className="public-plan-note">
        <h2>شراكة تقنية حسب الاحتياج</h2>
        <p>
          لثلاثة فروع فأكثر أو احتياجات تقنية خاصة، نحدد نطاق المنصة والفروع
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
