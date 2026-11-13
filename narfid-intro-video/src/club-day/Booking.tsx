import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Stage, Header, Headline, Screen, Result, clamp, glide } from "./Stage";
import { Pointer } from "../product-launch/Stage";
export const ClubDayBooking = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Stage>
      <Header />
      <Headline>الموعد. السعة. حالة الحجز.</Headline>
      <Screen
        file="club-day/booking-form.jpg"
        x={0.5}
        y={interpolate(
          f,
          [0, 1.2 * fps, 3.3 * fps, 5.8 * fps],
          [0.22, 0.22, 0.31, 0.31],
          glide,
        )}
        zoom={1.85}
      />
      <AbsoluteFill
        style={{
          opacity: interpolate(f, [6.1 * fps, 6.4 * fps], [0, 1], clamp),
        }}
      >
        <Screen
          file="club-day/booking-confirmed.jpg"
          x={interpolate(
            f,
            [6.1 * fps, 6.6 * fps, 7.5 * fps],
            [0.415, 0.415, 0.33],
            glide,
          )}
          y={0.35}
          zoom={interpolate(f, [6.1 * fps, 8.6 * fps], [1.22, 1.7], glide)}
        >
          <Pointer
            x={315}
            y={567}
            opacity={interpolate(f, [6.4 * fps, 6.8 * fps], [0, 1], clamp)}
          />
        </Screen>
      </AbsoluteFill>
      <Result at={6.4}>حجز مؤكّد. قبل بداية الحصة.</Result>
    </Stage>
  );
};
