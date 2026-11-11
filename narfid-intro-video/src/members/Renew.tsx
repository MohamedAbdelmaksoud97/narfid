import { Glyph, Phone, Stage, TextBlock, useReveal } from "./Visuals";

export function Renew() {
  const enter = useReveal(3.2);
  return (
    <Stage>
      <TextBlock
        label="التجديد"
        title={
          <>
            التجديد من
            <br />
            صفحة «عضويتي»
          </>
        }
        description="يراجع العضو تفاصيل التجديد ويرسل الطلب، ويكتمل التجديد بعد السداد."
      />
      <Phone
        screen="renewal"
        alt="مراجعة تجديد الاشتراك قبل إنشاء الطلب"
        focus={{ at: 2.8, x: 35, y: 68 }}
      />
      <div
        className="members-float-card"
        style={{ opacity: enter, translate: `0 ${(1 - enter) * 32}px` }}
      >
        <div className="members-icon">
          <Glyph icon="renew" />
        </div>
        <div>
          <strong>طلب التجديد</strong>
          <span>مرتبط بالاشتراك الحالي</span>
        </div>
      </div>
    </Stage>
  );
}
