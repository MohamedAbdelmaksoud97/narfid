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
import "../fonts.css";
import "./study.css";

const descriptor = "نظام لإدارة الأندية والمنشآت الرياضية";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.22, 1, 0.36, 1);

const Screen = () => (
  <Img
    src={staticFile("screens/bookings.focus.png")}
    className="booking-study-screen"
  />
);

const Opening = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slide = interpolate(frame, [0, 0.55 * fps], [70, 0], {
    ...clamp,
    easing: ease,
  });
  return (
    <AbsoluteFill>
      <header
        className="booking-study-opening"
        style={{ translate: `0 ${slide}px` }}
      >
        <p className="booking-study-brand">نرفد — {descriptor}</p>
        <h1>الحجز مؤكّد؟</h1>
      </header>
      <div
        className="booking-study-teaser"
        style={{ translate: `0 ${slide * 2}px` }}
      >
        <Screen />
      </div>
    </AbsoluteFill>
  );
};

const BookingTable = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = interpolate(frame, [0, 1.6 * fps], [1.13, 1], {
    ...clamp,
    easing: ease,
  });
  const cursor = interpolate(frame, [0.55 * fps, 2.07 * fps], [0, 1], {
    ...clamp,
    easing: ease,
  });
  const focus = interpolate(frame, [2.07 * fps, 2.24 * fps], [0, 1], clamp);
  const push = interpolate(frame, [2.77 * fps, 3.5 * fps], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  return (
    <AbsoluteFill>
      <header className="booking-study-heading">
        <h2>حجز ملعب بادل</h2>
      </header>
      <div
        className="booking-study-table"
        style={{
          scale: scale + 0.48 * push,
          translate: `${110 * push}px 0`,
          transformOrigin: "180px 385px",
        }}
      >
        <Screen />
        <div className="booking-study-scrim" style={{ opacity: focus }} />
        <div className="booking-study-row" style={{ opacity: focus }}>
          <Screen />
        </div>
        <div
          className="booking-study-pointer"
          style={{
            left: 730 - 548 * cursor,
            top: 190 + 199 * cursor,
            scale: interpolate(
              frame,
              [2.02 * fps, 2.07 * fps, 2.22 * fps],
              [1, 0.8, 1],
              clamp,
            ),
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

const BookingStatus = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const settle = interpolate(frame, [0, 0.64 * fps], [0, 1], {
    ...clamp,
    easing: ease,
  });
  const label = interpolate(frame, [0.45 * fps, 0.75 * fps], [0, 1], clamp);
  return (
    <AbsoluteFill className="booking-study-result">
      <div
        className="booking-study-halo"
        style={{ scale: 0.81 + 0.19 * settle, opacity: 0.45 + 0.55 * settle }}
      />
      <h2 style={{ opacity: label, translate: `0 ${18 * (1 - label)}px` }}>
        ملعب بادل
      </h2>
      <div
        className="booking-study-status"
        style={{
          scale: 0.72 + 0.28 * settle,
          translate: `${-180 * (1 - settle)}px 0`,
        }}
      >
        <span aria-hidden="true">✓</span>
        مؤكّد
      </div>
    </AbsoluteFill>
  );
};

const EndCard = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const settle = interpolate(frame, [0, 0.45 * fps], [0, 1], {
    ...clamp,
    easing: ease,
  });
  return (
    <AbsoluteFill className="booking-study-end">
      <div style={{ scale: 0.95 + 0.05 * settle, opacity: 0.7 + 0.3 * settle }}>
        <Logo large />
      </div>
      <p>{descriptor}</p>
    </AbsoluteFill>
  );
};

export const BookingStudy = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill className="booking-study" lang="ar" dir="rtl">
      <Sequence
        name="الحجز مؤكّد؟"
        durationInFrames={1.8 * fps}
        premountFor={fps}
      >
        <Opening />
      </Sequence>
      <Sequence
        name="حجز ملعب بادل"
        from={1.8 * fps}
        durationInFrames={3.5 * fps}
        premountFor={fps}
      >
        <BookingTable />
      </Sequence>
      <Sequence
        name="حالة الحجز"
        from={5.3 * fps}
        durationInFrames={2.2 * fps}
        premountFor={fps}
      >
        <BookingStatus />
      </Sequence>
      <Sequence
        name="نرفد"
        from={7.5 * fps}
        durationInFrames={3 * fps}
        premountFor={fps}
      >
        <EndCard />
      </Sequence>
      <Audio
        name="Booking interaction effects"
        src={staticFile("booking-study/effects.wav")}
        durationInFrames={7.5 * fps}
        premountFor={fps}
      />
      <Audio
        name="NARFID instrumental signature"
        src={staticFile("nv001/narfid-sonic-v1.wav")}
        from={7.5 * fps}
        durationInFrames={3 * fps}
        premountFor={fps}
      />
    </AbsoluteFill>
  );
};
