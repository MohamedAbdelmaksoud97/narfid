import {
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Descriptor, Stage, clamp, ease } from "./Stage";

export const BrandTogether = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Stage>
      <Descriptor />
      <Interactive.Div
        name="التقاء الدوائر"
        style={{
          position: "absolute",
          left: 130,
          top: 550,
          width: 820,
          height: 820,
          borderRadius: "50%",
          border: "2px solid #3ecf8e55",
          boxShadow: "inset 0 0 120px #3ecf8e12, 0 0 90px #3ecf8e12",
          scale: interpolate(
            frame,
            [0, 2 * fps, 6.5 * fps],
            [1.3, 1, 1.04],
            ease,
          ),
        }}
      />
      <Interactive.Div
        name="العضويات تتصل"
        style={{
          position: "absolute",
          top: 625,
          left: 100,
          right: 100,
          color: "#77e6ad",
          fontSize: 52,
          opacity: interpolate(
            frame,
            [0, 0.4 * fps, 1.5 * fps, 2.3 * fps],
            [0, 1, 1, 0],
            clamp,
          ),
          translate: interpolate(
            frame,
            [1.5 * fps, 2.3 * fps],
            ["0px 0px", "0px 200px"],
            ease,
          ),
        }}
      >
        عضويات
      </Interactive.Div>
      <Interactive.Div
        name="الحجوزات تتصل"
        style={{
          position: "absolute",
          top: 1080,
          right: 150,
          fontSize: 52,
          color: "#77e6ad",
          opacity: interpolate(
            frame,
            [0, 0.4 * fps, 1.5 * fps, 2.3 * fps],
            [0, 1, 1, 0],
            clamp,
          ),
          translate: interpolate(
            frame,
            [1.5 * fps, 2.3 * fps],
            ["0px 0px", "-220px -150px"],
            ease,
          ),
        }}
      >
        حجوزات
      </Interactive.Div>
      <Interactive.Div
        name="التحصيل يتصل"
        style={{
          position: "absolute",
          top: 1080,
          left: 150,
          fontSize: 52,
          color: "#77e6ad",
          opacity: interpolate(
            frame,
            [0, 0.4 * fps, 1.5 * fps, 2.3 * fps],
            [0, 1, 1, 0],
            clamp,
          ),
          translate: interpolate(
            frame,
            [1.5 * fps, 2.3 * fps],
            ["0px 0px", "220px -150px"],
            ease,
          ),
        }}
      >
        تحصيل
      </Interactive.Div>
      <Interactive.Div
        name="منظومة واحدة"
        style={{
          position: "absolute",
          top: 775,
          left: 90,
          right: 90,
          fontSize: 100,
          fontWeight: 800,
          lineHeight: 1.4,
          opacity: interpolate(
            frame,
            [1.9 * fps, 2.5 * fps, 6 * fps, 6.5 * fps],
            [0, 1, 1, 0],
            clamp,
          ),
          scale: interpolate(frame, [1.9 * fps, 3 * fps], [0.88, 1], ease),
        }}
      >
        كل تفاصيل ناديك
        <br />
        <span style={{ color: "#3ecf8e" }}>في منظومة واحدة</span>
      </Interactive.Div>
    </Stage>
  );
};
