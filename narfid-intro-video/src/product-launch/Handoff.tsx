import {
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Caption, Header, Lens, Stage, clamp, glide, settle } from "./Stage";

export const ProductHandoff = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Stage>
      <Header />
      <Caption sub="اشتراك الوجبات في الملف. والطلب عند فريق المطبخ.">
        من الاشتراك… إلى الخدمة.
      </Caption>
      <Interactive.Div
        name="الاشتراك والطلب"
        style={{
          position: "absolute",
          inset: 0,
          translate: interpolate(
            frame,
            [0, 0.8 * fps],
            ["0px 80px", "0px 0px"],
            settle,
          ),
        }}
      >
        <Lens
          file="gates/membership.png"
          x={980}
          y={780}
          zoom={1.2}
          left={960}
          top={394}
          width={800}
          height={550}
        />
        <Interactive.Svg
          name="صلة بين القسمين"
          width={120}
          height={100}
          viewBox="0 0 120 100"
          style={{ position: "absolute", left: 840, top: 625 }}
        >
          <path
            d="M110 50H10M28 32L10 50L28 68"
            stroke="#168052"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={300}
            strokeDashoffset={interpolate(
              frame,
              [1.1 * fps, 2 * fps],
              [300, 0],
              glide,
            )}
          />
        </Interactive.Svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: interpolate(frame, [1.4 * fps, 2.1 * fps], [0, 1], clamp),
            translate: interpolate(
              frame,
              [1.4 * fps, 2.4 * fps],
              ["50px 0px", "0px 0px"],
              settle,
            ),
          }}
        >
          <Lens
            file="kitchen/01-new.jpg"
            x={1090}
            y={820}
            zoom={1.4}
            left={160}
            top={394}
            width={660}
            height={550}
          />
        </div>
      </Interactive.Div>
    </Stage>
  );
};
