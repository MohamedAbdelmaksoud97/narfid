import { Logo, Stage, useReveal } from "./Visuals";

export function Closing() {
  const headline = useReveal(0.15);
  const invitation = useReveal(0.85);
  return (
    <Stage>
      <div className="members-closing">
        <Logo />
        <h1
          style={{ opacity: headline, translate: `0 ${(1 - headline) * 30}px` }}
        >
          تطبيق الأعضاء
          <br />
          مرتبط بنظام ناديك
        </h1>
        <div className="members-cta" style={{ opacity: invitation }}>
          <strong>احجز عرضًا توضيحيًا</strong>
          <span dir="ltr">www.narfid.com</span>
        </div>
      </div>
    </Stage>
  );
}
