import {
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Caption, Header, Lens, Stage, settle } from "./Stage";

export const ProductTogether = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Stage dark>
      <Header dark />
      <Caption dark sub="ملف العضو وخدمات النادي. في نظام واحد.">
        فريقك يعرف الخطوة التالية.
      </Caption>
      <Interactive.Div
        name="ملف العضو في المنظومة"
        style={{
          position: "absolute",
          inset: 0,
          translate: interpolate(
            frame,
            [0, fps],
            ["130px 70px", "0px 0px"],
            settle,
          ),
        }}
      >
        <Lens
          file="gates/membership.png"
          x={960}
          y={245}
          zoom={1.7}
          left={995}
          top={418}
          width={790}
          height={450}
        />
      </Interactive.Div>
      <Interactive.Div
        name="خدمة العضو في المنظومة"
        style={{
          position: "absolute",
          inset: 0,
          translate: interpolate(
            frame,
            [0, fps],
            ["-130px 70px", "0px 0px"],
            settle,
          ),
        }}
      >
        <Lens
          file="kitchen/03-ready.jpg"
          x={237}
          y={800}
          zoom={1.55}
          left={135}
          top={418}
          width={790}
          height={450}
        />
      </Interactive.Div>
      <Interactive.Div
        name="صلة التشغيل"
        style={{
          position: "absolute",
          top: 941,
          left: 100,
          right: 100,
          textAlign: "center",
          fontSize: 37,
          color: "#90e8b9",
        }}
      >
        من الاشتراك إلى الخدمة، التفاصيل معك.
      </Interactive.Div>
    </Stage>
  );
};
