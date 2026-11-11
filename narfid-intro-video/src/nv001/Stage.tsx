import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Logo } from "../Composition";
import "./film.css";

export const color = {
  green: "#3ECF8E",
  ink: "#1C1C1C",
  white: "#EDEDED",
  amber: "#F4BD50",
};
export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;
export const motion = { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) };

export const Reveal = ({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={style}>
      <div
        style={{
          opacity: interpolate(
            frame,
            [delay * fps, (delay + 0.35) * fps],
            [0, 1],
            clamp,
          ),
          translate: interpolate(
            frame,
            [delay * fps, (delay + 0.7) * fps],
            ["0px 55px", "0px 0px"],
            motion,
          ),
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const Stage = ({
  children,
  light = false,
}: {
  children: React.ReactNode;
  light?: boolean;
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      className={`nv-film ${light ? "nv-light" : ""}`}
      dir="rtl"
      lang="ar"
    >
      <div className="nv-grid" style={{ translate: `0px ${frame * 0.08}px` }} />
      <div className="nv-halo" />
      <header>
        <Logo />
        <span>لفريق الاستقبال</span>
      </header>
      {children}
      <footer>
        <span>تفاصيل صغيرة. تسليم أوضح.</span>
        <span dir="ltr">narfid.com</span>
      </footer>
    </AbsoluteFill>
  );
};

export const Check = ({ progress = 1 }: { progress?: number }) => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="29" stroke={color.green} strokeWidth="2" />
    <path
      d="M18 32L28 42L47 22"
      stroke={color.green}
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength="1"
      strokeDasharray="1"
      strokeDashoffset={1 - progress}
    />
  </svg>
);
