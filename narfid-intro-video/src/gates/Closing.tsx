import {
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Logo } from "../Composition";
import { Stage, clamp, ease } from "./Stage";
export const GateClosing = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Stage>
      <Interactive.Div
        name="شعار نرفد العربي"
        style={{
          position: "absolute",
          left: 650,
          top: 157,
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
          top: 405,
          left: 120,
          right: 120,
          textAlign: "center",
          fontSize: 54,
          fontWeight: 700,
          opacity: interpolate(frame, [0.15 * fps, 0.6 * fps], [0, 1], clamp),
        }}
      >
        نظام لإدارة الأندية والمنشآت الرياضية
      </Interactive.Div>
      <Interactive.Div
        name="دعوة تقييم الجهاز"
        style={{
          position: "absolute",
          top: 553,
          left: 110,
          right: 110,
          textAlign: "center",
          fontSize: 68,
          fontWeight: 700,
          color: "#3ecf8e",
          opacity: interpolate(frame, [0.45 * fps, 0.9 * fps], [0, 1], clamp),
        }}
      >
        شاركنا موديل جهازك لتقييم التوافق.
      </Interactive.Div>
      <Interactive.Div
        name="الموقع الرسمي"
        style={{
          position: "absolute",
          top: 700,
          left: 120,
          right: 120,
          textAlign: "center",
          fontSize: 43,
          color: "#bad2c4",
          direction: "ltr",
          opacity: interpolate(frame, [0.6 * fps, 1.1 * fps], [0, 1], clamp),
        }}
      >
        www.narfid.com
      </Interactive.Div>
      <Interactive.Div
        name="نطاق التكامل"
        style={{
          position: "absolute",
          top: 851,
          left: 120,
          right: 120,
          textAlign: "center",
          fontSize: 34,
          color: "#a3bcad",
          opacity: interpolate(frame, [0.8 * fps, 1.3 * fps], [0, 1], clamp),
        }}
      >
        التكامل حسب توافق الجهاز، بنطاق وتكلفة مستقلين.
      </Interactive.Div>
    </Stage>
  );
};
