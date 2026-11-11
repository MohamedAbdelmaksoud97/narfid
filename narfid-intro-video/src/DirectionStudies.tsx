import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Logo } from "./Composition";
import { clamp, motion } from "./nv001/Stage";
import {
  ReservationHandoff,
  reservationHandoffFrames,
} from "./nv001/ReservationHandoff";
import "./fonts.css";
import "./direction-studies.css";

const descriptor = "نظام لإدارة الأندية والمنشآت الرياضية";

const BrandScene = () => {
  const frame = useCurrentFrame();
  const step = interpolate(
    frame,
    [5, 30, 75, 105, 155, 185],
    [0, 1, 1, 2, 2, 3],
    clamp,
  );
  const first = interpolate(step, [0, 1, 2], [0, 1, 0], clamp);
  const second = interpolate(step, [1, 2, 3], [0, 1, 0], clamp);
  const third = interpolate(step, [2, 3], [0, 1], clamp);
  const ring = interpolate(frame, [0, 220], [0.65, 1.12], motion);
  return (
    <AbsoluteFill className="direction-base" dir="rtl" lang="ar">
      <p className="direction-descriptor">نرفد — {descriptor}</p>
      <div className="direction-ring" style={{ scale: ring }} />
      <div
        className="direction-word"
        style={{
          opacity: first,
          transform: `translateY(${50 * (1 - first)}px)`,
        }}
      >
        عضويات
      </div>
      <div
        className="direction-word"
        style={{
          opacity: second,
          transform: `translateY(${50 * (1 - second)}px)`,
        }}
      >
        حجوزات
      </div>
      <div
        className="direction-word direction-final"
        style={{ opacity: third, transform: `scale(${0.9 + 0.1 * third})` }}
      >
        كل تفاصيل ناديك
        <br />
        <span>في منظومة واحدة</span>
      </div>
    </AbsoluteFill>
  );
};

const Closing = () => (
  <AbsoluteFill className="direction-closing" dir="rtl">
    <Logo large />
    <p>{descriptor}</p>
  </AbsoluteFill>
);

export const BrandMotionStudy = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill className="direction-base">
      <Sequence
        name="هوية نرفد المتحركة"
        durationInFrames={9 * fps}
        premountFor={fps}
      >
        <BrandScene />
      </Sequence>
      <Sequence
        name="توقيع نرفد"
        from={9 * fps}
        durationInFrames={3 * fps}
        premountFor={fps}
      >
        <Closing />
      </Sequence>
      <Audio
        name="First reveal"
        src={staticFile("booking-study/effects.wav")}
        durationInFrames={18}
        volume={0.8}
        premountFor={fps}
      />
      <Audio
        name="Second reveal"
        src={staticFile("booking-study/effects.wav")}
        from={105}
        trimBefore={54}
        durationInFrames={15}
        volume={0.8}
        premountFor={fps}
      />
      <Audio
        name="Final reveal"
        src={staticFile("booking-study/effects.wav")}
        from={185}
        trimBefore={159}
        durationInFrames={30}
        volume={0.8}
        premountFor={fps}
      />
      <Audio
        name="NARFID signature"
        src={staticFile("nv001/narfid-sonic-v1.wav")}
        from={9 * fps}
        durationInFrames={3 * fps}
        premountFor={fps}
      />
    </AbsoluteFill>
  );
};

const Moment = () => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 90], [1, 1.08], motion);
  return (
    <AbsoluteFill className="direction-base" dir="rtl">
      <Img
        src={staticFile("club-moment-study.png")}
        style={{ width: "100%", height: "100%", objectFit: "cover", scale }}
      />
      <div className="moment-copy">
        <p>نرفد — {descriptor}</p>
        <h1>العضو يسأل عن حجزه</h1>
      </div>
    </AbsoluteFill>
  );
};

export const ClubMomentStudy = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Sequence
        name="موقف في النادي"
        durationInFrames={3 * fps}
        premountFor={fps}
      >
        <Moment />
      </Sequence>
      <Audio
        name="Moment ambience"
        src={staticFile("nv001/reservation-handoff.wav")}
        durationInFrames={fps / 2}
        premountFor={fps}
      />
      <Sequence
        name="التحقق من الحجز"
        from={3 * fps}
        durationInFrames={reservationHandoffFrames}
        premountFor={fps}
      >
        <ReservationHandoff />
      </Sequence>
    </AbsoluteFill>
  );
};
