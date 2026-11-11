import {
  Interactive,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Descriptor, Rings, Stage, clamp, ease } from "./Stage";

const Detail = ({ title, subtitle }: { title: string; subtitle: string }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Interactive.Div
      name="تفصيل يومي"
      style={{
        position: "absolute",
        top: 805,
        left: 90,
        right: 90,
        opacity: interpolate(
          frame,
          [0, 0.35 * fps, 2.2 * fps, 2.5 * fps],
          [0, 1, 1, 0],
          clamp,
        ),
        translate: interpolate(
          frame,
          [0, 0.7 * fps, 2.2 * fps, 2.5 * fps],
          ["0px 55px", "0px 0px", "0px 0px", "0px -45px"],
          ease,
        ),
      }}
    >
      <div style={{ fontSize: 154, fontWeight: 800, lineHeight: 1.4 }}>
        {title}
      </div>
      <div style={{ fontSize: 48, color: "#77e6ad", marginTop: 45 }}>
        {subtitle}
      </div>
    </Interactive.Div>
  );
};

export const BrandDetails = () => {
  const { fps } = useVideoConfig();
  return (
    <Stage>
      <Descriptor />
      <Rings />
      <Sequence name="العضويات" durationInFrames={2.5 * fps} premountFor={fps}>
        <Detail title="عضويات" subtitle="من أول اشتراك إلى كل تجديد" />
      </Sequence>
      <Sequence
        name="الحجوزات"
        from={2.5 * fps}
        durationInFrames={2.5 * fps}
        premountFor={fps}
      >
        <Detail title="حجوزات" subtitle="للملاعب والحصص والتدريب" />
      </Sequence>
      <Sequence
        name="التحصيل"
        from={5 * fps}
        durationInFrames={2.5 * fps}
        premountFor={fps}
      >
        <Detail title="تحصيل" subtitle="فواتير ومدفوعات قابلة للمتابعة" />
      </Sequence>
    </Stage>
  );
};
