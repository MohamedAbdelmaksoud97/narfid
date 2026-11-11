import type { ReactNode } from "react";
import { AbsoluteFill, Easing } from "remotion";
import "../fonts.css";

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;
export const lens = { ...clamp, easing: Easing.bezier(0.45, 0.02, 0.22, 1) };
export const ease = { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) };
export const KitchenStage = ({ children }: { children: ReactNode }) => (
  <AbsoluteFill
    dir="rtl"
    lang="ar"
    style={{
      fontFamily: "Tajawal, sans-serif",
      color: "#edf7f0",
      background:
        "radial-gradient(ellipse at 52% 50%, #1a3327 0%, #101a15 47%, #090d0b 90%)",
      overflow: "hidden",
    }}
  >
    {children}
  </AbsoluteFill>
);
