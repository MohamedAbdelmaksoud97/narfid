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
export const ease = { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) };
export const lens = { ...clamp, easing: Easing.bezier(0.45, 0.02, 0.22, 1) };
export const Stage = ({ children }: { children: ReactNode }) => (
  <AbsoluteFill
    dir="rtl"
    lang="ar"
    style={{
      fontFamily: "Tajawal, sans-serif",
      color: "#edf7f0",
      background:
        "radial-gradient(ellipse at 30% 65%,#20382b,#111a15 54%,#090d0b)",
      overflow: "hidden",
    }}
  >
    {children}
  </AbsoluteFill>
);
export const Header = ({
  label = "تكامل بوابات الدخول",
}: {
  label?: string;
}) => (
  <>
    <div
      style={{
        position: "absolute",
        right: 100,
        top: 49,
        scale: 0.68,
        transformOrigin: "top right",
      }}
    >
      <Logo />
    </div>
    <Interactive.Div
      name="تعريف نظام نرفد"
      style={{
        position: "absolute",
        left: 100,
        top: 68,
        fontSize: 32,
        color: "#bdcfc3",
        fontWeight: 500,
      }}
    >
      نظام لإدارة الأندية والمنشآت الرياضية
    </Interactive.Div>
    <div
      style={{
        position: "absolute",
        right: 102,
        bottom: 42,
        fontSize: 26,
        color: "#a2baad",
      }}
    >
      {label}
    </div>
    <div
      style={{
        position: "absolute",
        left: 100,
        bottom: 42,
        fontSize: 25,
        color: "#a2baad",
        direction: "ltr",
      }}
    >
      narfid.com
    </div>
  </>
);
export const Title = ({
  children,
  top = 184,
  right = 110,
  width = 720,
  size = 82,
}: {
  children: ReactNode;
  top?: number;
  right?: number;
  width?: number;
  size?: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Interactive.Div
      name="العنوان"
      style={{
        position: "absolute",
        top,
        right,
        width,
        fontSize: size,
        fontWeight: 800,
        lineHeight: 1.3,
        opacity: interpolate(frame, [0, 0.5 * fps], [0, 1], clamp),
        translate: interpolate(
          frame,
          [0, 0.8 * fps],
          ["0px 30px", "0px 0px"],
          ease,
        ),
      }}
    >
      {children}
    </Interactive.Div>
  );
};
export const Shot = ({
  file,
  x,
  y,
  scale = 1,
  width = 1230,
  height = 620,
  top = 290,
  left = 100,
}: {
  file: string;
  x: number;
  y: number;
  scale?: number;
  width?: number;
  height?: number;
  top?: number;
  left?: number;
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  return (
    <Interactive.Div
      name="لقطة النظام والكاميرا"
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        overflow: "hidden",
        borderRadius: 20,
        border: "1px solid #446650",
        boxShadow: "0 35px 100px #0009",
        opacity: interpolate(frame, [0, 0.45 * fps], [0, 1], clamp),
        translate: interpolate(
          frame,
          [0, 0.8 * fps],
          ["0px 35px", "0px 0px"],
          ease,
        ),
      }}
    >
      <CanvasImage
        src={staticFile(`gates/${file}`)}
        style={{
          position: "absolute",
          width: 1600,
          left: width / 2 - x,
          top: height / 2 - y,
          scale: interpolate(
            frame,
            [0, durationInFrames - 1],
            [scale, scale * 1.035],
            lens,
          ),
          transformOrigin: `${x}px ${y}px`,
        }}
      />
    </Interactive.Div>
  );
};

// Editorial representation of a gate, not a device screenshot or remote-open command.
export const Gate = ({
  open = 0,
  color = "#3ecf8e",
}: {
  open?: number;
  color?: string;
}) => (
  <svg
    width="740"
    height="590"
    viewBox="0 0 740 590"
    aria-label="تمثيل حركة بوابة الدخول"
  >
    <defs>
      <linearGradient id="steel">
        <stop stopColor="#263b30" />
        <stop offset=".22" stopColor="#9daea3" />
        <stop offset=".42" stopColor="#3c5145" />
        <stop offset=".75" stopColor="#80988a" />
        <stop offset="1" stopColor="#1b2e23" />
      </linearGradient>
      <linearGradient id="glass">
        <stop stopColor={color} stopOpacity=".18" />
        <stop offset="1" stopColor={color} stopOpacity=".025" />
      </linearGradient>
      <radialGradient id="floor">
        <stop stopColor={color} stopOpacity=".19" />
        <stop offset="1" stopColor={color} stopOpacity="0" />
      </radialGradient>
    </defs>
    <ellipse cx="366" cy="492" rx="345" ry="90" fill="url(#floor)" />
    <path d="M112 475 L260 525 L663 374" stroke="#44604f" fill="none" />
    <path
      d="M115 210 L180 190 L225 215 L225 472 Q173 494 115 468 Z"
      fill="url(#steel)"
      stroke="#8ba494"
    />
    <path d="M115 210 L173 232 L225 215" fill="none" stroke="#b0c6b8" />
    <path
      d="M530 147 L592 130 L640 154 L640 412 Q589 433 530 408 Z"
      fill="url(#steel)"
      stroke="#8ba494"
    />
    <path d="M530 147 L588 171 L640 154" fill="none" stroke="#b0c6b8" />
    <path
      d="M175 236 L205 225 L205 285 L175 295 Z"
      fill="#07120b"
      stroke="#627e6b"
    />
    <path d="M184 258 L196 253" stroke={color} strokeWidth="5" />
    <path
      d={`M225 256 L${358 - open * 125} ${215 + open * 16} L${358 - open * 125} ${440 + open * 16} L225 477 Z`}
      fill="url(#glass)"
      stroke={color}
      strokeOpacity=".72"
      strokeWidth="2"
    />
    <path
      d={`M530 170 L${377 + open * 125} ${214 - open * 26} L${377 + open * 125} ${439 - open * 26} L530 394 Z`}
      fill="url(#glass)"
      stroke={color}
      strokeOpacity=".72"
      strokeWidth="2"
    />
    <path
      d="M175 484 L584 421"
      stroke={color}
      strokeOpacity=".55"
      strokeWidth="3"
    />
  </svg>
);
