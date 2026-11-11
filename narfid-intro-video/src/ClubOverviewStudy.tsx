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
import "./fonts.css";
import "./club-overview-study.css";

const descriptor = "نظام لإدارة الأندية والمنشآت الرياضية";

const Shot = ({
  file,
  label,
  start,
  position,
}: {
  file: string;
  label: string;
  start: number;
  position: number;
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [start, start + 21], [0, 1], motion);
  return (
    <div
      className="overview-shot"
      style={{
        top: 735 + position * 220,
        left: 110 + (position % 2) * 65,
        opacity: progress,
        transform: `translateY(${70 * (1 - progress)}px)`,
      }}
    >
      <div className="overview-shot-image">
        <Img src={staticFile(`screens/${file}`)} />
      </div>
      <div className="overview-shot-label">{label}</div>
    </div>
  );
};

const Body = () => {
  const frame = useCurrentFrame();
  const title = interpolate(frame, [0, 15], [0, 1], clamp);
  const conclusion = interpolate(frame, [218, 235], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <header className="overview-heading" style={{ opacity: title }}>
        <p>نرفد — {descriptor}</p>
        <h1>
          تفاصيل ناديك
          <br />
          في مكان واحد
        </h1>
      </header>
      <Shot
        file="subscriptions.focus.png"
        label="الاشتراكات"
        start={24}
        position={0}
      />
      <Shot
        file="bookings.focus.png"
        label="الحجوزات"
        start={51}
        position={1}
      />
      <Shot file="finance.focus.png" label="التحصيل" start={78} position={2} />
      <div
        className="overview-conclusion"
        style={{
          opacity: conclusion,
          transform: `translateY(${20 * (1 - conclusion)}px)`,
        }}
      >
        صورة أوضح لتشغيل ناديك
      </div>
    </AbsoluteFill>
  );
};

const Closing = () => (
  <AbsoluteFill className="overview-closing">
    <Logo large />
    <p>{descriptor}</p>
  </AbsoluteFill>
);

export const ClubOverviewStudy = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill className="overview-study" dir="rtl" lang="ar">
      <Sequence
        name="تفاصيل النادي"
        durationInFrames={10 * fps}
        premountFor={fps}
      >
        <Body />
      </Sequence>
      <Sequence
        name="توقيع نرفد"
        from={10 * fps}
        durationInFrames={3 * fps}
        premountFor={fps}
      >
        <Closing />
      </Sequence>
      <Audio
        name="Opening"
        src={staticFile("booking-study/effects.wav")}
        durationInFrames={18}
        volume={0.75}
        premountFor={fps}
      />
      <Audio
        name="Subscriptions"
        src={staticFile("booking-study/effects.wav")}
        from={24}
        trimBefore={116}
        durationInFrames={6}
        volume={0.65}
        premountFor={fps}
      />
      <Audio
        name="Bookings"
        src={staticFile("booking-study/effects.wav")}
        from={51}
        trimBefore={116}
        durationInFrames={6}
        volume={0.75}
        premountFor={fps}
      />
      <Audio
        name="Collection"
        src={staticFile("booking-study/effects.wav")}
        from={78}
        trimBefore={159}
        durationInFrames={30}
        volume={0.7}
        premountFor={fps}
      />
      <Audio
        name="NARFID instrumental signature"
        src={staticFile("nv001/narfid-sonic-v1.wav")}
        from={10 * fps}
        durationInFrames={3 * fps}
        premountFor={fps}
      />
    </AbsoluteFill>
  );
};
