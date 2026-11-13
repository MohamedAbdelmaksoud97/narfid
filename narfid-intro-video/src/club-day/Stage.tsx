import type { ReactNode } from "react";
import {
  AbsoluteFill,
  CanvasImage,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Logo } from "../Composition";
import { clamp, settle, glide } from "../product-launch/Stage";
import "../fonts.css";
export { clamp, settle, glide };
export const green = "#54dda1";
export const Stage = ({
  children,
  dark = false,
}: {
  children: ReactNode;
  dark?: boolean;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill
      dir="rtl"
      lang="ar"
      style={{
        fontFamily: "Tajawal, sans-serif",
        background: dark ? "#101b16" : "#eaf5ef",
        color: dark ? "#f0faf4" : "#153a29",
        overflow: "hidden",
      }}
    >
      <AbsoluteFill
        style={{
          background: dark
            ? "radial-gradient(ellipse at 20% 100%,#265d3c70,transparent 65%)"
            : "radial-gradient(ellipse at 10% 90%,#76dca640,transparent 65%),radial-gradient(ellipse at 90% 0%,white,transparent 65%)",
        }}
      />
      <AbsoluteFill
        style={{ opacity: interpolate(frame, [0, 0.32 * fps], [0, 1], clamp) }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export const Header = ({ dark = false }: { dark?: boolean }) => (
  <>
    <div
      style={{
        position: "absolute",
        right: 110,
        top: 44,
        scale: 0.65,
        transformOrigin: "top right",
        filter: dark ? undefined : "brightness(.25)",
      }}
    >
      <Logo />
    </div>
    <Interactive.Div
      name="تعريف نرفد"
      style={{
        position: "absolute",
        left: 110,
        top: 65,
        fontSize: 30,
        fontWeight: 500,
        color: dark ? "#bed5c8" : "#466652",
      }}
    >
      نظام لإدارة الأندية والمنشآت الرياضية
    </Interactive.Div>
  </>
);
export const Headline = ({
  children,
  note,
  dark = false,
}: {
  children: ReactNode;
  note?: string;
  dark?: boolean;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Interactive.Div
      name="رسالة المشهد"
      style={{
        position: "absolute",
        top: 163,
        left: 110,
        right: 110,
        textAlign: "center",
        opacity: interpolate(frame, [0.12 * fps, 0.6 * fps], [0, 1], clamp),
        translate: interpolate(
          frame,
          [0, 0.8 * fps],
          ["0px 25px", "0px 0px"],
          settle,
        ),
      }}
    >
      <div style={{ fontSize: 88, fontWeight: 800, lineHeight: 1.25 }}>
        {children}
      </div>
      {note && (
        <div
          style={{
            fontSize: 34,
            marginTop: 14,
            lineHeight: 1.45,
            color: dark ? "#b7d1c1" : "#4b6b58",
          }}
        >
          {note}
        </div>
      )}
    </Interactive.Div>
  );
};
// Coordinates are normalized to the width of the original capture.
export const Screen = ({
  file,
  x = 0.5,
  y = 0.5,
  zoom = 1,
  width = 1670,
  height = 620,
  left = 125,
  top = 342,
  children,
}: {
  file: string;
  x?: number;
  y?: number;
  zoom?: number;
  width?: number;
  height?: number;
  left?: number;
  top?: number;
  children?: ReactNode;
}) => (
  <div
    style={{
      position: "absolute",
      left,
      top,
      width,
      height,
      overflow: "hidden",
      borderRadius: 24,
      background: "#0d0d0c",
      border: "1px solid #3f6b5140",
      boxShadow: "0 35px 75px -35px #143d2966",
    }}
  >
    <div
      style={{
        position: "absolute",
        left: width / 2 - x * 1600 * zoom,
        top: height / 2 - y * 1600 * zoom,
        width: 1600,
        scale: zoom,
        transformOrigin: "0 0",
      }}
    >
      <CanvasImage
        src={staticFile(file)}
        style={{ display: "block", width: 1600 }}
      />
      {children}
    </div>
  </div>
);
export const Result = ({
  children,
  at = 6,
}: {
  children: ReactNode;
  at?: number;
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Interactive.Div
      name="نتيجة الإجراء"
      style={{
        position: "absolute",
        bottom: 48,
        left: 110,
        right: 110,
        textAlign: "center",
        fontSize: 37,
        fontWeight: 700,
        color: "#1a6844",
        opacity: interpolate(f, [at * fps, (at + 0.3) * fps], [0, 1], clamp),
      }}
    >
      {children}
    </Interactive.Div>
  );
};
