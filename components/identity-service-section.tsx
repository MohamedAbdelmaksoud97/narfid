import Link from "next/link";
import {
  ArrowUpLeft,
  Check,
  Palette,
  QrCode,
  CalendarDays,
  ArrowLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { identityService } from "@/lib/identity-service";

export function IdentityServiceSection() {
  return (
    <section
      id="visual-identity"
      className="identity-service-section container section-space"
      aria-labelledby="identity-service-title"
    >
      <div className="identity-service-copy">
        <span className="section-kicker">
          <Palette aria-hidden="true" /> الهوية البصرية لمؤسستك
        </span>
        <h2 id="identity-service-title">
          شخصية مؤسستك.
          <br />
          <span>حاضرة في كل تفصيلة.</span>
        </h2>
        <p>
          من الشعار إلى تجربة العضو. نؤسس هويتك البصرية أو نطوّرها، ونجهّز
          تطبيقاتها لتظهر مؤسستك باتساق على الموقع والتطبيق والمطبوعات وقنوات
          التواصل.
        </p>
        <ul>
          {[
            "تأسيس هوية جديدة أو تطوير هوية قائمة",
            "شعار وألوان وخطوط ودليل استخدام",
            "تطبيقات رقمية وملفات أصلية حسب النطاق",
          ].map((text) => (
            <li key={text}>
              <Check aria-hidden="true" />
              {text}
            </li>
          ))}
        </ul>
        <Badge variant="outline">
          خدمة اختيارية · عرض سعر مستقل عن اشتراك المنصة
        </Badge>
        <div className="identity-service-actions">
          <a
            href={identityService.requestUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-analytics="whatsapp_click"
            className={buttonVariants({ size: "lg" })}
          >
            ناقش هوية مؤسستك
            <ArrowUpLeft data-icon="inline-end" />
          </a>
          <Link
            href={identityService.path}
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            اكتشف الخدمة
          </Link>
        </div>
      </div>
      <div
        className="identity-service-preview"
        role="img"
        aria-label="تصور لهوية مؤسسة رياضية على بوستر وبطاقة عضوية وتطبيق، بألوان بنفسجية وعاجية."
      >
        <div className="identity-mockup-scene" aria-hidden="true">
          <div className="identity-mockup-poster">
            <span className="identity-mockup-club">ناديك الرياضي</span>
            <strong>
              للحركة
              <br />
              مساحة.
            </strong>
            <div className="identity-mockup-track">
              <i />
              <i />
              <i />
            </div>
            <span className="identity-mockup-poster-note">
              كل يوم. بداية جديدة.
            </span>
          </div>
          <div className="identity-mockup-phone">
            <div className="identity-mockup-phone-camera" />
            <div className="identity-mockup-phone-screen">
              <div className="identity-mockup-app-hero">
                <span>ناديك الرياضي</span>
                <strong>
                  جاهز لخطوتك
                  <br />
                  القادمة؟
                </strong>
                <div className="identity-mockup-app-track">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
              <div className="identity-mockup-app-content">
                <span>مساحتك، بطريقتك.</span>
                <div className="identity-mockup-app-membership">
                  <QrCode />
                  <div>
                    <small>عضويتك</small>
                    <strong>كلّنا حركة</strong>
                  </div>
                </div>
                <div className="identity-mockup-app-booking">
                  <CalendarDays />
                  <span>موعدك القادم</span>
                  <ArrowLeft />
                </div>
                <div className="identity-mockup-app-lines">
                  <i />
                  <i />
                </div>
              </div>
            </div>
          </div>
          <div className="identity-mockup-card">
            <div className="identity-mockup-card-track">
              <i />
              <i />
              <i />
            </div>
            <div className="identity-mockup-card-top">
              <span>ناديك الرياضي</span>
              <QrCode />
            </div>
            <div className="identity-mockup-card-bottom">
              <strong>
                أنت جزء
                <br />
                من الحكاية.
              </strong>
              <span>بطاقة العضوية</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
