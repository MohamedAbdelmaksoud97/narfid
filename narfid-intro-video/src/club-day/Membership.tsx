import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Stage, Header, Headline, Screen, Result, clamp, glide } from "./Stage";
import { Pointer } from "../product-launch/Stage";
export const ClubDayMembership = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const x = interpolate(
    f,
    [0, 2 * fps, 3.4 * fps, 8.5 * fps],
    [0.415, 0.415, 0.415, 0.415],
    glide,
  );
  const y = interpolate(
    f,
    [0, 2 * fps, 3.4 * fps, 8.5 * fps],
    [0.3, 0.3, 0.34, 0.34],
    glide,
  );
  const zoom = interpolate(
    f,
    [0, 2 * fps, 3.4 * fps, 8.5 * fps],
    [1.05, 1.05, 1.35, 1.4],
    glide,
  );
  return (
    <Stage>
      <Header />
      <Headline>من الاشتراك… إلى التجديد</Headline>
      <Screen file="club-day/member-before.jpg" x={x} y={y} zoom={zoom} />
      <AbsoluteFill
        style={{
          opacity: interpolate(f, [3.2 * fps, 3.5 * fps], [0, 1], clamp),
        }}
      >
        <Screen
          file="club-day/member-renew.jpg"
          x={0.5}
          y={interpolate(
            f,
            [3.2 * fps, 4.3 * fps, 5.4 * fps, 6.1 * fps],
            [0.29, 0.29, 0.37, 0.37],
            glide,
          )}
          zoom={1.9}
        >
          <Pointer
            x={interpolate(f, [4.7 * fps, 5.5 * fps], [920, 602], glide)}
            y={interpolate(f, [4.7 * fps, 5.5 * fps], [580, 692], glide)}
            opacity={interpolate(
              f,
              [4.7 * fps, 5 * fps, 6.1 * fps],
              [0, 1, 1],
              clamp,
            )}
            click={interpolate(
              f,
              [5.7 * fps, 5.8 * fps, 6.1 * fps],
              [0, 1, 0],
              clamp,
            )}
          />
        </Screen>
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          opacity: interpolate(f, [6.1 * fps, 6.4 * fps], [0, 1], clamp),
        }}
      >
        <Screen
          file="club-day/member-after.jpg"
          x={interpolate(
            f,
            [6.1 * fps, 6.6 * fps, 7.5 * fps],
            [0.415, 0.415, 0.25],
            glide,
          )}
          y={0.41}
          zoom={interpolate(
            f,
            [6.1 * fps, 6.6 * fps, 7.5 * fps],
            [1.28, 1.28, 2.1],
            glide,
          )}
        />
      </AbsoluteFill>
      <Result at={6.4}>تجديد مدفوع. ومدة جديدة مسجّلة.</Result>
    </Stage>
  );
};
