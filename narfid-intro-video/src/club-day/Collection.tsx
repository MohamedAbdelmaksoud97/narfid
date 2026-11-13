import {
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Stage, Header, Screen, Headline, clamp, glide } from "./Stage";
export const ClubDayCollection = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Stage>
      <Header />
      <Interactive.Div
        name="عنوان الفاتورة"
        style={{
          opacity: interpolate(f, [2.3 * fps, 2.7 * fps], [1, 0], clamp),
        }}
      >
        <Headline>فاتورتك واضحة</Headline>
      </Interactive.Div>
      <Interactive.Div
        name="عنوان التحصيل"
        style={{
          opacity: interpolate(f, [2.7 * fps, 3.1 * fps], [0, 1], clamp),
        }}
      >
        <Headline>المحصّل والمتبقي أمامك</Headline>
      </Interactive.Div>
      <Screen
        file="club-day/invoice.jpg"
        x={interpolate(
          f,
          [0, 2.4 * fps, 4 * fps, 8.7 * fps],
          [0.43, 0.43, 0.515, 0.515],
          glide,
        )}
        y={interpolate(
          f,
          [0, 2.4 * fps, 4 * fps, 8.7 * fps],
          [0.24, 0.24, 0.3, 0.3],
          glide,
        )}
        zoom={interpolate(
          f,
          [0, 2.4 * fps, 4 * fps, 8.7 * fps],
          [1.2, 1.2, 1.65, 1.65],
          glide,
        )}
      >
        <div
          style={{
            position: "absolute",
            left: 674,
            top: 414,
            width: 304,
            height: 132,
            border: "2px solid #54dda1",
            borderRadius: 24,
            opacity: interpolate(
              f,
              [3 * fps, 3.2 * fps, 5.2 * fps, 5.5 * fps],
              [0, 1, 1, 0],
              clamp,
            ),
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 354,
            top: 414,
            width: 304,
            height: 132,
            border: "2px solid #54dda1",
            borderRadius: 24,
            opacity: interpolate(f, [5.5 * fps, 5.7 * fps], [0, 1], clamp),
          }}
        />
      </Screen>
      <Interactive.Div
        name="معنى الأرقام"
        style={{
          position: "absolute",
          bottom: 48,
          right: 100,
          left: 100,
          textAlign: "center",
          fontSize: 37,
          fontWeight: 700,
          color: "#1a6844",
          opacity: interpolate(f, [5.5 * fps, 5.9 * fps], [0, 1], clamp),
        }}
      >
        تابع العملية وراء الرقم.
      </Interactive.Div>
    </Stage>
  );
};
