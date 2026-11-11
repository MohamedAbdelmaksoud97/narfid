import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Logo } from "../Composition";
import { clamp } from "./Stage";
import "../fonts.css";
import "./reservation-handoff.css";

const descriptor = "نظام لإدارة الأندية والمنشآت الرياضية";
const viewport = { width: 900, height: 580 };
const screenshot = { width: 1120, height: 850 };
const query = "RSV-DEMO-01";
const keyframes = [89, 93, 96, 101, 106, 110, 113, 118, 122, 126, 131];
const effectsDuration = 285;
export const reservationHandoffFrames = effectsDuration + 90;

const lens = { ...clamp, easing: Easing.bezier(0.47, 0.04, 0.24, 1) };
const ease = { ...clamp, easing: Easing.bezier(0.18, 0.88, 0.26, 1) };

function cameraOffset(
  target: number,
  size: number,
  viewportSize: number,
  scale: number,
) {
  const center = viewportSize / 2 - target * scale;
  return Math.max(
    Math.min(0, viewportSize - size * scale),
    Math.min(0, center),
  );
}

const BookingInteraction = () => {
  const frame = useCurrentFrame();
  const positionFrames = [0, 49, 78, 136, 170, 182, 205, 228, 284];
  const x = interpolate(
    frame,
    positionFrames,
    [560, 560, 850, 850, 950, 950, 620, 219, 219],
    lens,
  );
  const y = interpolate(
    frame,
    positionFrames,
    [332, 332, 349, 349, 435, 435, 464, 464, 464],
    lens,
  );
  const scale = interpolate(
    frame,
    positionFrames,
    [0.805, 0.84, 1.86, 1.86, 1.54, 1.54, 1.05, 2.25, 2.35],
    lens,
  );
  const left = cameraOffset(x, screenshot.width, viewport.width, scale);
  const top = cameraOffset(y, screenshot.height, viewport.height, scale);
  const typed = query.slice(
    0,
    keyframes.filter((keyframe) => keyframe <= frame).length,
  );
  const focus = interpolate(frame, [75, 80, 143, 157], [0, 1, 1, 0], ease);
  const filtered = interpolate(frame, [139, 149], [0, 1], ease);
  const active = interpolate(frame, [220, 230], [0, 1], ease);
  const pointer = interpolate(frame, [51, 77], [0, 1], ease);
  const pointerVisibility = interpolate(
    frame,
    [51, 59, 79, 91],
    [0, 1, 1, 0],
    clamp,
  );

  return (
    <div className="reservation-window">
      <div
        className="reservation-canvas"
        style={{ transform: `translate(${left}px, ${top}px) scale(${scale})` }}
      >
        <Img src={staticFile("screens/bookings.focus.png")} />
        <div
          className="reservation-filter-mask"
          style={{ opacity: filtered }}
        />
        <div
          className="reservation-typed"
          style={{
            opacity: Math.max(focus, filtered),
            borderColor: `rgba(112, 231, 171, ${focus * 0.82})`,
          }}
        >
          <bdi>{typed}</bdi>
          <span
            className="reservation-caret"
            style={{ opacity: focus * (frame % 16 < 12 ? 1 : 0) }}
          />
        </div>
        <div className="reservation-row-line" style={{ opacity: filtered }} />
        <div className="reservation-status-focus" style={{ opacity: active }} />
        <div
          className="reservation-pointer"
          style={{
            left: 1027 - 193 * pointer,
            top: 420 - 75 * pointer,
            opacity: pointerVisibility,
          }}
        />
      </div>
    </div>
  );
};

const Story = () => {
  const frame = useCurrentFrame();
  const action = interpolate(frame, [58, 70], [0, 1], ease);
  const result = interpolate(frame, [220, 233], [0, 1], ease);
  return (
    <AbsoluteFill>
      <header
        className="reservation-question"
        style={{ opacity: 1 - action, translate: `0 ${-24 * action}px` }}
      >
        <p>نرفد — {descriptor}</p>
        <h1>
          العضو يسأل:
          <br />
          حجزي تأكّد؟
        </h1>
      </header>
      <h2
        className="reservation-instruction"
        style={{ opacity: action * (1 - result) }}
      >
        ابحث برقم الحجز
      </h2>
      <BookingInteraction />
      <div
        className="reservation-result"
        style={{ opacity: result, translate: `0 ${22 * (1 - result)}px` }}
      >
        <p>بلّغ العضو إن الحجز مؤكّد.</p>
      </div>
    </AbsoluteFill>
  );
};

const End = () => {
  const frame = useCurrentFrame();
  const arrive = interpolate(frame, [0, 16], [0, 1], ease);
  return (
    <AbsoluteFill
      className="reservation-end"
      style={{ opacity: 0.56 + 0.44 * arrive }}
    >
      <Logo large />
      <p>{descriptor}</p>
    </AbsoluteFill>
  );
};

export const ReservationHandoff = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill className="reservation-handoff" dir="rtl" lang="ar">
      <Sequence
        name="البحث عن الحجز والتأكد من حالته"
        durationInFrames={effectsDuration}
        premountFor={fps}
      >
        <Story />
      </Sequence>
      <Sequence
        name="توقيع نرفد"
        from={effectsDuration}
        durationInFrames={3 * fps}
        premountFor={fps}
      >
        <End />
      </Sequence>
      <Audio
        name="Search and confirmation effects"
        src={staticFile("nv001/reservation-handoff.wav")}
        durationInFrames={effectsDuration}
        premountFor={fps}
      />
      <Audio
        name="NARFID instrumental signature"
        src={staticFile("nv001/narfid-sonic-v1.wav")}
        from={effectsDuration}
        durationInFrames={3 * fps}
        premountFor={fps}
      />
    </AbsoluteFill>
  );
};
