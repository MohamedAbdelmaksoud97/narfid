import Image from "next/image";
import Link from "next/link";
import { ArrowUpLeft, Check, Palette, ScanLine, Type } from "lucide-react";
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
        aria-label="عرض لمكونات الهوية باستخدام هوية نرفد: الشعار والألوان والخطوط والتطبيقات. هوية كل مؤسسة تُصمم لها بشكل مستقل."
      >
        <div className="identity-preview-grid" aria-hidden="true">
          <div className="identity-logo-tile">
            <ScanLine />
            <Image
              src="/logo.png"
              alt=""
              width={1672}
              height={941}
              sizes="(max-width: 700px) 200px, 280px"
            />
            <span>وضوح في كل ظهور.</span>
          </div>
          <div className="identity-type-tile">
            <Type />
            <strong>أ ب ج</strong>
            <span>حروف تحمل شخصيتك</span>
            <small dir="ltr">Aa Bb Cc</small>
          </div>
          <div className="identity-color-tile">
            <i />
            <i />
            <i />
            <span>ألوان تصنع الانطباع</span>
          </div>
          <div className="identity-member-tile">
            <span>تجربة متّسقة</span>
            <strong>
              من أول انطباع.
              <br />
              إلى كل زيارة.
            </strong>
            <div>
              <span>العضوية</span>
              <span>الحجوزات</span>
              <span>التواصل</span>
            </div>
          </div>
        </div>
        <p>نموذج تطبيقي بهوية نرفد؛ لكل مؤسسة هوية تعبّر عنها.</p>
      </div>
    </section>
  );
}
