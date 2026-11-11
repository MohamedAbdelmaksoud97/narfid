import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Logo } from "./Composition";
import { clamp } from "./nv001/Stage";
import "./fonts.css";

const descriptor = "نظام لإدارة الأندية والمنشآت الرياضية";
const Scene = () => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 170], [1, 1.09], clamp);
  const text = interpolate(frame, [10, 25], [0, 1], clamp);
  const screen = interpolate(frame, [145, 162], [0, 1], clamp);
  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background: "#090e0b",
        color: "#f1f7f3",
        fontFamily: "Tajawal",
        textAlign: "center",
      }}
    >
      <Img
        src={staticFile("club-reception-study.png")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
          opacity: 1 - 0.75 * screen,
        }}
      />
      <div
        dir="rtl"
        style={{
          position: "absolute",
          top: 200,
          left: 85,
          right: 85,
          opacity: text * (1 - screen),
          textShadow: "0 3px 30px #000",
        }}
      >
        <p style={{ fontSize: 40, color: "#d3e4d8", fontWeight: 700 }}>
          نرفد — {descriptor}
        </p>
        <h1 style={{ fontSize: 104, lineHeight: 1.2, marginTop: 32 }}>
          كل وردية
          <br />
          تكمّل اللي قبلها
        </h1>
      </div>
      <div
        dir="rtl"
        style={{
          position: "absolute",
          inset: "430px 70px auto",
          opacity: screen,
        }}
      >
        <h2 style={{ fontSize: 87, lineHeight: 1.2 }}>الحجز واضح للفريق</h2>
        <div
          style={{
            marginTop: 60,
            height: 500,
            overflow: "hidden",
            borderRadius: 32,
            border: "2px solid #486153",
            boxShadow: "0 30px 90px #000",
          }}
        >
          <Img
            src={staticFile("screens/bookings.focus.png")}
            style={{ width: "100%" }}
          />
        </div>
        <p style={{ fontSize: 47, color: "#d1e5d8", marginTop: 65 }}>
          راجع حالة الحجز قبل ما ترد على العضو
        </p>
      </div>
    </AbsoluteFill>
  );
};

export const ClubStoryStudy = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        background: "#0b100e",
        color: "#f2f6f3",
        fontFamily: "Tajawal",
        textAlign: "center",
      }}
    >
      <Sequence
        name="فريق النادي"
        durationInFrames={10 * fps}
        premountFor={fps}
      >
        <Scene />
      </Sequence>
      <Sequence
        name="توقيع نرفد"
        from={10 * fps}
        durationInFrames={3 * fps}
        premountFor={fps}
      >
        <AbsoluteFill
          dir="rtl"
          style={{ alignItems: "center", justifyContent: "center", gap: 36 }}
        >
          <Logo large />
          <p style={{ fontSize: 52, fontWeight: 700 }}>{descriptor}</p>
        </AbsoluteFill>
      </Sequence>
      <Audio
        name="Opening ambience"
        src={staticFile("nv001/reservation-handoff.wav")}
        durationInFrames={fps / 2}
        premountFor={fps}
      />
      <Audio
        name="Screen reveal"
        src={staticFile("booking-study/effects.wav")}
        from={145}
        trimBefore={159}
        durationInFrames={30}
        volume={0.7}
        premountFor={fps}
      />
      <Audio
        name="NARFID signature"
        src={staticFile("nv001/narfid-sonic-v1.wav")}
        from={10 * fps}
        durationInFrames={3 * fps}
        premountFor={fps}
      />
    </AbsoluteFill>
  );
};
