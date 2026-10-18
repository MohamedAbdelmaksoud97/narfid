import { ArrowUpLeft, Check } from "lucide-react";
import { PublicPage } from "@/components/public/public-page";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  identityOffers,
  identityProcess,
  identityService,
} from "@/lib/identity-service";
import { pageMetadata, absoluteUrl, structuredJson } from "@/lib/seo";

export const metadata = pageMetadata(
  identityService.title,
  identityService.description,
  identityService.path,
);
export default function Page() {
  return (
    <PublicPage
      title="هوية تعبّر عن مؤسستك الرياضية."
      description={identityService.description}
      path={identityService.path}
      kicker="الهوية البصرية · خدمة من نرفد"
    >
      <div className="identity-service-intro">
        <p className="public-lead">
          كل مؤسسة لها جمهور وشخصية وطموح. نترجمها إلى لغة بصرية يمكن لفريقك
          استخدامها باتساق، ونربطها بتجربتك الرقمية ضمن نطاق واضح.
        </p>
        <a
          href={identityService.requestUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-analytics="whatsapp_click"
          className={buttonVariants({ size: "lg" })}
        >
          اطلب عرض سعر للهوية
          <ArrowUpLeft data-icon="inline-end" />
        </a>
      </div>
      <div className="identity-offers">
        {identityOffers.map((offer) => (
          <Card key={offer.key}>
            <CardHeader>
              <CardDescription>{offer.audience}</CardDescription>
              <CardTitle>{offer.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{offer.description}</p>
              <ul>
                {offer.deliverables.map((item) => (
                  <li key={item}>
                    <Check aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
      <section className="public-plan-note">
        <h2>من الشعار إلى تجربة العضو</h2>
        <p>
          نحدد أين تحتاج هويتك أن تظهر: الموقع، تطبيق الأعضاء، بطاقات العضوية،
          قوالب التواصل أو المطبوعات. تُحدّد كل التطبيقات في عرض السعر؛ تطوير
          الموقع أو التطبيق والطباعة وإدارة المحتوى خدمات لها نطاقها وتكلفتها.
        </p>
      </section>
      <section className="identity-process">
        <h2>خطوات واضحة من الفكرة إلى التسليم</h2>
        <ol>
          {identityProcess.map((step, index) => (
            <li key={step.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="public-checklist">
        <h2>ماذا يوضح عرض السعر؟</h2>
        <ul>
          <li>التسليمات المتفق عليها والملفات الأصلية وصيغ التسليم.</li>
          <li>عدد الاتجاهات التصميمية وجولات التعديل وآلية اعتماد العميل.</li>
          <li>المدة ومواعيد المراجعة والدفع وحقوق الاستخدام وتراخيص الأصول.</li>
          <li>
            ما يشمله المشروع وما يُسعّر خارجه، مثل الطباعة أو التصوير أو
            التصميمات المستمرة.
          </li>
        </ul>
      </section>
      <div className="public-feature-sections">
        <section>
          <h2>هل أحتاج لتغيير شعاري؟</h2>
          <p>
            نراجع هويتك الحالية أولًا. قد يكون المطلوب تنظيم الاستخدام أو تطوير
            التطبيقات فقط، ونقترح التغيير حسب احتياج المؤسسة.
          </p>
        </section>
        <section>
          <h2>هل الخدمة ضمن الاشتراك السنوي؟</h2>
          <p>
            الهوية البصرية خدمة اختيارية بعرض سعر واتفاق مستقل. يمكن مناقشتها مع
            مشروع المنصة أو كطلب مستقل، دون اشتراط تغيير باقتك.
          </p>
        </section>
      </div>
      <section className="public-contact-cta">
        <div>
          <h2>خلّنا نتعرّف على شخصية مؤسستك.</h2>
          <p>
            شاركنا اسم المؤسسة وجمهورها وهويتها الحالية والتطبيقات المطلوبة
            وموعد الإطلاق.
          </p>
        </div>
        <a
          href={identityService.requestUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-analytics="whatsapp_click"
          className={buttonVariants({ size: "lg" })}
        >
          ناقش هوية مؤسستك
        </a>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: structuredJson({
            "@context": "https://schema.org",
            "@type": "Service",
            name: identityService.title,
            description: identityService.description,
            url: absoluteUrl(identityService.path),
            provider: { "@id": absoluteUrl("/#organization") },
            areaServed: { "@type": "Country", name: "Saudi Arabia" },
            serviceType: "تأسيس وتطوير الهوية البصرية للمؤسسات الرياضية",
          }),
        }}
      />
    </PublicPage>
  );
}
