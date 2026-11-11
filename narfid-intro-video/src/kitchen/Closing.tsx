import {
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Logo } from "../Composition";
import { KitchenStage, clamp, ease } from "./Stage";

export const KitchenClosing = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <KitchenStage>
      <Interactive.Div
        name="شعار نرفد العربي"
        style={{
          position: "absolute",
          left: 650,
          top: 218,
          opacity: interpolate(frame, [0, 0.45 * fps], [0, 1], clamp),
          scale: interpolate(frame, [0, 0.8 * fps], [0.94, 1], ease),
        }}
      >
        <Logo large />
      </Interactive.Div>
      <Interactive.Div
        name="تعريف النظام"
        style={{
          position: "absolute",
          top: 485,
          left: 150,
          right: 150,
          textAlign: "center",
          fontSize: 58,
          fontWeight: 700,
          lineHeight: 1.5,
          opacity: interpolate(frame, [0.15 * fps, 0.6 * fps], [0, 1], clamp),
        }}
      >
        نظام لإدارة الأندية والمنشآت الرياضية
      </Interactive.Div>
      <Interactive.Div
        name="دعوة العرض التوضيحي"
        style={{
          position: "absolute",
          top: 645,
          left: 150,
          right: 150,
          textAlign: "center",
          fontSize: 64,
          fontWeight: 700,
          color: "#3ecf8e",
          opacity: interpolate(frame, [0.45 * fps, 0.9 * fps], [0, 1], clamp),
        }}
      >
        احجز عرضًا توضيحيًا
      </Interactive.Div>
      <Interactive.Div
        name="الموقع الرسمي"
        style={{
          position: "absolute",
          top: 760,
          left: 150,
          right: 150,
          textAlign: "center",
          fontSize: 40,
          color: "#bad2c4",
          direction: "ltr",
          opacity: interpolate(frame, [0.65 * fps, 1.1 * fps], [0, 1], clamp),
        }}
      >
        www.narfid.com
      </Interactive.Div>
    </KitchenStage>
  );
};
