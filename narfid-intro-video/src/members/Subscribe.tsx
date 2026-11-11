import { Img, staticFile } from "remotion";
import { Glyph, Stage, TextBlock, TouchPulse, useReveal } from "./Visuals";

export function Subscribe() {
  const enter = useReveal(0.16);
  const push = useReveal(1.05, 2.4);
  const showInvoice = useReveal(3.15);
  return (
    <Stage tone="paper">
      <TextBlock
        label="الاشتراك"
        title={
          <>
            اختيار الباقة
            <br />
            يبدأ من التطبيق
          </>
        }
        description="يتصفح العضو الباقات المتاحة، ويراجع السعر وتاريخ البداية قبل إرسال الطلب."
      />
      <div
        className="members-package"
        style={{ opacity: enter, translate: `0 ${(1 - enter) * 54}px` }}
      >
        <div
          className="members-package-window"
          style={{ scale: 1 + push * 0.035 }}
        >
          <Img
            alt="عرض مقرّب لباقة عضوية شهرية في التطبيق"
            src={staticFile("members/catalog.png")}
          />
          <TouchPulse at={2.75} x={62} y={72} />
        </div>
      </div>
      <div
        className="members-float-card"
        style={{
          opacity: showInvoice,
          translate: `0 ${(1 - showInvoice) * 32}px`,
        }}
      >
        <div className="members-icon">
          <Glyph icon="list" />
        </div>
        <div>
          <strong>طلب الاشتراك</strong>
          <span>يظهر في نظام النادي</span>
        </div>
      </div>
    </Stage>
  );
}
