import {
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Logo } from "../Composition";
import { Stage, clamp, settle } from "./Stage";

export const ProductClosing = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Stage dark>
      <Interactive.Div
        name="شعار نرفد"
        style={{
          position: "absolute",
          left: 650,
          top: 160,
          opacity: interpolate(frame, [0.1 * fps, 0.6 * fps], [0, 1], clamp),
          scale: interpolate(frame, [0, fps], [0.92, 1], settle),
        }}
      >
        <Logo large />
      </Interactive.Div>
      <Interactive.Div
        name="تعريف المنصة"
        style={{
          position: "absolute",
          top: 400,
          left: 100,
          right: 100,
          textAlign: "center",
          fontSize: 51,
          fontWeight: 700,
          color: "#d4e9dc",
        }}
      >
        نظام لإدارة الأندية والمنشآت الرياضية
      </Interactive.Div>
      <Interactive.Div
        name="دعوة العرض"
        style={{
          position: "absolute",
          top: 560,
          left: 100,
          right: 100,
          textAlign: "center",
          fontSize: 91,
          fontWeight: 800,
          color: "#60dfa1",
          opacity: interpolate(frame, [0.4 * fps, 0.9 * fps], [0, 1], clamp),
          translate: interpolate(
            frame,
            [0.3 * fps, 1.1 * fps],
            ["0px 25px", "0px 0px"],
            settle,
          ),
        }}
      >
        احجز عرضًا توضيحيًا.
      </Interactive.Div>
      <Interactive.Div
        name="الموقع الرسمي"
        style={{
          position: "absolute",
          top: 745,
          left: 100,
          right: 100,
          textAlign: "center",
          direction: "ltr",
          fontSize: 45,
          color: "#bad2c4",
          opacity: interpolate(frame, [0.7 * fps, 1.2 * fps], [0, 1], clamp),
        }}
      >
        www.narfid.com
      </Interactive.Div>
    </Stage>
  );
};
