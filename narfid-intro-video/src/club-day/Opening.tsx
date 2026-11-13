import {
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Stage, Header, clamp, settle, green } from "./Stage";
export const ClubDayOpening = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Stage dark>
      <Header dark />
      <Interactive.Div
        name="سياق يوم النادي"
        style={{
          position: "absolute",
          top: 220,
          right: 170,
          fontSize: 42,
          color: "#9bbdab",
        }}
      >
        في يوم ناديك…
      </Interactive.Div>
      <Interactive.Div
        name="سؤال التجديد"
        style={{
          position: "absolute",
          top: 327,
          right: 170,
          fontSize: 112,
          fontWeight: 800,
          opacity: interpolate(frame, [0.5 * fps, 0.9 * fps], [0, 1], clamp),
          translate: interpolate(
            frame,
            [0.5 * fps, 1.25 * fps],
            ["0px 36px", "0px 0px"],
            settle,
          ),
        }}
      >
        من جدّد؟
      </Interactive.Div>
      <Interactive.Div
        name="سؤال الحجز"
        style={{
          position: "absolute",
          top: 505,
          right: 320,
          fontSize: 112,
          fontWeight: 800,
          color: green,
          opacity: interpolate(frame, [2 * fps, 2.4 * fps], [0, 1], clamp),
          translate: interpolate(
            frame,
            [2 * fps, 2.75 * fps],
            ["0px 36px", "0px 0px"],
            settle,
          ),
        }}
      >
        هل تأكّد الحجز؟
      </Interactive.Div>
      <Interactive.Div
        name="سؤال التحصيل"
        style={{
          position: "absolute",
          top: 689,
          right: 170,
          fontSize: 112,
          fontWeight: 800,
          opacity: interpolate(frame, [3.5 * fps, 3.9 * fps], [0, 1], clamp),
          translate: interpolate(
            frame,
            [3.5 * fps, 4.25 * fps],
            ["0px 36px", "0px 0px"],
            settle,
          ),
        }}
      >
        كم تحصّل؟
      </Interactive.Div>
      <svg
        width="550"
        height="650"
        viewBox="0 0 550 650"
        style={{ position: "absolute", left: 120, top: 250, opacity: 0.5 }}
      >
        <path
          d="M80 20V160Q80 210 130 210H410Q460 210 460 260V440Q460 490 410 490H180Q130 490 130 540V630"
          stroke="#54dda1"
          strokeWidth="2"
          fill="none"
          strokeDasharray="8 12"
        />
        <circle cx="80" cy="20" r="9" fill={green} />
        <circle cx="130" cy="630" r="9" fill={green} />
      </svg>
    </Stage>
  );
};
