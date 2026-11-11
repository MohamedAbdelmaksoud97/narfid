import { Logo, Phone, Stage, TextBlock } from "./Visuals";

export function Opening() {
  return (
    <Stage>
      <div className="members-corner">
        <Logo />
      </div>
      <TextBlock
        label="تطبيق الأعضاء من نرفد"
        title={
          <>
            عضوية النادي
            <br />
            في جوال العضو
          </>
        }
        description="يطلب العضو اشتراكه ويديره من التطبيق، ويتابع فريقك الطلب في نظام النادي."
      />
      <Phone screen="membership" alt="شاشة عضوية شهرية نشطة في تطبيق الأعضاء" />
    </Stage>
  );
}
