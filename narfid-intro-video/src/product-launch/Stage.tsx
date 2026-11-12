import type { ReactNode } from "react";
import {
  AbsoluteFill,
  CanvasImage,
  Easing,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Logo } from "../Composition";
import "../fonts.css";

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;
export const glide = { ...clamp, easing: Easing.bezier(0.5, 0, 0.18, 1) };
export const settle = { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) };

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
        color: dark ? "#effaf3" : "#132b20",
        overflow: "hidden",
        opacity: interpolate(frame, [0, 0.4 * fps], [0, 1], clamp),
      }}
    >
      <AbsoluteFill
        style={{
          background: dark
            ? "radial-gradient(ellipse at 50% 90%,#245b3d88,transparent 70%)"
            : "radial-gradient(ellipse at 15% 90%,#71dea155,transparent 65%),radial-gradient(ellipse at 90% 10%,#fff,transparent 70%)",
        }}
      />
      {children}
    </AbsoluteFill>
  );
};

export const Header = ({ dark = false }: { dark?: boolean }) => (
  <>
    <div
      style={{
        position: "absolute",
        top: 46,
        right: 100,
        scale: 0.65,
        transformOrigin: "top right",
        filter: dark ? undefined : "brightness(0.25)",
      }}
    >
      <Logo />
    </div>
    <Interactive.Div
      name="تعريف النظام"
      style={{
        position: "absolute",
        left: 100,
        top: 70,
        fontSize: 30,
        fontWeight: 500,
        color: dark ? "#bed5c8" : "#416250",
      }}
    >
      نظام لإدارة الأندية والمنشآت الرياضية
    </Interactive.Div>
  </>
);

export const Caption = ({
  children,
  sub,
  dark = false,
}: {
  children: ReactNode;
  sub?: string;
  dark?: boolean;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Interactive.Div
      name="رسالة المشهد"
      style={{
        position: "absolute",
        top: 164,
        left: 100,
        right: 100,
        textAlign: "center",
        opacity: interpolate(frame, [0.15 * fps, 0.65 * fps], [0, 1], clamp),
        translate: interpolate(
          frame,
          [0, 0.9 * fps],
          ["0px 28px", "0px 0px"],
          settle,
        ),
      }}
    >
      <div style={{ fontSize: 91, fontWeight: 800, lineHeight: 1.25 }}>
        {children}
      </div>
      {sub ? (
        <div
          style={{
            fontSize: 36,
            marginTop: 14,
            color: dark ? "#b4d3c1" : "#416250",
            lineHeight: 1.5,
          }}
        >
          {sub}
        </div>
      ) : null}
    </Interactive.Div>
  );
};

export const Pointer = ({
  x,
  y,
  click = 0,
  opacity = 1,
}: {
  x: number;
  y: number;
  click?: number;
  opacity?: number;
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      opacity,
      pointerEvents: "none",
    }}
  >
    <div
      style={{
        position: "absolute",
        left: -24,
        top: -24,
        width: 48,
        height: 48,
        border: "2px solid #8bffd2",
        borderRadius: "50%",
        scale: 1 + click * 2,
        opacity: click,
      }}
    />
    <svg
      width="39"
      height="48"
      viewBox="0 0 39 48"
      style={{ filter: "drop-shadow(0 3px 5px #0008)" }}
    >
      <path
        d="M3 3L33 27L21 30L27 41L20 45L14 33L5 41Z"
        fill="#f3fff8"
        stroke="#164b31"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

// Source coordinates refer to a 1600px-wide real local UI capture.
export const Lens = ({
  file,
  x,
  y,
  zoom = 1.6,
  left = 130,
  top = 365,
  width = 1660,
  height = 590,
  children,
}: {
  file: string;
  x: number;
  y: number;
  zoom?: number;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
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
      border: "1px solid #39604a55",
      background: "#0d0d0c",
      boxShadow: "0 38px 75px -35px #113a2466",
    }}
  >
    <div
      style={{
        position: "absolute",
        left: width / 2 - x * zoom,
        top: height / 2 - y * zoom,
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
