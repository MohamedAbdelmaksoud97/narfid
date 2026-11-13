import {
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Stage, Header, clamp, settle, green } from "./Stage";
export const ClubDayPromise = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Stage dark>
      <Header dark />
      <Interactive.Div
        name="تشغيل أوضح"
        style={{
          position: "absolute",
          top: 330,
          left: 100,
          right: 100,
          textAlign: "center",
          fontSize: 126,
          fontWeight: 800,
          lineHeight: 1.25,
          opacity: interpolate(f, [0.2 * fps, 0.7 * fps], [0, 1], clamp),
          translate: interpolate(
            f,
            [0, 1.1 * fps],
            ["0px 40px", "0px 0px"],
            settle,
          ),
        }}
      >
        تشغيل <span style={{ color: green }}>أوضح</span> اليوم
      </Interactive.Div>
      <Interactive.Div
        name="أساس ينمو"
        style={{
          position: "absolute",
          top: 545,
          left: 100,
          right: 100,
          textAlign: "center",
          fontSize: 83,
          fontWeight: 700,
          lineHeight: 1.4,
          opacity: interpolate(f, [2.5 * fps, 3.1 * fps], [0, 1], clamp),
          translate: interpolate(
            f,
            [2.5 * fps, 3.5 * fps],
            ["0px 32px", "0px 0px"],
            settle,
          ),
        }}
      >
        أساس تقني <span style={{ color: green }}>ينمو معك</span> غدًا
      </Interactive.Div>
      <div
        style={{
          position: "absolute",
          top: 790,
          left: 710,
          width: 500,
          height: 2,
          background: "linear-gradient(90deg,transparent,#54dda1,transparent)",
          scale: interpolate(f, [0, 2 * fps], [0.1, 1], settle),
        }}
      />
    </Stage>
  );
};
