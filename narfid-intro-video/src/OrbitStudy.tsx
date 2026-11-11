import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Logo } from "./Composition";
import "./fonts.css";
import "./orbit-study.css";

const descriptor = "نظام لإدارة الأندية والمنشآت الرياضية";
const Orbit = () => {
  const frame = useCurrentFrame();
  const angle = frame * 0.48;
  return (
    <AbsoluteFill className="orbit-background" dir="rtl" lang="ar">
      <div className="orbit-grid" />
      <div className="orbit-track" style={{ rotate: `${angle}deg` }}>
        <div
          className="orbit-object object-ball"
          style={{ rotate: `${-angle + 10}deg` }}
        />
        <div
          className="orbit-object object-racket"
          style={{ rotate: `${-angle - 25}deg` }}
        />
        <div
          className="orbit-object object-card"
          style={{ rotate: `${-angle + 16}deg` }}
        />
        <div
          className="orbit-object object-bag"
          style={{ rotate: `${-angle - 8}deg` }}
        />
      </div>
      <div className="orbit-center">
        <Logo />
        <p>{descriptor}</p>
      </div>
    </AbsoluteFill>
  );
};
const Closing = () => (
  <AbsoluteFill className="orbit-closing" dir="rtl">
    <Logo large />
    <p>{descriptor}</p>
  </AbsoluteFill>
);
export const OrbitStudy = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill className="orbit-background">
      <Sequence
        name="نرفد وحياة النادي"
        durationInFrames={10 * fps}
        premountFor={fps}
      >
        <Orbit />
      </Sequence>
      <Sequence
        name="التوقيع"
        from={10 * fps}
        durationInFrames={3 * fps}
        premountFor={fps}
      >
        <Closing />
      </Sequence>
      <Audio
        name="Opening texture"
        src={staticFile("nv001/reservation-handoff.wav")}
        durationInFrames={fps / 2}
        volume={0.6}
        premountFor={fps}
      />
      <Audio
        name="توقيع نرفد"
        src={staticFile("nv001/narfid-sonic-v1.wav")}
        from={10 * fps}
        durationInFrames={3 * fps}
        premountFor={fps}
      />
    </AbsoluteFill>
  );
};
