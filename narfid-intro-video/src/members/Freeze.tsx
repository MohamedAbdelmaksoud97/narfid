import { Glyph, Phone, Stage, TextBlock, useReveal } from "./Visuals";

export function Freeze() {
  const enter = useReveal(3.05);
  return (
    <Stage tone="paper">
      <TextBlock
        label="التجميد والاستئناف"
        title={
          <>
            يجمّد اشتراكه
            <br />
            حسب سياسة النادي
          </>
        }
        description="يختار العضو مدة التجميد المتاحة، ويتابع حالة اشتراكه ويستأنفه من التطبيق."
      />
      <Phone
        screen="freeze"
        alt="خيارات طلب تجميد الاشتراك في تطبيق الأعضاء"
        focus={{ at: 2.65, x: 66, y: 29 }}
      />
      <div
        className="members-float-card"
        style={{ opacity: enter, translate: `0 ${(1 - enter) * 32}px` }}
      >
        <div className="members-icon">
          <Glyph icon="pause" />
        </div>
        <div>
          <strong>تجميد الاشتراك</strong>
          <span>المدة وفق سياسة الباقة</span>
        </div>
      </div>
    </Stage>
  );
}
