import {
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Descriptor, Rings, Stage, clamp, ease } from "./Stage";

export const BrandOpening = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Stage>
      <Descriptor />
      <Rings />
      <Interactive.Div
        name="كل يوم في ناديك"
        style={{
          position: "absolute",
          top: 730,
          right: 90,
          left: 90,
          fontSize: 116,
          fontWeight: 800,
          lineHeight: 1.25,
          opacity: interpolate(
            frame,
            [0, 0.5 * fps, 4.6 * fps, 5 * fps],
            [0, 1, 1, 0],
            clamp,
          ),
          translate: interpolate(
            frame,
            [0, 1 * fps],
            ["0px 55px", "0px 0px"],
            ease,
          ),
        }}
      >
        كل يوم
        <br />
        في ناديك
      </Interactive.Div>
      <Interactive.Div
        name="تفاصيل تستحق الاهتمام"
        style={{
          position: "absolute",
          top: 1120,
          left: 90,
          right: 90,
          color: "#77e6ad",
          fontSize: 53,
          fontWeight: 700,
          opacity: interpolate(
            frame,
            [1 * fps, 1.6 * fps, 4.6 * fps, 5 * fps],
            [0, 1, 1, 0],
            clamp,
          ),
          translate: interpolate(
            frame,
            [1 * fps, 2 * fps],
            ["0px 30px", "0px 0px"],
            ease,
          ),
        }}
      >
        تفاصيل تستحق الاهتمام
      </Interactive.Div>
    </Stage>
  );
};
