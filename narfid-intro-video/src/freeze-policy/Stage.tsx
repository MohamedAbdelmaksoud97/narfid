import type { CSSProperties, ReactNode } from "react";
import { Audio } from "@remotion/media";
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
import "./freeze-policy.css";

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const settle = { ...clamp, easing: Easing.bezier(0.25, 0.48, 0.35, 1) };

const effects = {
  felt: 175,
  wood: 92,
  "wood-soft": 75,
  rubber: 136,
  date: 104,
  button: 122,
  key: 80,
  toggle: 145,
  saved: 206,
  tooth: 70,
  lock: 210,
  snap: 176,
  release: 209,
  counter: 116,
  pencil: 72,
  logo: 228,
} as const;

type Effect = keyof typeof effects;

export const Cue = ({
  at,
  effect,
  name,
  gain = 1,
}: {
  at: number;
  effect: Effect;
  name: string;
  gain?: number;
}) => {
  const { fps } = useVideoConfig();
  return (
    <Audio
      name={name}
      src={staticFile(`freeze-policy/audio/${effect}.wav`)}
      from={at}
      durationInFrames={Math.ceil((effects[effect] * fps) / 1000)}
      premountFor={fps}
      volume={gain}
    />
  );
};

export const Stage = ({
  children,
  cold = false,
}: {
  children: ReactNode;
  cold?: boolean;
}) => (
  <AbsoluteFill
    className={`freeze-stage${cold ? " freeze-stage-cold" : ""}`}
    dir="rtl"
    lang="ar"
  >
    {children}
  </AbsoluteFill>
);

export const Masthead = () => (
  <header className="freeze-masthead">
    <div className="freeze-mark">
      <Logo />
    </div>
    <p>نظام لإدارة الأندية والمنشآت الرياضية</p>
  </header>
);

// `at` is the contact frame. A short, masked approach arrives on that frame.
export const Reveal = ({
  at,
  children,
  className,
  axis = "y",
  frames = 10,
}: {
  at: number;
  children: ReactNode;
  className?: string;
  axis?: "x" | "y";
  frames?: number;
}) => {
  const frame = useCurrentFrame();
  const offset = interpolate(frame, [at - frames, at], [1, 0], settle);
  return (
    <div className={className} style={{ overflow: "hidden" }}>
      <Interactive.Div
        style={{
          translate: axis === "x" ? `${34 * offset}px 0` : `0 ${28 * offset}px`,
          opacity: interpolate(frame, [at - frames, at - 1], [0, 1], clamp),
          clipPath:
            axis === "x"
              ? `inset(0 0 0 ${100 * offset}%)`
              : `inset(0 0 ${100 * offset}% 0)`,
        }}
      >
        {children}
      </Interactive.Div>
    </div>
  );
};

export const Screen = ({
  file,
  className,
  style,
  children,
}: {
  file: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) => (
  <div className={`freeze-screen ${className ?? ""}`} style={style}>
    <CanvasImage
      src={staticFile(`freeze-policy/${file}.jpg`)}
      className="freeze-capture"
    />
    {children}
  </div>
);

export const Cursor = ({
  from,
  at,
  x,
  y,
}: {
  from: number;
  at: number;
  x: number;
  y: number;
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [from, at], [0, 1], settle);
  const ripple = interpolate(frame, [at, at + 10], [0, 1], clamp);
  return (
    <div
      className="freeze-pointer"
      style={{
        left: `${x + (1 - progress) * 12}%`,
        top: `${y + (1 - progress) * 19}%`,
        opacity: interpolate(
          frame,
          [from, from + 3, at + 7, at + 12],
          [0, 1, 1, 0],
          clamp,
        ),
      }}
    >
      <div
        className="freeze-pointer-ring"
        style={{ opacity: frame < at ? 0 : 1 - ripple, scale: 0.35 + ripple }}
      />
      <span>➤</span>
    </div>
  );
};

export const Underline = ({ at, color }: { at: number; color: string }) => {
  const frame = useCurrentFrame();
  return (
    <span
      className="freeze-underline"
      style={{
        background: color,
        scale: `${interpolate(frame, [at - 10, at], [0, 1], settle)} 1`,
      }}
    />
  );
};
