import type { ReactNode } from "react";
import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "../fonts.css";

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;
export const ease = { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) };

export const Stage = ({ children }: { children: ReactNode }) => (
  <AbsoluteFill
    dir="rtl"
    lang="ar"
    style={{
      fontFamily: "Tajawal, sans-serif",
      background:
        "radial-gradient(ellipse at 50% 48%, #193a29 0%, #101b15 43%, #090d0b 85%)",
      color: "#edf7f0",
      overflow: "hidden",
      textAlign: "center",
    }}
  >
    {children}
  </AbsoluteFill>
);

export const Descriptor = () => (
  <Interactive.Div
    name="تعريف النظام"
    style={{
      position: "absolute",
      top: 205,
      left: 90,
      right: 90,
      color: "#bad2c4",
      fontSize: 44,
      fontWeight: 500,
      lineHeight: 1.5,
    }}
  >
    نرفد — نظام لإدارة
    <br />
    الأندية والمنشآت الرياضية
  </Interactive.Div>
);

export const Rings = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      <Interactive.Div
        name="الدائرة الخارجية"
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          left: 90,
          top: 510,
          border: "2px solid #3ecf8e38",
          borderRadius: "50%",
          boxShadow: "0 0 100px #3ecf8e12, inset 0 0 100px #3ecf8e0c",
          scale: interpolate(frame, [0, 6 * fps], [0.83, 1.08], ease),
        }}
      />
      <Interactive.Div
        name="قوس الضوء"
        style={{
          position: "absolute",
          width: 760,
          height: 760,
          left: 160,
          top: 580,
          border: "3px solid #3ecf8e0d",
          borderTopColor: "#3ecf8e",
          borderRightColor: "#3ecf8e66",
          borderRadius: "50%",
          rotate: interpolate(frame, [0, 8 * fps], ["-55deg", "100deg"], clamp),
        }}
      />
    </>
  );
};
