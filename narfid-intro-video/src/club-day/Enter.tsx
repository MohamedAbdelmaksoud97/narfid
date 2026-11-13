import {
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Stage, Header, Headline, Screen, settle } from "./Stage";
export const ClubDayEnter = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Stage>
      <Header />
      <Headline note="الاشتراكات · الحجوزات · التحصيل">
        ابدأ من مكان واحد
      </Headline>
      <Interactive.Div
        name="الدخول إلى النظام"
        style={{
          position: "absolute",
          inset: 0,
          translate: interpolate(
            f,
            [0, 1.3 * fps],
            ["0px 220px", "0px 0px"],
            settle,
          ),
          scale: interpolate(f, [0, 5.7 * fps], [0.91, 1], settle),
          transformOrigin: "50% 100%",
        }}
      >
        <Screen
          file="club-day/member-before.jpg"
          x={0.415}
          y={0.29}
          zoom={1.04}
        />
      </Interactive.Div>
    </Stage>
  );
};
