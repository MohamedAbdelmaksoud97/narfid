import { PublicPage } from "@/components/public/public-page";
import { pageMetadata } from "@/lib/seo";
import { whatsappUrl } from "@/lib/landing-content";
import { buttonVariants } from "@/components/ui/button";
const description =
  "تواصل مع نرفد لطلب عرض توضيحي ومراجعة احتياج مؤسستك الرياضية، وعدد فروعها والخدمات والتكاملات المطلوبة.";
export const metadata = pageMetadata(
  "تواصل مع نرفد واحجز عرضًا توضيحيًا",
  description,
  "/contact",
);
export default function Page() {
  return (
    <PublicPage
      title="خلّنا نبدأ من مؤسستك."
      description={description}
      path="/contact"
      kicker="التواصل مع نرفد"
    >
      <section className="public-contact-card">
        <h2>اطلب عرضًا توضيحيًا عبر واتساب</h2>
        <p>
          أرسل اسم المؤسسة وطبيعة نشاطها وعدد الفروع والخدمات التي تريد تنظيمها.
          تساعدنا هذه التفاصيل على ترتيب عرض يناسب طريقة عمل فريقك.
        </p>
        <a
          href={`${whatsappUrl}?text=${encodeURIComponent("مرحبًا نرفد، أرغب في عرض توضيحي ومراجعة احتياج مؤسستي الرياضية.")}`}
          target="_blank"
          rel="noopener noreferrer"
          data-analytics="whatsapp_click"
          className={buttonVariants({ size: "lg" })}
        >
          تواصل عبر واتساب
        </a>
        <p className="text-muted-foreground">
          يفتح الزر محادثة واتساب. يتطلب إرسال الطلب منك؛ فتح المحادثة وحده لا
          يؤكد إرسال الطلب أو حجز موعد.
        </p>
      </section>
      <section className="public-checklist">
        <h2>ما الذي نراجعه في اللقاء؟</h2>
        <ul>
          <li>الأعضاء والاشتراكات والخدمات الحالية.</li>
          <li>الفروع والفريق وطريقة متابعة التشغيل.</li>
          <li>البيانات المطلوب نقلها وخطة التهيئة.</li>
          <li>المطبخ والمخزون والحجوزات والتكاملات بحسب احتياجك.</li>
          <li>الباقة والنطاق والتكلفة السنوية قبل الاتفاق.</li>
        </ul>
      </section>
      <section id="measurement" className="public-plan-note">
        <h2>إحصاءات الموقع الاختيارية</h2>
        <p>
          عند تفعيل Google Analytics على الموقع المنشور، يمكنك السماح بإحصاءات
          الاستخدام أو رفضها. نقيس مشاهدة الصفحات العامة وبدء طلب العرض وفتح
          واتساب؛ لا نرسل بيانات النماذج أو محتوى المقالات الداخلية أو نشاط لوحة
          الإدارة إلى هذه الإحصاءات. فتح واتساب ليس إثباتًا لوصول طلب مبيعات.
        </p>
      </section>
    </PublicPage>
  );
}
