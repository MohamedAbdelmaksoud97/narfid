import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  ReservationHandoff,
  reservationHandoffFrames,
} from "./ReservationHandoff";
import { clamp, motion } from "./Stage";

const ShiftIntro = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12], [0, 1], clamp);
  const scale = interpolate(frame, [0, 60], [0.97, 1], motion);
  return (
    <AbsoluteFill
      className="reservation-handoff"
      dir="rtl"
      lang="ar"
      style={{ justifyContent: "center", alignItems: "center" }}
    >
      <div style={{ opacity, scale, padding: "0 90px" }}>
        <p style={{ color: "#a9c0b5", fontSize: 41, fontWeight: 700 }}>
          نرفد — نظام لإدارة الأندية والمنشآت الرياضية
        </p>
        <h1
          style={{
            marginTop: 36,
            fontSize: 114,
            lineHeight: 1.2,
            fontWeight: 800,
          }}
        >
          استلمت الوردية؟
        </h1>
      </div>
    </AbsoluteFill>
  );
};

export const ReservationFilm = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Sequence
        name="بداية الوردية"
        durationInFrames={2 * fps}
        premountFor={fps}
      >
        <ShiftIntro />
      </Sequence>
      <Audio
        name="Shift opening"
        src={staticFile("nv001/reservation-handoff.wav")}
        durationInFrames={fps / 2}
        volume={0.65}
        premountFor={fps}
      />
      <Sequence
        name="التحقق من حجز العضو"
        from={2 * fps}
        durationInFrames={reservationHandoffFrames}
        premountFor={fps}
      >
        <ReservationHandoff />
      </Sequence>
    </AbsoluteFill>
  );
};
