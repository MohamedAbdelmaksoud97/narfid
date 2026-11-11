import type { ReactNode } from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "../fonts.css";
import "./members.css";

export function useReveal(delay = 0, length = 0.65) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return interpolate(frame, [delay * fps, (delay + length) * fps], [0, 1], {
    easing: Easing.bezier(0.2, 0.7, 0.25, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

export function Stage({
  children,
  tone = "dark",
}: {
  children: ReactNode;
  tone?: "dark" | "paper" | "mint";
}) {
  return (
    <AbsoluteFill
      className={`members-film members-${tone}`}
      dir="rtl"
      lang="ar"
    >
      {children}
    </AbsoluteFill>
  );
}

export function Logo() {
  return (
    <div className="members-logo">
      <Img alt="نرفد" src={staticFile("logo.png")} />
    </div>
  );
}

export function TextBlock({
  label,
  title,
  description,
}: {
  label: string;
  title: ReactNode;
  description: string;
}) {
  const enter = useReveal(0.08);
  return (
    <div
      className="members-copy"
      style={{ opacity: enter, translate: `0 ${(1 - enter) * 36}px` }}
    >
      <div className="members-label">{label}</div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}

export function Phone({
  screen,
  alt,
  focus,
}: {
  screen: string;
  alt: string;
  focus?: { at: number; x: number; y: number };
}) {
  const enter = useReveal(0.06, 0.85);
  const push = useReveal(1.25, 2.6);
  const frame = useCurrentFrame();
  return (
    <div
      className="members-phone-wrap"
      style={{
        opacity: enter,
        translate: `0 ${(1 - enter) * 74 + Math.sin(frame / 80) * 5}px`,
      }}
    >
      <div className="members-halo" />
      <div className="members-phone">
        <div className="members-phone-screen">
          <div
            className="members-phone-image"
            style={{
              scale: 1 + push * (focus ? 0.16 : 0.035),
              transformOrigin: focus ? `${focus.x}% ${focus.y}%` : "center",
            }}
          >
            <Img alt={alt} src={staticFile(`members/${screen}.png`)} />
            {focus && <TouchPulse at={focus.at} x={focus.x} y={focus.y} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TouchPulse({ at, x, y }: { at: number; x: number; y: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(
    frame,
    [at * fps - 1, at * fps, (at + 0.1) * fps, (at + 0.55) * fps],
    [0, 0.85, 0.67, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const scale = interpolate(frame, [at * fps, (at + 0.55) * fps], [0.65, 2.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      className="members-touch"
      style={{ left: `${x}%`, top: `${y}%`, opacity, scale }}
    />
  );
}

export function Glyph({
  icon,
}: {
  icon: "card" | "club" | "check" | "pause" | "renew" | "list";
}) {
  const paths = {
    card: "M3 8h26v17H3z M3 13h26 M7 20h6",
    club: "M3 12l13-8 13 8 M5 13h22 M8 15v11 M16 15v11 M24 15v11 M4 28h24",
    check: "m7 16 6 6L26 9",
    pause: "M11 7v18 M21 7v18",
    renew: "M27 14A11 11 0 1 0 25 23 M27 6v8h-8",
    list: "M8 4h16v24H8z M12 10h8 M12 16h8 M12 22h5",
  };
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[icon]} />
    </svg>
  );
}
