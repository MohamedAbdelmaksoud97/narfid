import { interpolate, useCurrentFrame } from "remotion";
import { Logo } from "../Composition";
import { clamp, Cue, Reveal, Stage } from "./Stage";

export const FreezeClosing = () => {
  const frame = useCurrentFrame();
  const logo = 8;
  const invitation = 20;
  const site = 35;
  return (
    <Stage>
      <div className="freeze-end-card">
        <div style={{ scale: interpolate(frame, [0, logo], [0.97, 1], clamp) }}>
          <Logo large />
        </div>
        <p>نظام لإدارة الأندية والمنشآت الرياضية</p>
        <Reveal className="freeze-end-action" at={invitation}>
          احجز عرضًا توضيحيًا
        </Reveal>
        <Reveal className="freeze-url" at={site}>
          <bdi>www.narfid.com</bdi>
        </Reveal>
      </div>
      <Cue at={logo} effect="logo" name="استقرار شعار نرفد" />
      <Cue
        at={invitation}
        effect="button"
        name="دعوة العرض التوضيحي"
        gain={0.56}
      />
      <Cue at={site} effect="wood-soft" name="ظهور الموقع الرسمي" />
    </Stage>
  );
};
