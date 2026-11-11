import {
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Logo } from "../Composition";
import { Stage, clamp, ease } from "./Stage";

export const BrandClosing = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Stage>
      <Interactive.Div
        name="الشعار العربي"
        style={{
          position: "absolute",
          top: 630,
          left: 230,
          opacity: interpolate(frame, [0, 0.7 * fps], [0, 1], clamp),
          scale: interpolate(frame, [0, 1.2 * fps], [0.92, 1], ease),
        }}
      >
        <Logo large />
      </Interactive.Div>
      <Interactive.Div
        name="تعريف نرفد الختامي"
        style={{
          position: "absolute",
          top: 925,
          right: 90,
          left: 90,
          fontSize: 52,
          lineHeight: 1.5,
          fontWeight: 700,
          opacity: interpolate(frame, [0.4 * fps, 1 * fps], [0, 1], clamp),
        }}
      >
        نظام لإدارة الأندية
        <br />
        والمنشآت الرياضية
      </Interactive.Div>
      <Interactive.Div
        name="دعوة العرض"
        style={{
          position: "absolute",
          top: 1220,
          right: 90,
          left: 90,
          color: "#3ecf8e",
          fontSize: 52,
          fontWeight: 700,
          opacity: interpolate(frame, [1 * fps, 1.5 * fps], [0, 1], clamp),
        }}
      >
        احجز عرضًا توضيحيًا
      </Interactive.Div>
      <Interactive.Div
        name="الموقع الرسمي"
        style={{
          position: "absolute",
          top: 1340,
          right: 90,
          left: 90,
          fontSize: 42,
          color: "#bad2c4",
          direction: "ltr",
          opacity: interpolate(frame, [1.2 * fps, 1.7 * fps], [0, 1], clamp),
        }}
      >
        www.narfid.com
      </Interactive.Div>
    </Stage>
  );
};
