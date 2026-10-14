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
        ابدأ بالخدمات التي تستخدمها فعليًا. الأسعار التالية مقترحات إطلاق
        بالريال السعودي؛ القيمة الشهرية للمقارنة، والتعاقد المقترح سنوي. تُحدد
        الضرائب والتهيئة ونقل البيانات والدعم وأي نطاق إضافي في عرض السعر
        النهائي.
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
                يعادل {p.monthly} ر.س شهريًا للمقارنة.
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
          تطبيق خاص، أو ربط بوابات متوافقة، أو تكامل مع نظام خارجي: نطاق يُقيّم
          ويُسعّر منفصلًا عن الاشتراك القياسي.{" "}
          <Link href="/technology-partnership">
            تعرّف إلى خطوات الشراكة التقنية.
          </Link>
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
      </section>
      <ContactCta />
    </PublicPage>
  );
}
