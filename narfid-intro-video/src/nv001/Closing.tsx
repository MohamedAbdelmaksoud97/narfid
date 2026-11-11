import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Logo } from "../Composition";
import { clamp } from "./Stage";
import "./film.css";

export const ShiftClosing = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill className="nv-film nv-closing" dir="rtl" lang="ar">
      <div
        className="nv-end-ring"
        style={{ scale: interpolate(frame, [0, 3 * fps], [1, 1.12], clamp) }}
      />
      <div
        style={{
          opacity: interpolate(frame, [0, 0.4 * fps], [0, 1], clamp),
          scale: interpolate(frame, [0, 0.8 * fps], [0.96, 1], clamp),
        }}
      >
        <Logo large />
      </div>
      <p
        style={{
          fontSize: 66,
          marginTop: 65,
          opacity: interpolate(frame, [0.3 * fps, 0.8 * fps], [0, 1], clamp),
        }}
      >
        سندك التقني
      </p>
      <span dir="ltr" style={{ marginTop: 70, fontSize: 38, color: "#A4ADA7" }}>
        narfid.com
      </span>
    </AbsoluteFill>
  );
};
