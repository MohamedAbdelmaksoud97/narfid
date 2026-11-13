import {
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Stage, Header, Headline, Screen, clamp, settle, green } from "./Stage";
export const ClubDayTogether = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Stage dark>
      <Header dark />
      <Headline dark>تفاصيل مترابطة</Headline>
      <Interactive.Div
        name="الاشتراكات"
        style={{
          position: "absolute",
          inset: 0,
          translate: interpolate(
            f,
            [0, fps],
            ["100px 70px", "0px 0px"],
            settle,
          ),
        }}
      >
        <Screen
          file="club-day/member-after.jpg"
          x={0.5}
          y={0.36}
          zoom={0.68}
          left={1260}
          top={420}
          width={540}
          height={390}
        />
        <div
          style={{
            position: "absolute",
            top: 845,
            right: 120,
            width: 540,
            textAlign: "center",
            fontSize: 39,
            fontWeight: 700,
          }}
        >
          الاشتراكات
        </div>
      </Interactive.Div>
      <Interactive.Div
        name="الحجوزات"
        style={{
          position: "absolute",
          inset: 0,
          translate: interpolate(
            f,
            [0.25 * fps, 1.25 * fps],
            ["0px 100px", "0px 0px"],
            settle,
          ),
        }}
      >
        <Screen
          file="club-day/booking-confirmed.jpg"
          x={0.5}
          y={0.35}
          zoom={0.68}
          left={690}
          top={420}
          width={540}
          height={390}
        />
        <div
          style={{
            position: "absolute",
            top: 845,
            left: 690,
            width: 540,
            textAlign: "center",
            fontSize: 39,
            fontWeight: 700,
          }}
        >
          الحجوزات
        </div>
      </Interactive.Div>
      <Interactive.Div
        name="التحصيل"
        style={{
          position: "absolute",
          inset: 0,
          translate: interpolate(
            f,
            [0.5 * fps, 1.5 * fps],
            ["-100px 70px", "0px 0px"],
            settle,
          ),
        }}
      >
        <Screen
          file="club-day/invoice.jpg"
          x={0.5}
          y={0.35}
          zoom={0.68}
          left={120}
          top={420}
          width={540}
          height={390}
        />
        <div
          style={{
            position: "absolute",
            top: 845,
            left: 120,
            width: 540,
            textAlign: "center",
            fontSize: 39,
            fontWeight: 700,
          }}
        >
          التحصيل
        </div>
      </Interactive.Div>
      <svg
        width="1680"
        height="70"
        viewBox="0 0 1680 70"
        style={{ position: "absolute", left: 120, top: 340 }}
      >
        <path
          d="M270 70V30H1410V70M840 30V70"
          stroke={green}
          strokeWidth="2"
          fill="none"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={interpolate(f, [0, 1.4 * fps], [1, 0], clamp)}
        />
      </svg>
      <Interactive.Div
        name="متابعة أوضح"
        style={{
          position: "absolute",
          top: 946,
          left: 100,
          right: 100,
          textAlign: "center",
          fontSize: 43,
          fontWeight: 700,
          color: green,
          opacity: interpolate(f, [2.3 * fps, 2.8 * fps], [0, 1], clamp),
        }}
      >
        متابعة أوضح ليوم ناديك
      </Interactive.Div>
    </Stage>
  );
};
