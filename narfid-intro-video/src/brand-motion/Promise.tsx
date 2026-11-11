import {
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Descriptor, Rings, Stage, clamp, ease } from "./Stage";

export const BrandPromise = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Stage>
      <Descriptor />
      <Rings />
      <Interactive.Div
        name="نرفدك بالتقنية"
        style={{
          position: "absolute",
          top: 730,
          left: 90,
          right: 90,
          fontSize: 119,
          fontWeight: 800,
          color: "#3ecf8e",
          lineHeight: 1.3,
          opacity: interpolate(
            frame,
            [0, 0.5 * fps, 5.5 * fps, 6 * fps],
            [0, 1, 1, 0],
            clamp,
          ),
          translate: interpolate(
            frame,
            [0, 0.8 * fps],
            ["0px 50px", "0px 0px"],
            ease,
          ),
        }}
      >
        نرفدك
        <br />
        بالتقنية
      </Interactive.Div>
      <Interactive.Div
        name="تطوير ناديك"
        style={{
          position: "absolute",
          top: 1110,
          left: 90,
          right: 90,
          fontSize: 60,
          fontWeight: 700,
          opacity: interpolate(
            frame,
            [1 * fps, 1.6 * fps, 5.5 * fps, 6 * fps],
            [0, 1, 1, 0],
            clamp,
          ),
          translate: interpolate(
            frame,
            [1 * fps, 1.8 * fps],
            ["0px 30px", "0px 0px"],
            ease,
          ),
        }}
      >
        لتتفرّغ لتطوير ناديك
      </Interactive.Div>
    </Stage>
  );
};
